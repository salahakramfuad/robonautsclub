import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  // English keeps today's unprefixed URLs (QR codes, emails, bKash callbacks);
  // Bangla lives under /bn.
  localePrefix: 'as-needed',
  // The URL is the only source of truth so pages stay static/ISR.
  localeDetection: false,
})

export type AppLocale = (typeof routing.locales)[number]

/** Prefix an unprefixed app path (e.g. `/events`) for the given locale. */
export function localizePath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) return path
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}
