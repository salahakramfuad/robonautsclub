import { requireAuth } from '@/lib/auth'
import {
  getRobofestCampusAmbassadors,
  getRobofestDashboardContent,
  getRobofestRegistrationsPage,
  getRobofestRegistrationStatusCounts,
} from './actions'
import RobofestDashboardClient from './RobofestDashboardClient'

export const dynamic = 'force-dynamic'

export default async function RobofestDashboardPage() {
  await requireAuth()
  const defaultFilters = { status: 'pending' as const }
  const [content, registrationPage, statusCounts, campusAmbassadors] =
    await Promise.all([
      getRobofestDashboardContent(),
      getRobofestRegistrationsPage({ filters: defaultFilters }),
      getRobofestRegistrationStatusCounts(),
      getRobofestCampusAmbassadors(),
    ])

  return (
    <div className="w-full min-w-0 max-w-none">
      <RobofestDashboardClient
        initialContent={content}
        initialRegistrations={registrationPage.items}
        initialNextCursor={registrationPage.nextCursor}
        initialHasMore={registrationPage.hasMore}
        initialStatusCounts={statusCounts}
        schools={[]}
        campusAmbassadors={campusAmbassadors}
      />
    </div>
  )
}
