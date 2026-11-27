import { MetadataRoute } from 'next'
import { getPublicEvents } from './[locale]/(marketing)/events/public-data'
import { getPublishedNews } from './[locale]/(marketing)/news/actions'
import { getGalleryGroups } from './[locale]/(marketing)/gallery/actions'
import { eventPublicHref } from '@/lib/event-ui'
import { newsArticleHref } from '@/lib/news-ui'
import {
  getActiveRobofestCategories,
  getRobofestCategoryHref,
  getRobofestContent,
} from '@/lib/robofest-content'
import { getSiteOrigin } from '@/lib/site-config'
import { LEGAL_PAGES } from '@/lib/legal'
import { localizePath, routing } from '@/i18n/routing'

export const revalidate = 3600

/**
 * Every public page exists in English (unprefixed) and Bangla (`/bn`).
 * Emit both URLs with reciprocal hreflang alternates.
 */
function withLocaleAlternates(baseUrl: string, entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return entries.flatMap((entry) => {
    const path = entry.url.slice(baseUrl.length) || '/'
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${baseUrl}${localizePath(path, locale)}`]),
    )
    return routing.locales.map((locale) => ({
      ...entry,
      url: `${baseUrl}${localizePath(path, locale)}`,
      alternates: { languages },
    }))
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/robofest`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...LEGAL_PAGES.map((page) => ({
      url: `${baseUrl}${page.href}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]

  let robofestPages: MetadataRoute.Sitemap = []
  try {
    const content = await getRobofestContent()
    const categories = getActiveRobofestCategories(content)
    robofestPages = categories.map((category) => ({
      url: `${baseUrl}${getRobofestCategoryHref(category.slug)}`,
      lastModified: content.updatedAt
        ? new Date(content.updatedAt)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error generating Robofest sitemap entries:', error)
  }

  let newsPages: MetadataRoute.Sitemap = []
  try {
    const articles = await getPublishedNews()
    newsPages = articles.flatMap((article) => {
      const lastModified = article.updatedAt
        ? new Date(article.updatedAt)
        : article.publishedAt
          ? new Date(article.publishedAt)
          : new Date(article.createdAt)

      const entries: MetadataRoute.Sitemap = [
        {
          url: `${baseUrl}${newsArticleHref(article)}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        },
      ]

      const hasPhotos =
        Boolean(article.coverImageUrl) ||
        (Array.isArray(article.images) && article.images.length > 0)

      if (hasPhotos) {
        entries.push({
          url: `${baseUrl}${newsArticleHref(article)}/photos`,
          lastModified,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        })
      }

      return entries
    })
  } catch (error) {
    console.error('Error generating news sitemap entries:', error)
  }

  let galleryPages: MetadataRoute.Sitemap = []
  try {
    const groups = await getGalleryGroups()
    galleryPages = groups.map((group) => ({
      url: `${baseUrl}/gallery/album/${group.id}`,
      lastModified: group.updatedAt
        ? new Date(group.updatedAt)
        : group.createdAt
          ? new Date(group.createdAt)
          : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error generating gallery sitemap entries:', error)
  }

  try {
    const events = await getPublicEvents()
    const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${baseUrl}${eventPublicHref(event)}`,
      lastModified: event.updatedAt
        ? new Date(event.updatedAt)
        : event.createdAt
          ? new Date(event.createdAt)
          : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return withLocaleAlternates(baseUrl, [
      ...staticPages,
      ...robofestPages,
      ...newsPages,
      ...galleryPages,
      ...eventPages,
    ])
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return withLocaleAlternates(baseUrl, [...staticPages, ...robofestPages, ...newsPages, ...galleryPages])
  }
}
