/**
 * Research Hub D1 access. Seat-changing writes use raw guarded SQL so the
 * capacity check and the write happen in one statement (SQLite serializes
 * writes, so two people cannot both take the last seats).
 */
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { and, asc, desc, eq, gte, like, lte, or } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { newId } from '@/lib/db/documents'
import {
  researchHubBookings,
  researchHubClosures,
  researchHubSettings,
} from '@/lib/db/schema'
import {
  DEFAULT_RESEARCH_HUB_CONTENT,
  DEFAULT_RESEARCH_HUB_SETTINGS,
  HOLD_MINUTES,
  INVENTORY_CATEGORIES,
  MAX_HUB_PHOTOS,
  MAX_INVENTORY_ITEMS,
  OCCUPYING_STATUSES,
  WEEKDAYS,
  type BookingStatus,
  type InventoryCategory,
  type ResearchHubContent,
  type ResearchHubSettings,
} from './shared'

export type ResearchHubBooking = typeof researchHubBookings.$inferSelect
export type ResearchHubClosure = typeof researchHubClosures.$inferSelect

const SETTINGS_ID = 'main'
/** Public page content lives in the same table under its own id. */
const CONTENT_ID = 'content'

async function d1(): Promise<CloudflareEnv['DB']> {
  const { env } = await getCloudflareContext({ async: true })
  const binding = (env as CloudflareEnv).DB
  if (!binding) throw new Error('D1 binding DB is missing.')
  return binding
}

/** SQL fragment: booking `b` currently occupies seats. Binds one param: now ISO. */
const OCCUPIES_SQL = `(b.status IN (${OCCUPYING_STATUSES.map((s) => `'${s}'`).join(',')}) OR (b.status = 'held' AND b.hold_expires_at > ?))`

// ---------------------------------------------------------------- settings

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/** Coerce stored/submitted settings into a safe shape. */
export function normalizeSettings(raw: Partial<ResearchHubSettings> | null | undefined): ResearchHubSettings {
  const d = DEFAULT_RESEARCH_HUB_SETTINGS
  const r = raw ?? {}
  const openingHours = { ...d.openingHours }
  for (const day of WEEKDAYS) {
    const src = r.openingHours?.[day]
    if (!src) continue
    const start = Math.floor(num(src.start, d.openingHours[day].start, 0, 23))
    const end = Math.floor(num(src.end, d.openingHours[day].end, 1, 24))
    openingHours[day] = { open: Boolean(src.open) && end > start, start, end: Math.max(end, start + 1) }
  }
  const minHours = Math.floor(num(r.minHours, d.minHours, 1, 12))
  return {
    configured: Boolean(r.configured),
    ratePerPersonHour: num(r.ratePerPersonHour, d.ratePerPersonHour, 0, 100000),
    seatsPerHour: Math.floor(num(r.seatsPerHour, d.seatsPerHour, 1, 500)),
    openingHours,
    minHours,
    maxHours: Math.max(minHours, Math.floor(num(r.maxHours, d.maxHours, 1, 24))),
    maxPersonsPerBooking: Math.floor(num(r.maxPersonsPerBooking, d.maxPersonsPerBooking, 1, 500)),
    bookingHorizonDays: Math.floor(num(r.bookingHorizonDays, d.bookingHorizonDays, 1, 365)),
    minLeadMinutes: Math.floor(num(r.minLeadMinutes, d.minLeadMinutes, 0, 7 * 24 * 60)),
    cancellationCutoffHours: Math.floor(num(r.cancellationCutoffHours, d.cancellationCutoffHours, 0, 24 * 30)),
    location: typeof r.location === 'string' ? r.location.slice(0, 300) : '',
  }
}

export async function getResearchHubSettings(): Promise<ResearchHubSettings> {
  try {
    const db = await getDb()
    const [row] = await db
      .select()
      .from(researchHubSettings)
      .where(eq(researchHubSettings.id, SETTINGS_ID))
      .limit(1)
    if (!row) return { ...DEFAULT_RESEARCH_HUB_SETTINGS }
    return normalizeSettings(JSON.parse(row.payload) as Partial<ResearchHubSettings>)
  } catch (error) {
    // Table missing (migration not applied) → treat the hub as not configured (closed).
    console.error('[research-hub] failed to load settings', error)
    return { ...DEFAULT_RESEARCH_HUB_SETTINGS }
  }
}

export async function saveResearchHubSettings(settings: ResearchHubSettings, updatedBy: string): Promise<void> {
  const db = await getDb()
  const now = new Date().toISOString()
  const payload = JSON.stringify({ ...settings, configured: true })
  await db
    .insert(researchHubSettings)
    .values({ id: SETTINGS_ID, payload, updatedAt: now, updatedBy })
    .onConflictDoUpdate({
      target: researchHubSettings.id,
      set: { payload, updatedAt: now, updatedBy },
    })
}

// ---------------------------------------------------------------- page content

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function lines(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : []
  return list
    .map((l) => str(l, 300))
    .filter(Boolean)
    .slice(0, 20)
}

export function normalizeContent(raw: Partial<ResearchHubContent> | null | undefined): ResearchHubContent {
  const r = raw ?? {}
  const photos = (Array.isArray(r.photos) ? r.photos : [])
    .map((p) => ({ url: str(p?.url, 500), alt: str(p?.alt, 200) }))
    .filter((p) => /^https:\/\/res\.cloudinary\.com\//.test(p.url))
    .slice(0, MAX_HUB_PHOTOS)
  const inventory = (Array.isArray(r.inventory) ? r.inventory : [])
    .map((item) => {
      const qty = Number(item?.quantity)
      const category = (INVENTORY_CATEGORIES as readonly string[]).includes(String(item?.category))
        ? (item.category as InventoryCategory)
        : 'components'
      return {
        id: str(item?.id, 40) || newId(),
        name: str(item?.name, 120),
        category,
        quantity: item?.quantity == null || item?.quantity === ('' as unknown) || !Number.isFinite(qty) ? null : Math.max(0, Math.floor(qty)),
        note: str(item?.note, 200),
      }
    })
    .filter((item) => item.name)
    .slice(0, MAX_INVENTORY_ITEMS)
  return {
    introEn: str(r.introEn, 600),
    introBn: str(r.introBn, 600),
    rulesEn: lines(r.rulesEn),
    rulesBn: lines(r.rulesBn),
    photos,
    inventory,
  }
}

export async function getResearchHubContent(): Promise<ResearchHubContent> {
  try {
    const db = await getDb()
    const [row] = await db
      .select()
      .from(researchHubSettings)
      .where(eq(researchHubSettings.id, CONTENT_ID))
      .limit(1)
    if (!row) return { ...DEFAULT_RESEARCH_HUB_CONTENT }
    return normalizeContent(JSON.parse(row.payload) as Partial<ResearchHubContent>)
  } catch (error) {
    console.error('[research-hub] failed to load content', error)
    return { ...DEFAULT_RESEARCH_HUB_CONTENT }
  }
}

export async function saveResearchHubContent(content: ResearchHubContent, updatedBy: string): Promise<void> {
  const db = await getDb()
  const now = new Date().toISOString()
  const payload = JSON.stringify(content)
  await db
    .insert(researchHubSettings)
    .values({ id: CONTENT_ID, payload, updatedAt: now, updatedBy })
    .onConflictDoUpdate({
      target: researchHubSettings.id,
      set: { payload, updatedAt: now, updatedBy },
    })
}

// ---------------------------------------------------------------- closures

export async function getClosuresForDate(date: string): Promise<ResearchHubClosure[]> {
  const db = await getDb()
  return db.select().from(researchHubClosures).where(eq(researchHubClosures.date, date))
}

export async function listUpcomingClosures(fromDate: string): Promise<ResearchHubClosure[]> {
  const db = await getDb()
  return db
    .select()
    .from(researchHubClosures)
    .where(gte(researchHubClosures.date, fromDate))
    .orderBy(asc(researchHubClosures.date), asc(researchHubClosures.startHour))
}

export async function addClosure(input: {
  date: string
  startHour: number | null
  endHour: number | null
  reason: string
  createdBy: string
}): Promise<void> {
  const db = await getDb()
  await db.insert(researchHubClosures).values({
    id: newId(),
    date: input.date,
    startHour: input.startHour,
    endHour: input.endHour,
    reason: input.reason || null,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  })
}

export async function deleteClosure(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(researchHubClosures).where(eq(researchHubClosures.id, id))
}

// ---------------------------------------------------------------- occupancy

/** Seats taken per hour on a date (only hours with bookings are present). */
export async function getOccupancy(date: string, now: Date = new Date()): Promise<Map<number, number>> {
  const db = await d1()
  const { results } = await db
    .prepare(
      `SELECT h.hour AS hour, SUM(h.persons) AS taken
       FROM research_hub_booking_hours h
       JOIN research_hub_bookings b ON b.id = h.booking_id
       WHERE h.date = ? AND ${OCCUPIES_SQL}
       GROUP BY h.hour`,
    )
    .bind(date, now.toISOString())
    .all<{ hour: number; taken: number }>()
  return new Map(results.map((r: { hour: number; taken: number }) => [Number(r.hour), Number(r.taken)]))
}

export async function countActiveHoldsForPhone(phone: string, now: Date = new Date()): Promise<number> {
  const db = await d1()
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM research_hub_bookings
       WHERE phone = ? AND status = 'held' AND hold_expires_at > ?`,
    )
    .bind(phone, now.toISOString())
    .first<{ n: number }>()
  return Number(row?.n ?? 0)
}

// ---------------------------------------------------------------- holds

function hoursList(startHour: number, hours: number): number[] {
  return Array.from({ length: hours }, (_, i) => startHour + i)
}

/**
 * Guard: no requested hour would exceed capacity. Binds, in order:
 * hours JSON, date, now ISO, persons, capacity.
 */
const CAPACITY_GUARD_SQL = `NOT EXISTS (
  SELECT 1 FROM json_each(?) r
  WHERE (
    SELECT COALESCE(SUM(h.persons), 0)
    FROM research_hub_booking_hours h
    JOIN research_hub_bookings b ON b.id = h.booking_id
    WHERE h.date = ? AND h.hour = r.value AND ${OCCUPIES_SQL}
  ) + ? > ?
)`

export type NewBookingInput = {
  date: string
  startHour: number
  hours: number
  persons: number
  capacity: number
  name: string
  email: string
  phone: string
  institution?: string
  purpose?: string
  plannedComponents?: string
  groupMembers?: string
  rate: number
  amount: number
  locale?: string
  paymentGateway: 'bkash' | 'manual'
  /** `held` for online checkout, `confirmed` for staff walk-ins. */
  status: 'held' | 'confirmed'
  notes?: string
}

function randomChars(length: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

function makeBookingCode(date: string): string {
  return `RH-${date.slice(2).replace(/-/g, '')}-${randomChars(5)}`
}

function makeManageToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Atomically create a booking and its hour rows if every hour has room.
 * Returns null when the seats are no longer available.
 */
export async function createBookingIfSeatsAvailable(
  input: NewBookingInput,
  now: Date = new Date(),
): Promise<ResearchHubBooking | null> {
  const db = await d1()
  const id = newId()
  const code = makeBookingCode(input.date)
  const nowIso = now.toISOString()
  const holdExpiresAt =
    input.status === 'held' ? new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString() : null
  const hoursJson = JSON.stringify(hoursList(input.startHour, input.hours))

  const insertBooking = db
    .prepare(
      `INSERT INTO research_hub_bookings (
        id, code, manage_token, date, start_hour, hours, persons, status, hold_expires_at,
        name, email, phone, institution, purpose, planned_components, group_members,
        rate, amount, payment_gateway, locale, notes, created_at, updated_at
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE ${CAPACITY_GUARD_SQL}`,
    )
    .bind(
      id,
      code,
      makeManageToken(),
      input.date,
      input.startHour,
      input.hours,
      input.persons,
      input.status,
      holdExpiresAt,
      input.name,
      input.email,
      input.phone,
      input.institution || null,
      input.purpose || null,
      input.plannedComponents || null,
      input.groupMembers || null,
      input.rate,
      input.amount,
      input.paymentGateway,
      input.locale || null,
      input.notes || null,
      nowIso,
      nowIso,
      // guard params
      hoursJson,
      input.date,
      nowIso,
      input.persons,
      input.capacity,
    )

  // Only inserts hour rows if the guarded booking insert above succeeded.
  const insertHours = db
    .prepare(
      `INSERT INTO research_hub_booking_hours (booking_id, date, hour, persons)
       SELECT ?, ?, r.value, ? FROM json_each(?) r
       WHERE EXISTS (SELECT 1 FROM research_hub_bookings WHERE id = ?)`,
    )
    .bind(id, input.date, input.persons, hoursJson, id)

  const [bookingResult] = await db.batch([insertBooking, insertHours])
  if (!bookingResult.meta.changes) return null
  return getBookingById(id)
}

/**
 * Re-take seats for a booking whose hold lapsed while the payer was on bKash.
 * Succeeds only if the booking is still `held`/`expired` and its hours still fit.
 */
export async function reclaimHold(booking: ResearchHubBooking, capacity: number, now: Date = new Date()): Promise<boolean> {
  const db = await d1()
  const nowIso = now.toISOString()
  const holdExpiresAt = new Date(now.getTime() + 5 * 60_000).toISOString()
  const result = await db
    .prepare(
      `UPDATE research_hub_bookings
       SET status = 'held', hold_expires_at = ?, updated_at = ?
       WHERE id = ? AND status IN ('held', 'expired') AND ${CAPACITY_GUARD_SQL}`,
    )
    .bind(
      holdExpiresAt,
      nowIso,
      booking.id,
      JSON.stringify(hoursList(booking.startHour, booking.hours)),
      booking.date,
      nowIso,
      booking.persons,
      capacity,
    )
    .run()
  return Boolean(result.meta.changes)
}

/**
 * Push a still-live hold forward so it cannot lapse while bKash executes.
 * Returns false if the hold already lapsed (caller should try reclaimHold).
 */
export async function extendLiveHold(id: string, now: Date = new Date()): Promise<boolean> {
  const db = await d1()
  const nowIso = now.toISOString()
  const result = await db
    .prepare(
      `UPDATE research_hub_bookings SET hold_expires_at = ?, updated_at = ?
       WHERE id = ? AND status = 'held' AND hold_expires_at > ?`,
    )
    .bind(new Date(now.getTime() + 5 * 60_000).toISOString(), nowIso, id, nowIso)
    .run()
  return Boolean(result.meta.changes)
}

/** Release an unpaid hold. Never touches confirmed bookings. */
export async function releaseHold(id: string): Promise<boolean> {
  const db = await d1()
  const nowIso = new Date().toISOString()
  const result = await db
    .prepare(
      `UPDATE research_hub_bookings SET status = 'cancelled', cancelled_at = ?, updated_at = ?
       WHERE id = ? AND status IN ('held', 'expired')`,
    )
    .bind(nowIso, nowIso, id)
    .run()
  return Boolean(result.meta.changes)
}

export async function attachPaymentId(id: string, paymentId: string): Promise<void> {
  const db = await getDb()
  await db
    .update(researchHubBookings)
    .set({ paymentId, updatedAt: new Date().toISOString() })
    .where(eq(researchHubBookings.id, id))
}

/** held → confirmed after payment. Returns false if the booking was not held. */
export async function confirmHeldBooking(
  id: string,
  payment: { paymentId: string; trxId: string; amountPaid: number },
): Promise<boolean> {
  const db = await d1()
  const nowIso = new Date().toISOString()
  const result = await db
    .prepare(
      `UPDATE research_hub_bookings
       SET status = 'confirmed', hold_expires_at = NULL, payment_id = ?, trx_id = ?, amount_paid = ?, updated_at = ?
       WHERE id = ? AND status = 'held'`,
    )
    .bind(payment.paymentId, payment.trxId, payment.amountPaid, nowIso, id)
    .run()
  return Boolean(result.meta.changes)
}

export async function markRefunded(id: string, refundTrxId: string | null, note: string): Promise<void> {
  const db = await getDb()
  const nowIso = new Date().toISOString()
  await db
    .update(researchHubBookings)
    .set({ status: 'cancelled', refundTrxId, notes: note, cancelledAt: nowIso, updatedAt: nowIso })
    .where(eq(researchHubBookings.id, id))
}

// ---------------------------------------------------------------- reads

export async function getBookingById(id: string): Promise<ResearchHubBooking | null> {
  const db = await getDb()
  const [row] = await db.select().from(researchHubBookings).where(eq(researchHubBookings.id, id)).limit(1)
  return row ?? null
}

export async function getBookingByCode(code: string): Promise<ResearchHubBooking | null> {
  const db = await getDb()
  const [row] = await db
    .select()
    .from(researchHubBookings)
    .where(eq(researchHubBookings.code, code.trim().toUpperCase()))
    .limit(1)
  return row ?? null
}

/** Bookings that matter for a day view (not abandoned holds). */
export async function listBookingsForDate(date: string): Promise<ResearchHubBooking[]> {
  const db = await getDb()
  return db
    .select()
    .from(researchHubBookings)
    .where(eq(researchHubBookings.date, date))
    .orderBy(asc(researchHubBookings.startHour), asc(researchHubBookings.createdAt))
}

export async function searchBookings(query: string, limit = 50): Promise<ResearchHubBooking[]> {
  const db = await getDb()
  const q = `%${query.trim()}%`
  return db
    .select()
    .from(researchHubBookings)
    .where(
      or(
        like(researchHubBookings.code, q.toUpperCase()),
        like(researchHubBookings.phone, q),
        like(researchHubBookings.email, q.toLowerCase()),
        like(researchHubBookings.name, q),
      ),
    )
    .orderBy(desc(researchHubBookings.createdAt))
    .limit(limit)
}

export async function listBookingsInRange(from: string, to: string): Promise<ResearchHubBooking[]> {
  const db = await getDb()
  return db
    .select()
    .from(researchHubBookings)
    .where(and(gte(researchHubBookings.date, from), lte(researchHubBookings.date, to)))
    .orderBy(asc(researchHubBookings.date), asc(researchHubBookings.startHour))
}

/** Staff status changes after a visit (check-in, completed, no-show). */
const STAFF_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  checked_in: ['confirmed', 'no_show'],
  completed: ['confirmed', 'checked_in'],
  no_show: ['confirmed'],
  confirmed: ['checked_in', 'no_show'],
}

export async function setStaffStatus(id: string, next: BookingStatus): Promise<boolean> {
  const allowedFrom = STAFF_TRANSITIONS[next]
  if (!allowedFrom) return false
  const db = await d1()
  const nowIso = new Date().toISOString()
  const result = await db
    .prepare(
      `UPDATE research_hub_bookings
       SET status = ?, checked_in_at = CASE WHEN ? = 'checked_in' THEN ? ELSE checked_in_at END, updated_at = ?
       WHERE id = ? AND status IN (${allowedFrom.map(() => '?').join(',')})`,
    )
    .bind(next, next, nowIso, nowIso, id, ...allowedFrom)
    .run()
  return Boolean(result.meta.changes)
}
