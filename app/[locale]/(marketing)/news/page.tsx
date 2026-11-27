import { Metadata } from 'next'
import { buildLocalizedPageMetadata } from '@/lib/seo-metadata'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ADSENSE_SLOT_DISPLAY } from '@/lib/adsense'
import AdUnit from '@/components/ads/AdUnit'
import { getPublishedNews } from './actions'
import NewsHero from '@/components/news/NewsHero'
import FeaturedNewsCard from '@/components/news/FeaturedNewsCard'
import NewsCard from '@/components/news/NewsCard'
import NewsEmptyState from '@/components/news/NewsEmptyState'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'news' })
  return buildLocalizedPageMetadata('news', locale, {
    path: '/news',
    absoluteTitle: true,
    ogImage: {
      url: '/roboclass.jpg',
      width: 1200,
      height: 630,
      alt: t('meta.ogAlt'),
    },
  })
}

// Rendered per request: the build has no D1 access, so a build-time prerender
// would bake in an empty list and serve it until the next revalidation.
export const dynamic = 'force-dynamic'

export default async function NewsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('news')
  const articles = await getPublishedNews()
  const [featured, ...rest] = articles

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80 flex flex-col">
      <NewsHero />

      <main className="relative flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-indigo-50/50 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          {articles.length === 0 ? (
            <NewsEmptyState />
          ) : (
            <div className="space-y-12 sm:space-y-14 md:space-y-16">
              <section aria-labelledby="featured-story-heading">
                <h2 id="featured-story-heading" className="sr-only">
                  {t('list.featuredHeading')}
                </h2>
                <FeaturedNewsCard article={featured} />
              </section>

              <AdUnit slot={ADSENSE_SLOT_DISPLAY} />

              {rest.length > 0 ? (
                <section aria-labelledby="latest-stories-heading">
                  <div className="mb-6 sm:mb-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
                      {t('list.fromCommunity')}
                    </p>
                    <h2
                      id="latest-stories-heading"
                      className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                    >
                      {t('list.latestStories')}
                    </h2>
                  </div>
                  <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
                    {rest.map((article) => (
                      <li key={article.id} className="min-w-0">
                        <NewsCard article={article} />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
