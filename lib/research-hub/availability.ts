import { isFeatureEnabledFresh } from '@/lib/feature-flags'
import {
  addDays,
  dhakaSlotStart,
  dhakaToday,
  isValidDateString,
  weekdayOf,
  type DayAvailability,
  type ResearchHubSettings,
} from './shared'
import { getClosuresForDate, getOccupancy, getResearchHubSettings } from './store'

function closedDay(
  date: string,
  settings: ResearchHubSettings,
  reason: NonNullable<DayAvailability['reason']>,
  closureReason?: string,
): DayAvailability {
  return {
    date,
    open: false,
    reason,
    closureReason,
    capacity: settings.seatsPerHour,
    rate: settings.ratePerPersonHour,
    minHours: settings.minHours,
    maxHours: settings.maxHours,
    maxPersons: settings.maxPersonsPerBooking,
    hours: [],
  }
}

/**
 * Seats left per opening hour for one Dhaka date.
 * `ignoreFlag` lets staff (walk-in bookings) see availability while public booking is paused.
 */
export async function getDayAvailability(
  date: string,
  opts: { now?: Date; ignoreFlag?: boolean; settings?: ResearchHubSettings } = {},
): Promise<DayAvailability> {
  const now = opts.now ?? new Date()
  const settings = opts.settings ?? (await getResearchHubSettings())

  if (!isValidDateString(date)) return closedDay(date, settings, 'invalidDate')
  if (!settings.configured || settings.ratePerPersonHour <= 0) {
    return closedDay(date, settings, 'notConfigured')
  }
  if (!opts.ignoreFlag && !(await isFeatureEnabledFresh('registration.researchHub'))) {
    return closedDay(date, settings, 'paused')
  }

  const today = dhakaToday(now)
  if (date < today || (!opts.ignoreFlag && date > addDays(today, settings.bookingHorizonDays))) {
    return closedDay(date, settings, 'outOfRange')
  }

  const opening = settings.openingHours[weekdayOf(date)]
  if (!opening.open) return closedDay(date, settings, 'closedDay')

  const [closures, occupancy] = await Promise.all([getClosuresForDate(date), getOccupancy(date, now)])
  const fullDay = closures.find((c) => c.startHour == null || c.endHour == null)
  if (fullDay) return closedDay(date, settings, 'closure', fullDay.reason ?? undefined)

  const earliest = now.getTime() + (opts.ignoreFlag ? 0 : settings.minLeadMinutes * 60_000)
  const hours = []
  for (let hour = opening.start; hour < opening.end; hour++) {
    const closed = closures.some((c) => hour >= (c.startHour ?? 0) && hour < (c.endHour ?? 24))
    // Staff may add a walk-in for the hour already in progress.
    const startsAt = dhakaSlotStart(date, hour).getTime() + (opts.ignoreFlag ? 60 * 60_000 : 0)
    const seatsLeft = Math.max(0, settings.seatsPerHour - (occupancy.get(hour) ?? 0))
    hours.push({
      hour,
      seatsLeft: closed ? 0 : seatsLeft,
      bookable: !closed && seatsLeft > 0 && startsAt > earliest,
    })
  }

  return {
    date,
    open: hours.some((h) => h.bookable),
    capacity: settings.seatsPerHour,
    rate: settings.ratePerPersonHour,
    minHours: settings.minHours,
    maxHours: settings.maxHours,
    maxPersons: settings.maxPersonsPerBooking,
    hours,
  }
}

export type SlotCheck =
  | { ok: true }
  | { ok: false; reason: 'closed' | 'duration' | 'persons' | 'unavailable' | 'notEnoughSeats' }

/** Validate a requested range against a day's availability (the DB guard is the final say). */
export function checkSlotRequest(
  day: DayAvailability,
  startHour: number,
  hours: number,
  persons: number,
  opts: { ignoreLimits?: boolean } = {},
): SlotCheck {
  if (!day.open) return { ok: false, reason: 'closed' }
  if (!Number.isInteger(hours) || hours < 1 || (!opts.ignoreLimits && (hours < day.minHours || hours > day.maxHours))) {
    return { ok: false, reason: 'duration' }
  }
  if (!Number.isInteger(persons) || persons < 1 || (!opts.ignoreLimits && persons > day.maxPersons)) {
    return { ok: false, reason: 'persons' }
  }
  for (let h = startHour; h < startHour + hours; h++) {
    const slot = day.hours.find((s) => s.hour === h)
    if (!slot || !slot.bookable) return { ok: false, reason: 'unavailable' }
    if (slot.seatsLeft < persons) return { ok: false, reason: 'notEnoughSeats' }
  }
  return { ok: true }
}
