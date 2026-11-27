'use client'

import { Link } from '@/i18n/navigation'
import { ArrowRight, Pause, Play } from 'lucide-react'
import type { Event } from '@/types/event'
import { eventPublicHref } from '@/lib/event-ui'
import { parseEventDates } from '@/lib/dateUtils'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'

function eventDateParts(date: Event['date'], locale: string) {
  const dates = parseEventDates(date)
  const raw = dates[0] ?? ''
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const tag = locale === 'bn' ? 'bn-BD' : 'en-US'
    const day = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    return {
      month: day.toLocaleString(tag, { month: 'short' }),
      day: day.toLocaleString(tag, { day: 'numeric' }),
    }
  }
  return null
}

export default function UpcomingEventsRail({ events }: { events: Event[] }) {
  const t = useTranslations('home.eventsRail')
  const locale = useLocale()
  const autoplay = useRef(
    Autoplay({ delay: 5200, stopOnInteraction: true, stopOnMouseEnter: true }),
  )
  const canAutoplay = events.length > 2
  const [api, setApi] = useState<CarouselApi>()
  const [playing, setPlaying] = useState(false)

  // Mirror the plugin's real state (hover, swipes and arrows all stop it), and
  // honour reduced motion once Embla has initialised the plugin.
  useEffect(() => {
    if (!api || !canAutoplay) return
    const sync = () => setPlaying(autoplay.current.isPlaying())
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) autoplay.current.stop()
    api.on('autoplay:play', sync)
    api.on('autoplay:stop', sync)
    const frame = requestAnimationFrame(sync)
    return () => {
      cancelAnimationFrame(frame)
      api.off('autoplay:play', sync)
      api.off('autoplay:stop', sync)
    }
  }, [api, canAutoplay])

  const togglePlay = () => {
    if (autoplay.current.isPlaying()) autoplay.current.stop()
    else autoplay.current.play()
  }

  if (events.length === 0) return null

  return (
    <div className="w-full">
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
          {t('heading')}
        </p>
        <div className="flex items-center gap-3">
          {canAutoplay ? (
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex size-7 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 transition hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              aria-label={playing ? t('pauseSlideshow') : t('playSlideshow')}
            >
              {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </button>
          ) : null}
          <Link
            href="/events"
            prefetch={false}
            className="group inline-flex items-center gap-1 text-xs font-medium text-white/70 transition-colors hover:text-white"
          >
            {t('allEvents')}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <Carousel
        opts={{ align: 'start', loop: canAutoplay }}
        plugins={canAutoplay ? [autoplay.current] : []}
        setApi={setApi}
        className="relative"
      >
        {events.length > 1 ? (
          <>
            <CarouselPrevious
              className="-left-2 size-8 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white disabled:hidden sm:-left-3"
            />
            <CarouselNext
              className="-right-2 size-8 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white disabled:hidden sm:-right-3"
            />
          </>
        ) : null}

        <CarouselContent className="-ml-3">
          {events.map((event) => {
            const parts = eventDateParts(event.date, locale) ?? { month: t('soon'), day: '—' }
            const category = event.tags?.[0] || t('eventFallback')
            return (
              <CarouselItem
                key={event.id}
                className="pl-3 basis-[min(17.5rem,82vw)] sm:basis-76"
              >
                <Link
                  href={eventPublicHref(event)}
                  prefetch={false}
                  className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200/40 hover:bg-white/15"
                >
                  <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-200">
                      {parts.month}
                    </span>
                    <span className="text-lg font-bold leading-none text-white">
                      {parts.day}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                    <span className="mt-1 inline-flex rounded-full bg-indigo-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-100 ring-1 ring-indigo-300/20">
                      {category}
                    </span>
                  </div>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all duration-300 group-hover:bg-indigo-500 group-hover:text-white">
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    <span className="sr-only">{t('view', { title: event.title })}</span>
                  </span>
                </Link>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
