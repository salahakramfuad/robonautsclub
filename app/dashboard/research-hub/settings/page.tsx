import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCreateOrEdit } from '@/lib/auth'
import { dhakaToday } from '@/lib/research-hub/shared'
import { getResearchHubSettings, listUpcomingClosures } from '@/lib/research-hub/store'
import { SITE_CONFIG } from '@/lib/site-config'
import SettingsForm from './SettingsForm'
import ClosuresManager from './ClosuresManager'

export const dynamic = 'force-dynamic'

export default async function ResearchHubSettingsPage() {
  await requireCreateOrEdit('researchHub')
  const [settings, closures] = await Promise.all([
    getResearchHubSettings(),
    listUpcomingClosures(dhakaToday()).catch(() => []),
  ])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/research-hub"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="size-4" aria-hidden /> Research Hub
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Research Hub settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Price, capacity and opening hours for public bookings. Changes apply immediately to new bookings; existing
          bookings keep the price they paid.
        </p>
      </div>
      <SettingsForm initial={{ ...settings, location: settings.location || SITE_CONFIG.location }} />
      <ClosuresManager
        closures={closures.map((c) => ({
          id: c.id,
          date: c.date,
          startHour: c.startHour,
          endHour: c.endHour,
          reason: c.reason ?? '',
        }))}
      />
    </div>
  )
}
