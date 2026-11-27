'use client'

import { useState } from 'react'
import { CalendarPlus, Check, Download, Link2 } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import type { Event } from '@/types/event'
import { buildIcs, googleCalendarUrl, whatsappShareUrl } from '@/lib/event-calendar'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type Props = {
  event: Pick<Event, 'title' | 'date' | 'time' | 'location' | 'venue' | 'description'>
  /** Absolute URL of the event page (shared + embedded in calendar entries). */
  pageUrl: string
  /** Text shown before the link when sharing on WhatsApp. */
  shareText?: string
  className?: string
  /** `light` for white cards, `dark` for dark hero backgrounds. */
  tone?: 'light' | 'dark'
  /** Hide calendar buttons for events that already happened. */
  showCalendar?: boolean
}

const slugFile = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'event'

export default function EventShareActions({
  event,
  pageUrl,
  shareText,
  className,
  tone = 'light',
  showCalendar = true,
}: Props) {
  const t = useTranslations('events.share')
  const [copied, setCopied] = useState(false)
  const gcal = showCalendar ? googleCalendarUrl(event, pageUrl) : null
  const ics = showCalendar ? buildIcs(event, pageUrl) : null

  const chip = cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs sm:text-sm font-medium transition',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a6f] focus-visible:ring-offset-1',
    tone === 'dark'
      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#1f3a6f]/30 hover:text-[#1f3a6f]',
  )

  const downloadIcs = () => {
    if (!ics) return
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugFile(event.title)}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {gcal ? (
        <a href={gcal} target="_blank" rel="noreferrer" className={chip}>
          <CalendarPlus className="size-4" aria-hidden />
          {t('googleCalendar')}
        </a>
      ) : null}
      {ics ? (
        <button type="button" onClick={downloadIcs} className={chip}>
          <Download className="size-4" aria-hidden />
          {t('ics')}
        </button>
      ) : null}
      <a
        href={whatsappShareUrl(`${shareText ?? t('defaultShareText', { title: event.title })} ${pageUrl}`)}
        target="_blank"
        rel="noreferrer"
        className={chip}
      >
        <FaWhatsapp className="size-4 text-emerald-500" aria-hidden />
        {t('whatsapp')}
      </a>
      <button type="button" onClick={copyLink} className={chip} aria-live="polite">
        {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {copied ? t('copied') : t('copyLink')}
      </button>
    </div>
  )
}
