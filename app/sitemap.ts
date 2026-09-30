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

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteOrigin()

  const staticPageDefs = [
    { path: '/', changeFrequency: 'daily' as const, priority: 1 },
    { path: '/events', changeFrequency: 'daily' as const, priority: 0.9 },
    { path: '/robofest', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/news', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/gallery', changeFrequency: 'weekly' as const, priority: 0.85 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  const staticPages: MetadataRoute.Sitemap = staticPageDefs.flatMap((page) => {
    const lastModified = new Date()
    const enUrl = page.path === '/' ? `${baseUrl}/` : `${baseUrl}${page.path}`
    const bnUrl = page.path === '/' ? `${baseUrl}/bn` : `${baseUrl}/bn${page.path}`
    return [
      {
        url: enUrl,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      },
      {
        url: bnUrl,
        lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      },
    ]
  })

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

    return [
      ...staticPages,
      ...robofestPages,
      ...newsPages,
      ...galleryPages,
      ...eventPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return [...staticPages, ...robofestPages, ...newsPages, ...galleryPages]
  }
}
