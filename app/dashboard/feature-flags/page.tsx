import { ToggleRight } from 'lucide-react'
import { requireSuperAdmin } from '@/lib/auth'
import { getFeatureFlagsFresh } from '@/lib/feature-flags'
import { FEATURE_FLAG_DEFS, parseAnnouncement } from '@/lib/feature-flags-shared'
import FeatureFlagsClient, { type FlagRow } from './FeatureFlagsClient'

export const dynamic = 'force-dynamic'

export default async function FeatureFlagsPage() {
  await requireSuperAdmin()
  const flags = await getFeatureFlagsFresh()

  const rows: FlagRow[] = FEATURE_FLAG_DEFS.filter((d) => !('hasText' in d && d.hasText)).map((d) => ({
    key: d.key,
    group: d.group,
    label: d.label,
    description: d.description,
    enabled: flags[d.key].enabled,
  }))
  const announcement = flags['banner.announcement']
  const parsed = parseAnnouncement(announcement.value)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <ToggleRight className="size-6" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature flags</h1>
          <p className="mt-1 text-sm text-gray-600">
            Switch site features on or off instantly — no deploy needed. Changes apply to the public site within a few seconds.
          </p>
        </div>
      </div>

      <FeatureFlagsClient
        rows={rows}
        announcement={{
          enabled: announcement.enabled,
          message: parsed?.message ?? '',
          href: parsed?.href ?? '',
        }}
      />
    </div>
  )
}
