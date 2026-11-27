import type { ReactNode } from 'react'
import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LEGAL_LAST_UPDATED, LEGAL_PAGES } from '@/lib/legal'
import { SITE_CONFIG } from '@/lib/site-config'

const LINK_CLASS = 'font-medium text-indigo-600 underline-offset-2 hover:underline'

export type LegalPageKey = (typeof LEGAL_PAGES)[number]['key']

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

/** Parse LEGAL_LAST_UPDATED ("27 November 2026") into a Date (noon in Dhaka). */
function parseLegalDate(value: string): Date | null {
  const match = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value.trim())
  if (!match) return null
  const month = MONTHS.indexOf(match[2].toLowerCase())
  if (month < 0) return null
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 6))
}

type LegalPageProps = {
  pageKey: LegalPageKey
  intro?: ReactNode
  children: ReactNode
}

export async function LegalPage({ pageKey, intro, children }: LegalPageProps) {
  const locale = await getLocale()
  const t = await getTranslations('legal.page')
  const tLinks = await getTranslations('common.legalLinks')
  const format = await getFormatter()

  const current = LEGAL_PAGES.find((p) => p.key === pageKey)
  const date = parseLegalDate(LEGAL_LAST_UPDATED)
  const lastUpdated = date
    ? format.dateTime(date, { day: 'numeric', month: 'long', year: 'numeric' })
    : LEGAL_LAST_UPDATED

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {tLinks(pageKey)}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{t('lastUpdated', { date: lastUpdated })}</p>
        {locale !== 'en' && current ? (
          <p
            lang={locale}
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
          >
            {t.rich('englishPrevails', {
              link: (chunks) => (
                <Link href={current.href} locale="en" hrefLang="en" className={LINK_CLASS}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        ) : null}
        {intro ? <div className="mt-6 text-base leading-relaxed text-gray-700">{intro}</div> : null}

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-800 sm:text-[1.05rem] sm:leading-[1.75]">
          {children}
        </div>

        <nav
          aria-label={t('navLabel')}
          className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-600"
        >
          <p className="mb-2 font-semibold text-slate-800">{t('related')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_PAGES.filter((p) => p.key !== pageKey).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={LINK_CLASS}>
                  {tLinks(p.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  )
}

export function LegalSection({
  title,
  id,
  children,
}: {
  title: string
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5">{children}</ul>
}

/** Internal links use the locale-aware Link; absolute http(s) links open in a new tab. */
export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {children}
      </a>
    )
  }
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={LINK_CLASS}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  )
}

type RichValues = Record<string, string | number>

function link(href: string) {
  return function RichLegalLink(chunks: ReactNode) {
    return <LegalLink href={href}>{chunks}</LegalLink>
  }
}

/**
 * Shared values and tags for legal messages: `{name}`, `{email}`, `{phone}` plus
 * `<strong>`, `<mail>`, `<tel>`, internal policy links and the external opt-out links.
 */
const LEGAL_RICH = {
  name: SITE_CONFIG.name,
  email: SITE_CONFIG.email,
  phone: SITE_CONFIG.phone,
  strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
  mail: link(`mailto:${SITE_CONFIG.email}`),
  tel: link(`tel:${SITE_CONFIG.phone}`),
  privacy: link('/privacy'),
  terms: link('/terms'),
  refund: link('/refund-policy'),
  cookies: link('/cookies'),
  conduct: link('/code-of-conduct'),
  contact: link('/contact'),
  site: link(SITE_CONFIG.url),
  partnerSites: link('https://policies.google.com/technologies/partner-sites'),
  googleCookies: link('https://policies.google.com/technologies/cookies'),
  adsSettings: link('https://www.google.com/settings/ads'),
  naiOptout: link('https://optout.networkadvertising.org/'),
  gaOptout: link('https://tools.google.com/dlpage/gaoptout'),
}

/**
 * Translation helpers for one legal document (`legal.<page>` namespace).
 * `rich(key)` renders a message with the shared tags; `items(key)` renders every
 * entry of a message group as `<li>` elements, in JSON order.
 */
export async function getLegalContent(page: string) {
  const t = await getTranslations(`legal.${page}`)
  const rich = (key: string, values?: RichValues) => t.rich(key, { ...LEGAL_RICH, ...values })
  const items = (key: string, values?: RichValues) =>
    Object.keys(t.raw(key) as Record<string, unknown>).map((k) => (
      <li key={k}>{rich(`${key}.${k}`, values)}</li>
    ))
  return { t, rich, items }
}
