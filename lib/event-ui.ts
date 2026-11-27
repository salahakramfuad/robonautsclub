import type { Event } from '@/types/event'
import {
  BANGLADESH_TZ,
  bdWallTimeToUtcDate,
  formatEventDateLabel,
  formatEventDates,
  parseEventDates,
} from '@/lib/dateUtils'

/** Public event detail URL. Respects `href` overrides (e.g. Robofest). */
export function eventPublicHref(event: Pick<Event, 'id' | 'slug' | 'href'>): string {
  if (event.href) return event.href
  return `/events/${event.slug || event.id}`
}

// ---------------------------------------------------------------------------
// Locale-aware date labels for the public site.
// English delegates to the shared helpers in lib/dateUtils (unchanged output);
// Bangla is formatted here in Asia/Dhaka so the dashboard/emails/PDFs are untouched.
// ---------------------------------------------------------------------------

const BN_DATE_LOCALE = 'bn-BD'

function storedDateToInstant(value: string): Date | null {
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return bdWallTimeToUtcDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0, 0)
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatStoredDateBn(value: string, options: Intl.DateTimeFormatOptions): string {
  const instant = storedDateToInstant(value)
  if (!instant) return value
  return instant.toLocaleDateString(BN_DATE_LOCALE, { timeZone: BANGLADESH_TZ, ...options })
}

/** Locale-aware version of `formatEventDates`. */
export function formatEventDatesForLocale(
  dates: string[],
  locale: string,
  formatType: 'short' | 'long' = 'long',
): string {
  if (locale !== 'bn') return formatEventDates(dates, formatType)
  if (dates.length === 0) return 'তারিখ নির্ধারিত হয়নি'
  const longOpts: Intl.DateTimeFormatOptions =
    formatType === 'short'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' }
  const shortOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  if (dates.length === 1) return formatStoredDateBn(dates[0], longOpts)
  const range = `${formatStoredDateBn(dates[0], shortOpts)} - ${formatStoredDateBn(dates[dates.length - 1], longOpts)}`
  if (dates.length === 2) return range
  return `${range} (${new Intl.NumberFormat(BN_DATE_LOCALE).format(dates.length)}টি তারিখ)`
}

/** Locale-aware version of `formatEventDateLabel` (free-text CMS labels pass through). */
export function formatEventDateLabelForLocale(
  date: string | string[] | undefined,
  locale: string,
  formatType: 'short' | 'long' = 'long',
): string {
  if (locale !== 'bn') return formatEventDateLabel(date, formatType)
  const parts = parseEventDates(date)
  if (parts.length === 0) return 'ঘোষণা করা হবে'
  const looksLikeIso = (value: string) => /^\d{4}-\d{2}-\d{2}/.test(value.trim())
  if (parts.every((part) => !looksLikeIso(part))) {
    if (typeof date === 'string' && date.trim()) return date.trim()
    return parts.join(' · ')
  }
  return formatEventDatesForLocale(parts, locale, formatType)
}

/** Format an instant (e.g. a registration timestamp) as a long date for the locale. */
export function formatLongDateForLocale(date: Date, locale: string, withTime = false): string {
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale === 'bn' ? BN_DATE_LOCALE : 'en-US', {
    timeZone: BANGLADESH_TZ,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' } : {}),
  })
}
