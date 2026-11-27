import { MetadataRoute } from 'next'
import { getSiteOrigin } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin()

  const privatePaths = ['/verify/', '/verify-booking', '/payments/']
  const disallow = [
    '/dashboard/',
    '/login/',
    '/api/',
    ...privatePaths,
    // Bangla copies of the same pages
    ...privatePaths.map((p) => `/bn${p}`),
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallow,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
