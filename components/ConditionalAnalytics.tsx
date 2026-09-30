'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { locales } from '@/i18n/routing'

const GA_MEASUREMENT_ID = 'G-X87SJ4G3R7'

/** Strip `/bn` (or other locale) so checks like `/dashboard` still match. */
function stripLocalePrefix(pathname: string | null): string {
  if (!pathname) return ''
  for (const locale of locales) {
    if (pathname === `/${locale}`) return '/'
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/'
    }
  }
  return pathname
}

/**
 * Loads GA only outside /dashboard to cut third-party requests on admin routes.
 */
export default function ConditionalAnalytics() {
  const pathname = stripLocalePrefix(usePathname())
  if (pathname.startsWith('/dashboard')) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
      </Script>
    </>
  )
}
