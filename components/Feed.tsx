import dynamic from 'next/dynamic'
import { HOME_FAQ_ITEMS } from '@/lib/home-faq'
import { resolveCourseHref } from '@/lib/course-ui'
import Hero from './Hero'
import FeatureBento from './FeatureBento'
import CourseShowcase from './CourseShowcase'
import { HomeSection } from './home-section'
import type { Course } from '@/types/course'
import type { Event } from '@/types/event'
import type { HomepageOrg } from '@/types/homepage-org'
import { Skeleton } from '@/components/ui/skeleton'

const FeedDeferredFromMission = dynamic(() => import('./FeedDeferredFromMission'), {
  loading: () => (
    <div className="min-h-[48vh] bg-slate-950 py-12" aria-busy>
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
        <Skeleton className="h-8 w-1/3 bg-white/10" />
        <Skeleton className="h-4 w-1/2 bg-white/10" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full bg-white/10" />
          <Skeleton className="h-40 w-full bg-white/10" />
        </div>
      </div>
    </div>
  ),
})

interface FeedProps {
  initialCourses?: Course[]
  initialUpcomingEvents?: Event[]
  initialPartners?: HomepageOrg[]
  initialWorkshopSchools?: HomepageOrg[]
}

export default function Feed({
  initialCourses = [],
  initialUpcomingEvents = [],
  initialPartners = [],
  initialWorkshopSchools = [],
}: FeedProps) {
  const courses = initialCourses
    .filter((course) => !course.isArchived)
    .map((course) => ({
      id: course.id,
      title: course.title,
      level: course.level,
      blurb: course.blurb,
      href: resolveCourseHref(course.href),
      img: course.image,
    }))

  return (
    <div className="w-full min-w-full">
      <Hero upcomingEvents={initialUpcomingEvents} />

      <HomeSection tone="wash" showOrbs>
        <FeatureBento />
      </HomeSection>

      <HomeSection tone="white">
        <CourseShowcase courses={courses} />
      </HomeSection>

      <FeedDeferredFromMission
        faqItems={HOME_FAQ_ITEMS}
        partners={initialPartners.map((org) => ({
          name: org.name,
          logo: org.logoUrl,
        }))}
        workshopSchools={initialWorkshopSchools.map((org) => ({
          name: org.name,
          logo: org.logoUrl,
        }))}
      />
    </div>
  )
}
