import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import HtmlLang from '@/components/HtmlLang'

/**
 * Message subtrees used by client components. Server-only text (legal pages,
 * SEO, payment results…) stays on the server instead of riding along in every
 * page's RSC payload. Add a path here when a client component needs it.
 */
const CLIENT_MESSAGE_PATHS = [
  'common',
  'home',
  'contact',
  'courses',
  'events',
  'faq',
  'gallery',
  'news',
  'robofest',
  'verify',
  'about.map',
  'legal.consent',
] as const

type MessageTree = { [key: string]: string | MessageTree }

function pickMessages(messages: MessageTree, paths: readonly string[]): MessageTree {
  const out: MessageTree = {}
  for (const path of paths) {
    const parts = path.split('.')
    let src: string | MessageTree | undefined = messages
    for (const part of parts) src = typeof src === 'object' ? src[part] : undefined
    if (src === undefined) continue
    let dst = out
    for (const part of parts.slice(0, -1)) dst = (dst[part] ??= {}) as MessageTree
    dst[parts[parts.length - 1]] = src
  }
  return out
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const isBangla = locale === 'bn'
  const clientMessages = pickMessages((await getMessages()) as MessageTree, CLIENT_MESSAGE_PATHS)

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <HtmlLang locale={locale} />
      <div
        lang={locale}
        className={isBangla ? 'locale-bn' : undefined}
      >
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
