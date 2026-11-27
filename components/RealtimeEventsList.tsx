import {
  parseEventDates,
  formatEventDates,
  isEventUpcoming,
  hasEventPassed,
  getFirstEventDate,
  getBangladeshNow,
  getEventDateInBangladesh,
  bdWallTimeToUtcDate,
  isRegistrationOpen,
} from '@/lib/dateUtils'
import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { Event } from '@/types/event'
import { eventPublicHref } from '@/lib/event-ui'
import { differenceInDays, differenceInHours } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getRobofestEventsListCard,
  ROBOFEST_EVENTS_LIST_CARD_ID,
} from '@/lib/robofest-events-card'
import EventCardImage from '@/components/EventCardImage'
import EventsExplorer, { type ExplorerEventItem } from '@/components/EventsExplorer'

/**
 * Check if an event is currently going on
 * Returns true if current date/time is within the event's date and time (Bangladesh)
 */
function isEventGoingOn(event: Event): boolean {
  const bstNow = getBangladeshNow()
  const eventDates = parseEventDates(event.date)

  if (eventDates.length === 0) return false

  const sortedDates = [...eventDates].sort()
  const firstEventDate = getEventDateInBangladesh(sortedDates[0])
  const lastEventDate = getEventDateInBangladesh(sortedDates[sortedDates.length - 1])

  const daysFromStart = differenceInDays(bstNow, firstEventDate)
  const daysFromEnd = differenceInDays(bstNow, lastEventDate)
  const isWithinRange = daysFromStart >= 0 && daysFromEnd <= 0

  if (!isWithinRange) return false

  let matchedEventDate: string | null = null
  for (const eventDateStr of sortedDates) {
    const eventDateBST = getEventDateInBangladesh(eventDateStr)
    const daysDiff = differenceInDays(eventDateBST, bstNow)
    if (daysDiff === 0) {
      matchedEventDate = eventDateStr
      break
    }
  }

  if (!matchedEventDate) {
    matchedEventDate = sortedDates[0]
  }

  if (event.time && matchedEventDate) {
    try {
      const timeStr = event.time.trim()
      const is12Hour = /AM|PM/i.test(timeStr)
      let eventHours = 0
      let eventMinutes = 0

      if (is12Hour) {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (match) {
          let hours = parseInt(match[1])
          const minutes = parseInt(match[2])
          const period = match[3].toUpperCase()

          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0

          eventHours = hours
          eventMinutes = minutes
        } else {
          return true
        }
      } else {
        const match = timeStr.match(/(\d+):(\d+)/)
        if (match) {
          eventHours = parseInt(match[1])
          eventMinutes = parseInt(match[2])
        } else {
          return true
        }
      }

      const [year, month, day] = matchedEventDate.split('-').map(Number)
      const eventStartUtc = bdWallTimeToUtcDate(
        year,
        month - 1,
        day,
        eventHours,
        eventMinutes,
        0,
        0,
      )
      const eventEndUtc = new Date(eventStartUtc.getTime() + 8 * 60 * 60 * 1000)
      const nowMs = Date.now()

      return nowMs >= eventStartUtc.getTime() && nowMs <= eventEndUtc.getTime()
    } catch {
      return true
    }
  }

  return true
}

function getTimeDisplay(event: Event, isUpcoming: boolean): string | null {
  const firstDate = getFirstEventDate(event.date)
  if (!firstDate || !isUpcoming) return null

  if (isEventGoingOn(event)) {
    return 'Event going on'
  }

  const bstNow = getBangladeshNow()
  const eventDateStr = Array.isArray(event.date)
    ? event.date[0]
    : typeof event.date === 'string' && event.date.includes(',')
      ? event.date.split(',')[0].trim()
      : event.date || ''

  if (!eventDateStr) return null

  const eventDateBST = getEventDateInBangladesh(eventDateStr)
  const hoursUntil = differenceInHours(eventDateBST, bstNow)
  const daysUntil = differenceInDays(eventDateBST, bstNow)

  if (daysUntil === 0) {
    if (hoursUntil >= 0) return 'Starting soon'
    return 'Event going on'
  }
  if (hoursUntil < 24 && hoursUntil >= 0) return 'Starting soon'
  if (hoursUntil >= 24 && hoursUntil < 48) return 'Tomorrow'
  if (daysUntil > 0) return `${daysUntil} days away`
  return null
}

function EventCard({ event, priority = false }: { event: Event; priority?: boolean }) {
  const eventDates = parseEventDates(event.date)
  const isUpcoming = isEventUpcoming(event.date)
  const status = isUpcoming ? 'Upcoming' : 'Completed'
  const timeDisplay = getTimeDisplay(event, isUpcoming)
  // Robofest card links to its own landing page, which handles its own registration state.
  const canRegister = isUpcoming && !event.href && isRegistrationOpen(event)

  return (
    <Link href={eventPublicHref(event)} prefetch={false} className="h-full">
      <Card className="group relative border-2 hover:border-indigo-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col p-0">
        <div className="absolute top-4 right-4 z-10">
          <Badge
            className={`shadow-sm border-0 text-xs font-bold ${
              isUpcoming
                ? 'bg-green-500 hover:bg-green-500 text-white'
                : 'bg-gray-400 hover:bg-gray-400 text-white'
            }`}
          >
            {status}
          </Badge>
        </div>

        <div className="relative h-40 sm:h-48 bg-linear-to-br from-indigo-400 via-blue-400 to-purple-400 overflow-hidden">
          <EventCardImage src={event.image} alt={event.title} priority={priority} />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          {isUpcoming && timeDisplay && (
            <Badge className="absolute bottom-4 left-4 bg-white/90 hover:bg-white/90 backdrop-blur-sm text-indigo-700 z-10 border-0 text-sm font-bold">
              {timeDisplay}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-indigo-500 transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
              <span className="font-medium">{formatEventDates(eventDates)}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-indigo-100 hover:bg-indigo-100 text-indigo-700 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 hover:bg-gray-100 text-gray-600 text-xs font-medium">
                  +{event.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100">
            <div
              className={`flex items-center gap-2 font-semibold transition-colors text-sm sm:text-base ${
                canRegister ? 'text-[#d4163f] group-hover:text-[#e8335a]' : 'text-indigo-500 group-hover:text-indigo-700'
              }`}
            >
              <span>{canRegister ? 'View & register' : 'View details'}</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface PublicEventsListProps {
  initialEvents?: Event[]
}

/** Server-rendered public events list (legacy name RealtimeEventsList). */
export default function RealtimeEventsList({ initialEvents = [] }: PublicEventsListProps) {
  const robofestCard = getRobofestEventsListCard()
  const withoutDuplicate = initialEvents.filter((event) => event.id !== ROBOFEST_EVENTS_LIST_CARD_ID)
  const displayEvents = [...withoutDuplicate, robofestCard]

  const sortedEvents = [...displayEvents].sort((a, b) => {
    const dateA = getFirstEventDate(a.date)
    const dateB = getFirstEventDate(b.date)

    if (!dateA && !dateB) return 0
    if (!dateA) return 1
    if (!dateB) return -1

    const aIsPast = hasEventPassed(a.date)
    const bIsPast = hasEventPassed(b.date)

    if (aIsPast && !bIsPast) return 1
    if (!aIsPast && bIsPast) return -1

    if (aIsPast) return dateB.getTime() - dateA.getTime()
    return dateA.getTime() - dateB.getTime()
  })

  const upcomingEvents = sortedEvents.filter((event) => isEventUpcoming(event.date))
  const pastEvents = sortedEvents.filter((event) => hasEventPassed(event.date))

  const toItem = (event: Event, upcoming: boolean, index: number): ExplorerEventItem => ({
    key: event.id,
    upcoming,
    free: !event.isPaid,
    tags: (event.tags ?? []).map((t) => t.trim()).filter(Boolean),
    searchText: [event.title, event.description, event.location, event.venue, ...(event.tags ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    card: <EventCard event={event} priority={upcoming && index === 0} />,
  })

  const items = [
    ...upcomingEvents.map((e, i) => toItem(e, true, i)),
    ...pastEvents.map((e, i) => toItem(e, false, i)),
  ]

  return <EventsExplorer items={items} />
}
