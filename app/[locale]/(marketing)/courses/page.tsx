import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { buildPageMetadata } from '@/lib/seo-metadata'
import { SITE_CONFIG } from '@/lib/site-config'
import { COURSE_FALLBACK_HREF, courseAnchorId, resolveCourseHref } from '@/lib/course-ui'
import { notFound } from 'next/navigation'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { getPublicCourses } from '../events/public-data'
import CoursesExplorer, { type ExplorerCourse } from './CoursesExplorer'
import { getTranslations, setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'courses' })
  return buildPageMetadata({
    title: t('meta.title'),
    description: t('meta.description', { name: SITE_CONFIG.name }),
    path: '/courses',
    locale,
  })
}

// Rendered per request: the build has no D1 access, so a build-time prerender
// would bake in an empty list and serve it until the next revalidation.
export const dynamic = 'force-dynamic'

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('courses')
  if (!(await isFeatureEnabled('pages.courses'))) notFound()
  const courses = await getPublicCourses()

  const items: ExplorerCourse[] = courses
    .filter((c) => !c.isArchived)
    .map((c) => {
      const resolved = resolveCourseHref(c.href)
      return {
        id: c.id,
        anchor: courseAnchorId(c),
        title: c.title,
        // Empty level is shown as "All levels" (translated) by the explorer.
        level: c.level || '',
        blurb: c.blurb,
        image: c.image || undefined,
        externalHref: resolved.startsWith(COURSE_FALLBACK_HREF) ? undefined : resolved,
      }
    })

  return (
    <main id="main" className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#14264a] text-white">
        <div className="bg-tech-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-300">{t('hero.eyebrow')}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-200 sm:text-lg">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <CoursesExplorer courses={items} />

        <div className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('cta.title')}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {t('cta.body')}
            </p>
          </div>
          <Link
            href="/contact"
            prefetch={false}
            className="inline-flex h-11 items-center rounded-xl bg-[#1f3a6f] px-5 font-semibold text-white transition hover:bg-[#14264a]"
          >
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </main>
  )
}
