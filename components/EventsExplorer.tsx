'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Calendar, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ExplorerEventItem = {
  key: string
  upcoming: boolean
  free: boolean
  tags: string[]
  searchText: string
  /** Server-rendered card. */
  card: ReactNode
}

type When = 'upcoming' | 'past' | 'all'
type Price = 'any' | 'free' | 'paid'

const MAX_TAG_CHIPS = 6

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-2',
        active ? 'bg-[#1f3a6f] text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#1f3a6f]/40',
      )}
    >
      {children}
    </button>
  )
}

function SectionHeader({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">{title}</h2>
        <p className="mt-1 text-sm text-gray-600 sm:text-base">{subtitle}</p>
      </div>
      <span className="self-start rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 sm:self-auto">
        {count} event{count === 1 ? '' : 's'}
      </span>
    </div>
  )
}

export default function EventsExplorer({ items }: { items: ExplorerEventItem[] }) {
  const [when, setWhen] = useState<When>('all')
  const [price, setPrice] = useState<Price>('any')
  const [tag, setTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // Most-used organiser tags become quick filters.
  const topTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) for (const t of item.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TAG_CHIPS)
      .map(([t]) => t)
  }, [items])

  const hasPaid = items.some((i) => !i.free)
  const hasFree = items.some((i) => i.free)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (price === 'free' && !i.free) return false
      if (price === 'paid' && i.free) return false
      if (tag && !i.tags.includes(tag)) return false
      if (q && !i.searchText.includes(q)) return false
      return true
    })
  }, [items, price, tag, query])

  const upcoming = filtered.filter((i) => i.upcoming)
  const past = filtered.filter((i) => !i.upcoming)
  const showUpcoming = when !== 'past'
  const showPast = when !== 'upcoming'
  const filtersActive = price !== 'any' || tag !== null || query.trim() !== ''
  const shown = (showUpcoming ? upcoming.length : 0) + (showPast ? past.length : 0)

  const reset = () => {
    setPrice('any')
    setTag(null)
    setQuery('')
  }

  return (
    <>
      <div className="mb-10 space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="When" className="flex flex-wrap gap-2">
            <Chip active={when === 'upcoming'} onClick={() => setWhen('upcoming')}>
              Upcoming
            </Chip>
            <Chip active={when === 'past'} onClick={() => setWhen('past')}>
              Past
            </Chip>
            <Chip active={when === 'all'} onClick={() => setWhen('all')}>
              All
            </Chip>
            {hasFree && hasPaid ? (
              <>
                <span className="mx-1 hidden w-px self-stretch bg-slate-200 sm:block" aria-hidden />
                <Chip active={price === 'free'} onClick={() => setPrice(price === 'free' ? 'any' : 'free')}>
                  Free
                </Chip>
                <Chip active={price === 'paid'} onClick={() => setPrice(price === 'paid' ? 'any' : 'paid')}>
                  Paid
                </Chip>
              </>
            ) : null}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <label htmlFor="event-search" className="sr-only">
              Search events
            </label>
            <input
              id="event-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="h-10 w-full rounded-xl border-2 border-slate-200 bg-white pl-9 pr-9 text-sm focus:border-[#1f3a6f] focus:outline-none focus:ring-2 focus:ring-[#1f3a6f]/20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
        {topTags.length > 0 ? (
          <div role="group" aria-label="Topic" className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Topics:</span>
            {topTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(tag === t ? null : t)}
                aria-pressed={tag === t}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f]',
                  tag === t ? 'bg-[#d4163f] text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                )}
              >
                {t}
              </button>
            ))}
            {filtersActive ? (
              <button
                type="button"
                onClick={reset}
                className="ml-auto text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {shown} event{shown === 1 ? '' : 's'} shown
        </p>
      </div>

      {showUpcoming ? (
        <section className="mb-12 sm:mb-16 md:mb-20">
          <SectionHeader title="Upcoming Events" subtitle="Tap an event for details and registration" count={upcoming.length} />
          {upcoming.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {upcoming.map((i) => (
                <div key={i.key}>{i.card}</div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
              <Calendar className="mx-auto mb-4 size-12 text-slate-400" aria-hidden />
              <h3 className="text-xl font-bold text-slate-900">
                {filtersActive ? 'No upcoming events match these filters' : 'No upcoming events right now'}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {filtersActive
                  ? 'Try clearing a filter.'
                  : 'New workshops are announced often — ask us to tell you about the next one.'}
              </p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                {filtersActive ? (
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-xl bg-[#1f3a6f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14264a]"
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link
                    href="/contact?interest=Upcoming%20events"
                    prefetch={false}
                    className="rounded-xl bg-[#1f3a6f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14264a]"
                  >
                    Notify me about new events
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {showPast && past.length > 0 ? (
        <section>
          <SectionHeader title="Past Events" subtitle="See what students built and won before" count={past.length} />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {past.map((i) => (
              <div key={i.key}>{i.card}</div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
