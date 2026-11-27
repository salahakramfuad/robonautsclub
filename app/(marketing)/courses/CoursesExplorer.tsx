'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, ExternalLink, MessageCircle, Search, X } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { SITE_CONFIG } from '@/lib/site-config'
import { cn } from '@/lib/utils'

export type ExplorerCourse = {
  id: string
  anchor: string
  title: string
  level: string
  blurb: string
  image?: string
  /** External / non-listing page for the course, when one exists. */
  externalHref?: string
}

const ALL = 'All levels'

function levelTone(level: string) {
  const l = level.toLowerCase()
  if (l.includes('beginner') || l.includes('junior') || l.includes('all')) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (l.includes('intermediate') || l.includes('senior')) return 'bg-sky-50 text-sky-700 ring-sky-200'
  if (l.includes('advanced')) return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  return 'bg-slate-50 text-slate-700 ring-slate-200'
}

export default function CoursesExplorer({ courses }: { courses: ExplorerCourse[] }) {
  const [level, setLevel] = useState(ALL)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState<string | null>(null)

  // Levels come straight from the dashboard data, so filters always match real courses.
  const levels = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of courses) {
      const key = c.level.trim().toLowerCase()
      if (key && !seen.has(key)) seen.set(key, c.level.trim())
    }
    return [ALL, ...seen.values()]
  }, [courses])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((c) => {
      if (level !== ALL && c.level.trim().toLowerCase() !== level.toLowerCase()) return false
      if (!q) return true
      return `${c.title} ${c.blurb} ${c.level}`.toLowerCase().includes(q)
    })
  }, [courses, level, query])

  // Briefly highlight the course a visitor arrived at via /courses#slug.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id || !courses.some((c) => c.anchor === id)) return
    const el = document.getElementById(id)
    el?.scrollIntoView({ block: 'center' })
    const show = window.setTimeout(() => setHighlight(id), 0)
    const hide = window.setTimeout(() => setHighlight(null), 2400)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [courses])

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by level" className="flex flex-wrap gap-2">
          {levels.map((l) => {
            const active = l === level
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={active}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-2',
                  active
                    ? 'bg-[#1f3a6f] text-white shadow-sm'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#1f3a6f]/40',
                )}
              >
                {l}
              </button>
            )
          })}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. Arduino, coding…"
            className="h-11 w-full rounded-xl border-2 border-slate-200 bg-white pl-9 pr-9 text-sm focus:border-[#1f3a6f] focus:outline-none focus:ring-2 focus:ring-[#1f3a6f]/20"
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

      <p className="sr-only" aria-live="polite">
        {visible.length} course{visible.length === 1 ? '' : 's'} shown
      </p>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 size-10 text-slate-300" aria-hidden />
          {courses.length === 0 ? (
            <>
              <p className="font-medium text-slate-700">New courses are being scheduled.</p>
              <Link
                href="/contact?interest=Robotics%20%26%20STEM%20classes"
                prefetch={false}
                className="mt-3 inline-block text-sm font-semibold text-[#1f3a6f] underline-offset-4 hover:underline"
              >
                Ask us about the next batch
              </Link>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-700">No courses match that yet.</p>
              <button
                type="button"
                onClick={() => {
                  setLevel(ALL)
                  setQuery('')
                }}
                className="mt-3 text-sm font-semibold text-[#1f3a6f] underline-offset-4 hover:underline"
              >
                Show all courses
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course) => (
            <li
              key={course.id}
              id={course.anchor}
              className={cn(
                'flex scroll-mt-28 flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition',
                highlight === course.anchor ? 'border-[#d4163f] ring-4 ring-[#d4163f]/20' : 'border-slate-200',
              )}
            >
              <div className="relative h-44 bg-linear-to-br from-slate-100 via-indigo-50 to-sky-50">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <BookOpen className="absolute inset-0 m-auto size-12 text-indigo-200" aria-hidden />
                )}
                <span
                  className={cn(
                    'absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 backdrop-blur-sm',
                    levelTone(course.level),
                  )}
                >
                  {course.level}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold leading-snug text-slate-900">{course.title}</h2>
                {course.blurb ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{course.blurb}</p> : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={`/contact?interest=${encodeURIComponent(course.title)}`}
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4163f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e8335a]"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Ask about this course
                  </Link>
                  <a
                    href={`${SITE_CONFIG.social.whatsapp}?text=${encodeURIComponent(`Hi Robonauts! I'd like to know more about "${course.title}".`)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Ask about ${course.title} on WhatsApp`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <FaWhatsapp className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                  {course.externalHref ? (
                    <a
                      href={course.externalHref}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#1f3a6f] hover:underline"
                    >
                      Details
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
