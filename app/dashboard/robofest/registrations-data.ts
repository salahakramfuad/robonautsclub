import { FieldPath, type Query } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'
import {
  ROBOFEST_REGISTRATIONS_COLLECTION,
  mapRobofestRegistrationDoc,
  type RobofestRegistration,
  type RobofestRegistrationStatus,
} from '@/lib/robofest-content'
import { registrationMatchesNameFilter } from './registration-search'
import type {
  RobofestCampusAmbassadorReferralStats,
  RobofestRegistrationCursor,
  RobofestRegistrationListFilters,
  RobofestRegistrationPage,
  RobofestRegistrationStats,
  RobofestRegistrationStatusCounts,
} from './registrations-types'
import {
  EMPTY_ROBOFEST_CAMPUS_AMBASSADOR_REFERRAL_STATS,
  EMPTY_ROBOFEST_REGISTRATION_STATS,
} from './registrations-types'

export type {
  RobofestCampusAmbassadorReferralStats,
  RobofestRegistrationCursor,
  RobofestRegistrationListFilters,
  RobofestRegistrationPage,
  RobofestRegistrationStats,
  RobofestRegistrationStatusCounts,
} from './registrations-types'
export {
  EMPTY_ROBOFEST_CAMPUS_AMBASSADOR_REFERRAL_STATS,
  EMPTY_ROBOFEST_REGISTRATION_STATS,
} from './registrations-types'

export const ROBOFEST_REGISTRATIONS_PAGE_SIZE = 10

/** Soft cap for in-memory fallback while composite indexes are building. */
const FALLBACK_SCAN_LIMIT = 500

/** Cap for search / export-style full scans. */
const SEARCH_SCAN_LIMIT = 5000

function normalizeFilters(
  filters: RobofestRegistrationListFilters,
): RobofestRegistrationListFilters {
  return {
    status: filters.status,
    category: filters.category?.trim() || undefined,
    roundCity: filters.roundCity?.trim() || undefined,
    ageCategory: filters.ageCategory?.trim() || undefined,
    search: filters.search?.trim() || undefined,
  }
}

function createdAtToDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { code?: number | string; message?: string }
  return (
    err.code === 9 ||
    err.code === 'failed-precondition' ||
    /FAILED_PRECONDITION|requires an index/i.test(String(err.message || ''))
  )
}

function buildIndexedQuery(
  filters: RobofestRegistrationListFilters,
): Query | null {
  if (!adminDb) return null
  const f = normalizeFilters(filters)
  let q: Query = adminDb.collection(ROBOFEST_REGISTRATIONS_COLLECTION)
  q = q.where('status', '==', f.status)
  if (f.category) q = q.where('category', '==', f.category)
  if (f.roundCity) q = q.where('roundCity', '==', f.roundCity)
  if (f.ageCategory) q = q.where('ageCategory', '==', f.ageCategory)
  return q
    .orderBy('createdAt', 'desc')
    .orderBy(FieldPath.documentId(), 'desc')
}

function matchesExtraFilters(
  item: RobofestRegistration,
  filters: RobofestRegistrationListFilters,
): boolean {
  const f = normalizeFilters(filters)
  if (f.category && item.category !== f.category) return false
  if (f.roundCity && item.roundCity !== f.roundCity) return false
  if (f.ageCategory && item.ageCategory !== f.ageCategory) return false
  if (f.search && !registrationMatchesNameFilter(item, f.search)) return false
  return true
}

function compareNewestFirst(a: RobofestRegistration, b: RobofestRegistration) {
  const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
  const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
  if (tb !== ta) return tb - ta
  return b.id.localeCompare(a.id)
}

function isAfterCursor(
  item: RobofestRegistration,
  cursor: RobofestRegistrationCursor,
): boolean {
  const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0
  const cursorTime = new Date(cursor.createdAt).getTime()
  if (itemTime < cursorTime) return true
  if (itemTime > cursorTime) return false
  return item.id < cursor.id
}

function pageFromItems(
  items: RobofestRegistration[],
  cursor: RobofestRegistrationCursor | null | undefined,
  pageSize: number,
): RobofestRegistrationPage {
  let list = items
  if (cursor?.id && cursor.createdAt) {
    list = list.filter((item) => isAfterCursor(item, cursor))
  }
  const pageItems = list.slice(0, pageSize)
  const hasMore = list.length > pageSize
  const last = pageItems[pageItems.length - 1]
  return {
    items: pageItems,
    nextCursor:
      hasMore && last?.createdAt
        ? { createdAt: last.createdAt, id: last.id }
        : null,
    hasMore,
    matchedTotal: items.length,
  }
}

/**
 * Equality-only scan + in-memory sort/paginate.
 * Used when composite indexes are not ready yet, or when search is active.
 */
async function loadRobofestRegistrationsPageFallback(options: {
  filters: RobofestRegistrationListFilters
  cursor?: RobofestRegistrationCursor | null
  pageSize: number
  scanLimit?: number
}): Promise<RobofestRegistrationPage> {
  if (!adminDb) {
    return { items: [], nextCursor: null, hasMore: false, matchedTotal: 0 }
  }

  const f = normalizeFilters(options.filters)
  const scanLimit = options.scanLimit ?? FALLBACK_SCAN_LIMIT
  const snap = await adminDb
    .collection(ROBOFEST_REGISTRATIONS_COLLECTION)
    .where('status', '==', f.status)
    .limit(scanLimit)
    .get()

  const items = snap.docs
    .map((doc) =>
      mapRobofestRegistrationDoc(doc.id, doc.data() as Record<string, unknown>),
    )
    .filter((item) => matchesExtraFilters(item, f))
    .sort(compareNewestFirst)

  return pageFromItems(items, options.cursor, options.pageSize)
}

async function countIndexedFilters(
  filters: RobofestRegistrationListFilters,
): Promise<number | null> {
  try {
    const q = buildIndexedQuery(filters)
    if (!q) return null
    const snap = await q.count().get()
    return snap.data().count
  } catch (error) {
    if (!isMissingIndexError(error)) {
      console.warn(
        '[robofest] Filtered count failed:',
        error instanceof Error ? error.message : error,
      )
    }
    return null
  }
}

/**
 * Paginated Robofest registrations for the dashboard.
 * Kept outside `'use server'` so it can be called from RSC and server actions.
 */
export async function loadRobofestRegistrationsPage(options: {
  filters: RobofestRegistrationListFilters
  cursor?: RobofestRegistrationCursor | null
  pageSize?: number
}): Promise<RobofestRegistrationPage> {
  if (!adminDb) {
    return { items: [], nextCursor: null, hasMore: false, matchedTotal: 0 }
  }

  const pageSize = Math.min(
    Math.max(options.pageSize ?? ROBOFEST_REGISTRATIONS_PAGE_SIZE, 1),
    100,
  )
  const f = normalizeFilters(options.filters)
  const hasSearch = Boolean(f.search)
  const hasExtraFilters = Boolean(f.category || f.roundCity || f.ageCategory)

  // Substring search is not indexable — scan matching status (+ equality filters) in memory.
  if (hasSearch) {
    return loadRobofestRegistrationsPageFallback({
      filters: f,
      cursor: options.cursor,
      pageSize,
      scanLimit: SEARCH_SCAN_LIMIT,
    })
  }

  try {
    let q = buildIndexedQuery(f)
    if (!q) return { items: [], nextCursor: null, hasMore: false, matchedTotal: 0 }

    const cursor = options.cursor
    if (cursor?.id && cursor.createdAt) {
      const cursorDate = createdAtToDate(cursor.createdAt)
      if (cursorDate) {
        q = q.startAfter(cursorDate, cursor.id)
      }
    }

    const [snap, matchedTotal] = await Promise.all([
      q.limit(pageSize + 1).get(),
      hasExtraFilters ? countIndexedFilters(f) : Promise.resolve(null),
    ])
    const docs = snap.docs.slice(0, pageSize)
    const items = docs.map((doc) =>
      mapRobofestRegistrationDoc(doc.id, doc.data() as Record<string, unknown>),
    )

    const hasMore = snap.docs.length > pageSize
    const last = docs[docs.length - 1]
    let nextCursor: RobofestRegistrationCursor | null = null
    if (hasMore && last) {
      const createdAt =
        createdAtToDate(last.data().createdAt)?.toISOString() ||
        items[items.length - 1]?.createdAt
      if (createdAt) {
        nextCursor = { createdAt, id: last.id }
      }
    }

    return { items, nextCursor, hasMore, matchedTotal }
  } catch (error) {
    if (!isMissingIndexError(error)) throw error
    console.warn(
      '[robofest] Composite index missing; using status-only fallback. Create indexes via Firebase console or `firebase deploy --only firestore:indexes`.',
      error instanceof Error ? error.message : error,
    )
    return loadRobofestRegistrationsPageFallback({
      filters: f,
      cursor: options.cursor,
      pageSize,
    })
  }
}

/** Load all matching registrations for export (batched). */
export async function loadRobofestRegistrationsForExport(
  filters: RobofestRegistrationListFilters,
  maxDocs = 5000,
): Promise<RobofestRegistration[]> {
  const f = normalizeFilters(filters)

  // Search requires a full in-memory pass (same path as search paging).
  if (f.search) {
    const page = await loadRobofestRegistrationsPageFallback({
      filters: f,
      pageSize: maxDocs,
      scanLimit: Math.min(maxDocs, SEARCH_SCAN_LIMIT),
    })
    return page.items
  }

  const items: RobofestRegistration[] = []
  let cursor: RobofestRegistrationCursor | null = null
  const batchSize = 200

  while (items.length < maxDocs) {
    const page = await loadRobofestRegistrationsPage({
      filters: f,
      cursor,
      pageSize: Math.min(batchSize, maxDocs - items.length),
    })
    items.push(...page.items)
    if (!page.hasMore || !page.nextCursor) break
    cursor = page.nextCursor
  }

  return items
}

function participantCount(r: RobofestRegistration): number {
  if (typeof r.teamSize === 'number' && r.teamSize > 0) return r.teamSize
  if (Array.isArray(r.teamMembers) && r.teamMembers.length > 0) {
    return r.teamMembers.length
  }
  return 1
}

function aggregateRegistrationStats(
  items: RobofestRegistration[],
): RobofestRegistrationStats {
  const byCategory = new Map<string, number>()
  const byAge = new Map<string, number>()
  let paidTotal = 0
  let paidCount = 0
  let participants = 0

  for (const r of items) {
    const members = participantCount(r)
    participants += members
    byCategory.set(r.category, (byCategory.get(r.category) || 0) + members)
    if (r.ageCategory) {
      byAge.set(r.ageCategory, (byAge.get(r.ageCategory) || 0) + members)
    }
    if (r.paymentStatus === 'paid' && typeof r.amountPaid === 'number') {
      paidTotal += r.amountPaid
      paidCount += 1
    }
  }

  return {
    total: participants,
    registrations: items.length,
    byCategory: Array.from(byCategory.entries()),
    byAge: Array.from(byAge.entries()),
    paidTotal,
    paidCount,
  }
}

/**
 * Overview stats for every registration matching filters (not just the current page).
 * Reuses the same export scan path (indexed + missing-index/search fallback, 5000 cap).
 */
export async function loadRobofestRegistrationStats(
  filters: RobofestRegistrationListFilters,
): Promise<RobofestRegistrationStats> {
  if (!adminDb) return { ...EMPTY_ROBOFEST_REGISTRATION_STATS }
  const items = await loadRobofestRegistrationsForExport(filters)
  return aggregateRegistrationStats(items)
}

export async function loadRobofestRegistrationStatusCounts(): Promise<RobofestRegistrationStatusCounts> {
  const empty = { pending: 0, confirmed: 0, cancelled: 0 }
  if (!adminDb) return empty

  const collection = adminDb.collection(ROBOFEST_REGISTRATIONS_COLLECTION)
  const statuses: RobofestRegistrationStatus[] = [
    'pending',
    'confirmed',
    'cancelled',
  ]

  const results = await Promise.all(
    statuses.map(async (status) => {
      const snap = await collection.where('status', '==', status).count().get()
      return [status, snap.data().count] as const
    }),
  )

  const counts = { ...empty }
  for (const [status, count] of results) {
    counts[status] = count
  }
  return counts
}

/** Confirmed team + member totals keyed by campusAmbassadorId. */
export async function loadRobofestCampusAmbassadorReferralCounts(
  ambassadorIds: string[],
): Promise<Record<string, RobofestCampusAmbassadorReferralStats>> {
  const counts: Record<string, RobofestCampusAmbassadorReferralStats> = {}
  for (const id of ambassadorIds) {
    counts[id] = { ...EMPTY_ROBOFEST_CAMPUS_AMBASSADOR_REFERRAL_STATS }
  }
  if (!adminDb || ambassadorIds.length === 0) return counts

  const collection = adminDb.collection(ROBOFEST_REGISTRATIONS_COLLECTION)
  const results = await Promise.all(
    ambassadorIds.map(async (id) => {
      const snap = await collection
        .where('campusAmbassadorId', '==', id)
        .where('status', '==', 'confirmed')
        .select('teamSize', 'teamMembers')
        .get()

      let members = 0
      for (const doc of snap.docs) {
        const registration = mapRobofestRegistrationDoc(
          doc.id,
          doc.data() as Record<string, unknown>,
        )
        members += participantCount(registration)
      }

      return [id, { teams: snap.size, members }] as const
    }),
  )

  for (const [id, stats] of results) {
    counts[id] = stats
  }
  return counts
}

/** Load registrations by Firestore document ids (bulk certificates). */
export async function loadRobofestRegistrationsByIds(
  ids: string[],
  maxDocs = 500,
): Promise<RobofestRegistration[]> {
  if (!adminDb || ids.length === 0) return []

  const unique = Array.from(
    new Set(ids.map((id) => id.trim()).filter(Boolean)),
  ).slice(0, maxDocs)

  const results = await Promise.all(
    unique.map(async (id) => {
      const snap = await adminDb!
        .collection(ROBOFEST_REGISTRATIONS_COLLECTION)
        .doc(id)
        .get()
      if (!snap.exists) return null
      return mapRobofestRegistrationDoc(
        snap.id,
        snap.data() as Record<string, unknown>,
      )
    }),
  )

  return results.filter((r): r is RobofestRegistration => r != null)
}
