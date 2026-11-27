/**
 * Client-safe Research Hub types, defaults and Asia/Dhaka time helpers.
 * All dates are `YYYY-MM-DD` and hours are 0–23 on the Bangladesh wall clock (UTC+6, no DST).
 */

export const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000

export const WEEKDAYS = ['0', '1', '2', '3', '4', '5', '6'] as const
export type Weekday = (typeof WEEKDAYS)[number]

export type OpeningHours = { open: boolean; start: number; end: number }

export type ResearchHubSettings = {
  /** False until a staff member saves settings — the hub stays closed until then. */
  configured: boolean
  ratePerPersonHour: number
  seatsPerHour: number
  /** Keyed by JS weekday (0 = Sunday). `end` is exclusive (18 = last slot 17:00–18:00). */
  openingHours: Record<Weekday, OpeningHours>
  minHours: number
  maxHours: number
  maxPersonsPerBooking: number
  bookingHorizonDays: number
  /** How long before a slot starts it can still be booked. */
  minLeadMinutes: number
  cancellationCutoffHours: number
  /** Venue/address shown in emails and on the page. */
  location: string
}

export const DEFAULT_RESEARCH_HUB_SETTINGS: ResearchHubSettings = {
  configured: false,
  ratePerPersonHour: 0,
  seatsPerHour: 10,
  openingHours: {
    '0': { open: true, start: 10, end: 20 },
    '1': { open: true, start: 10, end: 20 },
    '2': { open: true, start: 10, end: 20 },
    '3': { open: true, start: 10, end: 20 },
    '4': { open: true, start: 10, end: 20 },
    '5': { open: false, start: 10, end: 20 },
    '6': { open: true, start: 10, end: 20 },
  },
  minHours: 1,
  maxHours: 6,
  maxPersonsPerBooking: 6,
  bookingHorizonDays: 30,
  minLeadMinutes: 60,
  cancellationCutoffHours: 24,
  location: '',
}

export const BOOKING_STATUSES = [
  'held',
  'confirmed',
  'checked_in',
  'completed',
  'no_show',
  'cancelled',
  'expired',
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

/** Statuses that occupy seats (plus `held` while its hold has not expired). */
export const OCCUPYING_STATUSES: BookingStatus[] = ['confirmed', 'checked_in', 'completed']

/** Minutes a seat hold lasts while the payer is on the bKash page. */
export const HOLD_MINUTES = 15
/** Max unpaid holds one phone number may have at once (stops seat-blocking abuse). */
export const MAX_ACTIVE_HOLDS_PER_PHONE = 2

export type HourAvailability = {
  hour: number
  seatsLeft: number
  /** False when closed, in the past/too soon, or full. */
  bookable: boolean
}

export type DayAvailability = {
  date: string
  open: boolean
  /** Why the day is closed, when `open` is false. */
  reason?: 'notConfigured' | 'paused' | 'closedDay' | 'closure' | 'outOfRange' | 'invalidDate'
  closureReason?: string
  capacity: number
  rate: number
  minHours: number
  maxHours: number
  maxPersons: number
  hours: HourAvailability[]
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/** Today's date in Asia/Dhaka. */
export function dhakaToday(now: Date = new Date()): string {
  return new Date(now.getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** JS weekday (0 = Sunday) for a YYYY-MM-DD date. */
export function weekdayOf(date: string): Weekday {
  const [y, m, d] = date.split('-').map(Number)
  return String(new Date(Date.UTC(y, m - 1, d)).getUTCDay()) as Weekday
}

/** The UTC instant at which `hour:00` starts on `date` in Dhaka. */
export function dhakaSlotStart(date: string, hour: number): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hour) - DHAKA_OFFSET_MS)
}

/** "14:00" style label. */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`
}

export function formatRange(startHour: number, hours: number): string {
  return `${formatHour(startHour)}–${formatHour(startHour + hours)}`
}

export function calculateAmount(rate: number, persons: number, hours: number): number {
  return Math.round(rate * persons * hours * 100) / 100
}

// ---------------------------------------------------------------- page content (dashboard-managed)

export const INVENTORY_CATEGORIES = ['boards', 'kits', 'sensors', 'components', 'tools', 'equipment'] as const
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  boards: 'Boards & microcontrollers',
  kits: 'Robotics kits',
  sensors: 'Sensors & modules',
  components: 'Electronic components',
  tools: 'Tools',
  equipment: 'Equipment & machines',
}

export type InventoryItem = {
  id: string
  name: string
  category: InventoryCategory
  /** Null = not counted (e.g. resistors). */
  quantity: number | null
  note: string
}

export type HubPhoto = { url: string; alt: string }

export type ResearchHubContent = {
  introEn: string
  introBn: string
  rulesEn: string[]
  rulesBn: string[]
  photos: HubPhoto[]
  inventory: InventoryItem[]
}

export const DEFAULT_RESEARCH_HUB_CONTENT: ResearchHubContent = {
  introEn: '',
  introBn: '',
  rulesEn: [],
  rulesBn: [],
  photos: [],
  inventory: [],
}

export const MAX_HUB_PHOTOS = 8
export const MAX_INVENTORY_ITEMS = 200
