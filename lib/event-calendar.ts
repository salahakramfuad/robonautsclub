import type { Event } from '@/types/event'
import { parseEventDates } from '@/lib/dateUtils'

type CalendarEvent = Pick<Event, 'title' | 'date' | 'time' | 'location' | 'venue' | 'description'>

/** YYYY-MM-DD → YYYYMMDD, or null when the stored date is not ISO-like. */
function compactDate(value: string): string | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}${m[2]}${m[3]}` : null
}

/** Day after a YYYYMMDD value (all-day DTEND is exclusive). */
function nextDay(yyyymmdd: string): string {
  const d = new Date(
    Date.UTC(Number(yyyymmdd.slice(0, 4)), Number(yyyymmdd.slice(4, 6)) - 1, Number(yyyymmdd.slice(6, 8)) + 1),
  )
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

/** All-day span covering the first through last event date, or null if dates are unparseable. */
function allDaySpan(event: CalendarEvent): { start: string; end: string } | null {
  const days = parseEventDates(event.date)
    .map(compactDate)
    .filter((d): d is string => Boolean(d))
    .sort()
  if (days.length === 0) return null
  return { start: days[0], end: nextDay(days[days.length - 1]) }
}

function details(event: CalendarEvent, pageUrl: string): string {
  return [event.time ? `Time: ${event.time}` : null, event.description, pageUrl]
    .filter(Boolean)
    .join('\n\n')
}

function place(event: CalendarEvent): string {
  return [event.venue, event.location].filter(Boolean).join(', ')
}

export function googleCalendarUrl(event: CalendarEvent, pageUrl: string): string | null {
  const span = allDaySpan(event)
  if (!span) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${span.start}/${span.end}`,
    details: details(event, pageUrl),
    location: place(event),
    ctz: 'Asia/Dhaka',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
}

/** Minimal RFC 5545 all-day event — works with Apple Calendar, Outlook and Google import. */
export function buildIcs(event: CalendarEvent, pageUrl: string): string | null {
  const span = allDaySpan(event)
  if (!span) return null
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Robonauts//Events//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${span.start}-${encodeURIComponent(event.title).slice(0, 40)}@robonautsltd.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${span.start}`,
    `DTEND;VALUE=DATE:${span.end}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(details(event, pageUrl))}`,
    `LOCATION:${icsEscape(place(event))}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
