import { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ArrowLeft } from 'lucide-react'
import { pickLocalized } from '@/lib/i18n-localized'
import { SITE_CONFIG } from '@/lib/site-config'
import { NEWS_ARTICLE_IMAGES_PREVIEW_MAX } from '@/lib/media-gallery'
import { effectiveNewsDisplayRaw } from '@/lib/publicContentDates'
import {
  collectArticleImageUrls,
  excerptBody,
  formatNewsDate,
  newsDateTimeAttr,
} from '@/lib/news-ui'
import { getArticleSchema, getBreadcrumbSchema } from '@/lib/seo'
import { buildPageMetadata } from '@/lib/seo-metadata'
import ArticleCoverLightbox from '@/components/ArticleCoverLightbox'
import ArticleGallery from '@/components/news/ArticleGallery'
import NewsCoverFallback from '@/components/news/NewsCoverFallback'
import { getNewsArticleBySlug } from '../actions'

export const revalidate = 1800

type Props = { params: Promise<{ locale: string; slug: string }> }

function toSchemaIso(raw: string | Date | null | undefined): string | undefined {
  if (!raw) return undefined
  const d = raw instanceof Date ? raw : new Date(raw)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const article = await getNewsArticleBySlug(slug)
  if (!article) {
    return { title: 'Article' }
  }

  const title = pickLocalized(locale, article.title, article.titleBn)
  const body = pickLocalized(locale, article.body, article.bodyBn)
  const description = excerptBody(body, 160)
  const path = `/news/${article.slug}`

  return buildPageMetadata({
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    path,
    absoluteTitle: true,
    locale,
    ogType: 'article',
    ogImage: article.coverImageUrl
      ? { url: article.coverImageUrl, alt: title }
      : {
          url: '/roboclass.jpg',
          width: 1200,
          height: 630,
          alt: title,
        },
  })
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug, locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('news.article')
  const tBreadcrumb = await getTranslations('breadcrumbs')
  const article = await getNewsArticleBySlug(slug)
  if (!article) notFound()

  const title = pickLocalized(locale, article.title, article.titleBn)
  const body = pickLocalized(locale, article.body, article.bodyBn)
  const extraImages = (article.images ?? []).filter(
    (u): u is string => typeof u === 'string' && Boolean(u.trim()),
  )
  const dateRaw = effectiveNewsDisplayRaw(article)
  const displayLabel = formatNewsDate(dateRaw)
  const allUrls = collectArticleImageUrls(article)
  const totalWithCover = allUrls.length
  const moreThanFourImages = totalWithCover > NEWS_ARTICLE_IMAGES_PREVIEW_MAX
  const photosHref = `/news/${article.slug}/photos`
  const extraPhotoCount = Math.max(0, totalWithCover - 1)
  const articlePath = `/news/${article.slug}`
  const description = excerptBody(body, 160)
  const datePublished = toSchemaIso(article.publishedAt ?? article.createdAt)
  const dateModified = toSchemaIso(article.updatedAt)

  const articleSchema = getArticleSchema({
    title,
    description,
    path: articlePath,
    imageUrl: article.coverImageUrl,
    datePublished,
    dateModified,
  })

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: tBreadcrumb('home'), url: '/' },
    { name: tBreadcrumb('news'), url: '/news' },
    { name: title, url: articlePath },
  ])

  return (
    <article className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="article-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/news"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to News
        </Link>

        <header className="mt-8 sm:mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
            Robonauts News
          </p>
          {displayLabel ? (
            <time
              dateTime={newsDateTimeAttr(dateRaw)}
              className="mt-3 block text-xs font-medium uppercase tracking-wider text-slate-500 sm:text-sm"
            >
              {displayLabel}
            </time>
          ) : null}
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold tracking-tight text-gray-900 sm:mt-4 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            {title}
          </h1>
        </header>

        <div className="mt-8 sm:mt-10">
          {article.coverImageUrl ? (
            <ArticleCoverLightbox
              coverUrl={article.coverImageUrl}
              extraUrls={extraImages}
              photoCountLabel={
                extraPhotoCount > 0
                  ? extraPhotoCount === 1
                    ? t('photoCountOne', { count: extraPhotoCount })
                    : t('photoCountOther', { count: extraPhotoCount })
                  : undefined
              }
            />
          ) : (
            <div className="relative mb-8 aspect-16/10 overflow-hidden rounded-2xl border border-slate-200/80 sm:aspect-2/1 sm:rounded-3xl md:mb-10">
              <NewsCoverFallback size="cover" />
            </div>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <div className="mx-auto max-w-[48rem] lg:mx-0">
              <p className="whitespace-pre-wrap text-base leading-[1.8] text-gray-800 sm:text-lg sm:leading-[1.85]">
                {body}
              </p>
            </div>

            {extraImages.length > 0 ? (
              <ArticleGallery
                images={extraImages}
                totalWithCover={totalWithCover}
                viewAllHref={moreThanFourImages ? photosHref : undefined}
              />
            ) : null}
          </div>

          <aside className="mt-10 hidden border-l border-slate-200/80 pl-6 lg:mt-0 lg:block">
            <div className="sticky top-28 space-y-6">
              {displayLabel ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {t('published')}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-gray-800">{displayLabel}</p>
                </div>
              ) : null}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {t('brand')}
                </p>
                <p className="mt-1.5 text-sm font-medium text-gray-800">{t('tagline')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
