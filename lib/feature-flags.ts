import { unstable_cache } from 'next/cache'
import { getDb, featureFlags } from '@/lib/db'
import {
  defaultFeatureFlags,
  isFeatureFlagKey,
  type FeatureFlagKey,
  type FeatureFlags,
} from '@/lib/feature-flags-shared'

export const FEATURE_FLAGS_TAG = 'feature-flags'

/** Throws on DB errors so a failure is never stored in the cache. */
async function loadFeatureFlagsStrict(): Promise<FeatureFlags> {
  const flags = defaultFeatureFlags()
  const db = await getDb()
  const rows = await db.select().from(featureFlags)
  for (const row of rows) {
    if (isFeatureFlagKey(row.key)) {
      flags[row.key] = { enabled: Boolean(row.enabled), value: row.value ?? null }
    }
  }
  return flags
}

async function loadFeatureFlagsFromDb(): Promise<FeatureFlags> {
  try {
    return await loadFeatureFlagsStrict()
  } catch (error) {
    // Table missing (migration not applied yet) or D1 hiccup: keep safe defaults.
    console.error('[feature-flags] Falling back to defaults:', error)
    return defaultFeatureFlags()
  }
}

/**
 * Cached for an hour and invalidated immediately by `revalidateTag(FEATURE_FLAGS_TAG)`
 * when a Super Admin changes a flag — so public pages never pay a D1 query per request.
 */
const getCachedFeatureFlags = unstable_cache(loadFeatureFlagsStrict, [FEATURE_FLAGS_TAG, 'v4'], {
  tags: [FEATURE_FLAGS_TAG],
  revalidate: 3600,
})

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    // Merge over defaults: a cache entry written before a flag existed must not crash readers.
    return { ...defaultFeatureFlags(), ...(await getCachedFeatureFlags()) }
  } catch (error) {
    // Errors are not cached, so the next request retries the database.
    console.error('[feature-flags] Falling back to defaults:', error)
    return defaultFeatureFlags()
  }
}

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFeatureFlags()
  return flags[key].enabled
}

/** Uncached read for server actions that enforce a flag (e.g. registration). */
export async function isFeatureEnabledFresh(key: FeatureFlagKey): Promise<boolean> {
  const flags = await loadFeatureFlagsFromDb()
  return flags[key].enabled
}

/** Uncached read for the dashboard editor. */
export async function getFeatureFlagsFresh(): Promise<FeatureFlags> {
  return loadFeatureFlagsFromDb()
}
