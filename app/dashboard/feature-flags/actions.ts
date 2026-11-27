'use server'
import { revalidateLocalizedPath } from '@/lib/revalidate-localized'

import { revalidateTag } from 'next/cache'
import { getServerSession } from '@/lib/auth'
import { getDb, featureFlags } from '@/lib/db'
import { FEATURE_FLAGS_TAG } from '@/lib/feature-flags'
import {
  FEATURE_FLAG_DEFS,
  isFeatureFlagKey,
  isSafeBannerHref,
  type AnnouncementValue,
} from '@/lib/feature-flags-shared'

type Result = { success: true } | { success: false; error: string }

const MAX_BANNER_MESSAGE = 200
const MAX_BANNER_HREF = 300

async function requireSuperAdminSession() {
  const session = await getServerSession()
  if (!session || session.role !== 'superAdmin') return null
  return session
}

async function writeFlag(key: string, enabled: boolean, value: string | null, updatedBy: string) {
  const db = await getDb()
  const now = new Date().toISOString()
  await db
    .insert(featureFlags)
    .values({ key, enabled, value, updatedAt: now, updatedBy })
    .onConflictDoUpdate({
      target: featureFlags.key,
      set: { enabled, value, updatedAt: now, updatedBy },
    })
}

/** Flags affect every public page (layout, nav, banner), so refresh them all. */
function invalidatePublicSite() {
  revalidateTag(FEATURE_FLAGS_TAG, 'max')
  revalidateLocalizedPath('/', 'layout')
}

export async function setFeatureFlag(key: string, enabled: boolean): Promise<Result> {
  const session = await requireSuperAdminSession()
  if (!session) return { success: false, error: 'Only Super Admins can change feature flags.' }
  if (!isFeatureFlagKey(key)) return { success: false, error: 'Unknown feature flag.' }

  try {
    // Preserve the stored text value (e.g. banner message) when only toggling.
    const db = await getDb()
    const existing = await db.query.featureFlags.findFirst({
      where: (t, { eq }) => eq(t.key, key),
    })
    await writeFlag(key, enabled, existing?.value ?? null, session.email)
    invalidatePublicSite()
    return { success: true }
  } catch (error) {
    console.error('[feature-flags] Failed to update flag:', error)
    return {
      success: false,
      error: 'Could not save. If this is the first use, the feature_flags migration may not be applied yet.',
    }
  }
}

export async function saveAnnouncement(input: {
  enabled: boolean
  message: string
  href: string
}): Promise<Result> {
  const session = await requireSuperAdminSession()
  if (!session) return { success: false, error: 'Only Super Admins can change feature flags.' }

  const message = input.message.trim().slice(0, MAX_BANNER_MESSAGE)
  const href = input.href.trim().slice(0, MAX_BANNER_HREF)
  if (input.enabled && !message) return { success: false, error: 'Write a message before turning the banner on.' }
  if (href && !isSafeBannerHref(href)) {
    return { success: false, error: 'Link must start with / (a page on this site) or https://' }
  }

  const value: AnnouncementValue = href ? { message, href } : { message }
  const def = FEATURE_FLAG_DEFS.find((d) => d.key === 'banner.announcement')!
  try {
    await writeFlag(def.key, input.enabled, JSON.stringify(value), session.email)
    invalidatePublicSite()
    return { success: true }
  } catch (error) {
    console.error('[feature-flags] Failed to save announcement:', error)
    return { success: false, error: 'Could not save the announcement. Please try again.' }
  }
}
