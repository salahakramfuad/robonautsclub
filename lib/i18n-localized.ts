import type { AppLocale } from '@/i18n/routing'

/** Prefer Bengali when locale is bn and a non-empty Bengali value exists. */
export function pickLocalized(
  locale: string | AppLocale,
  english: string | null | undefined,
  bengali?: string | null | undefined,
): string {
  if (locale === 'bn') {
    const bn = typeof bengali === 'string' ? bengali.trim() : ''
    if (bn) return bn
  }
  return typeof english === 'string' ? english : ''
}

export function pickLocalizedList(
  locale: string | AppLocale,
  english: readonly string[] | null | undefined,
  bengali?: readonly string[] | null | undefined,
): string[] {
  if (locale === 'bn' && Array.isArray(bengali) && bengali.some((s) => s?.trim())) {
    return bengali.map((s, i) => {
      const bn = typeof s === 'string' ? s.trim() : ''
      if (bn) return bn
      return typeof english?.[i] === 'string' ? english[i] : ''
    })
  }
  return Array.isArray(english) ? [...english] : []
}
