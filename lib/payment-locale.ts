import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { localizePath, routing } from '@/i18n/routing'

/**
 * bKash redirects back to a fixed, unprefixed callback URL. Remember the payer's
 * site language in a short-lived cookie so the callback can send them to the
 * result page in the same language.
 */
export const PAYMENT_LOCALE_COOKIE = 'payment-locale'

/** Call from a server action right before redirecting to bKash checkout. */
export async function rememberPaymentLocale(): Promise<void> {
  try {
    const locale = await getLocale()
    const secure = process.env.NODE_ENV === 'production'
    ;(await cookies()).set(PAYMENT_LOCALE_COOKIE, locale, {
      path: '/api/payments',
      maxAge: 60 * 60,
      httpOnly: true,
      secure,
      // bKash may return via a cross-site POST; Lax cookies would not be sent.
      sameSite: secure ? 'none' : 'lax',
    })
  } catch {
    // Locale is a nicety; never block checkout over it.
  }
}

/** Localize a result-page path (e.g. `/payments/bkash/success`) from the request cookie. */
export function localizePaymentPath(path: string, cookieValue: string | undefined): string {
  const locale = (routing.locales as readonly string[]).includes(cookieValue ?? '')
    ? (cookieValue as string)
    : routing.defaultLocale
  return localizePath(path, locale)
}
