import type { ReactNode } from 'react'
import Link from 'next/link'
import { LEGAL_PAGES } from '@/lib/legal'

const LINK_CLASS = 'font-medium text-indigo-600 underline-offset-2 hover:underline'

type LegalPageProps = {
  title: string
  lastUpdated: string
  intro?: ReactNode
  children: ReactNode
}

export function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50/80">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600 sm:text-xs">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {lastUpdated}</p>
        {intro ? <div className="mt-6 text-base leading-relaxed text-gray-700">{intro}</div> : null}

        <div className="mt-10 space-y-8 text-base leading-relaxed text-gray-800 sm:text-[1.05rem] sm:leading-[1.75]">
          {children}
        </div>

        <nav
          aria-label="Legal pages"
          className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-600"
        >
          <p className="mb-2 font-semibold text-slate-800">Related policies</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_PAGES.filter((p) => p.title !== title).map((p) => (
              <li key={p.href}>
                <Link href={p.href} className={LINK_CLASS}>
                  {p.title}
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

/** Internal links use next/link; absolute http(s) links open in a new tab. */
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
