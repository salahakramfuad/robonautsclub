import Link from 'next/link'
import { ChevronLeft, ChevronRight, FlaskConical, LayoutTemplate, Search, Settings, TriangleAlert } from 'lucide-react'
import { canCreateArea, canEditOthersArea, hasPermission, requireTabAccess } from '@/lib/auth'
import { isFeatureEnabledFresh } from '@/lib/feature-flags'
import { getDayAvailability } from '@/lib/research-hub/availability'
import { addDays, dhakaToday, formatHour, formatRange, isValidDateString } from '@/lib/research-hub/shared'
import {
  getResearchHubSettings,
  listBookingsForDate,
  searchBookings,
  type ResearchHubBooking,
} from '@/lib/research-hub/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import BookingStatusActions from './BookingStatusActions'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<string, string> = {
  held: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-green-100 text-green-800',
  completed: 'bg-slate-200 text-slate-800',
  no_show: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
  expired: 'bg-gray-100 text-gray-500',
}

function isLiveHold(b: ResearchHubBooking, nowIso: string) {
  return b.status === 'held' && !!b.holdExpiresAt && b.holdExpiresAt > nowIso
}

function BookingsTable({
  bookings,
  showMoney,
  showDate,
  nowIso,
}: {
  bookings: ResearchHubBooking[]
  showMoney: boolean
  showDate?: boolean
  nowIso: string
}) {
  if (bookings.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-slate-500">No bookings.</p>
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            {showDate ? <TableHead>Date</TableHead> : null}
            <TableHead>Time</TableHead>
            <TableHead>People</TableHead>
            <TableHead>Booker</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead>Status</TableHead>
            {showMoney ? <TableHead className="text-right">Paid</TableHead> : null}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => {
            const status = b.status === 'held' && !isLiveHold(b, nowIso) ? 'expired' : b.status
            return (
              <TableRow key={b.id} className={status === 'cancelled' || status === 'expired' ? 'opacity-60' : ''}>
                <TableCell className="font-mono text-xs font-semibold">{b.code}</TableCell>
                {showDate ? <TableCell className="whitespace-nowrap">{b.date}</TableCell> : null}
                <TableCell className="whitespace-nowrap">{formatRange(b.startHour, b.hours)}</TableCell>
                <TableCell>{b.persons}</TableCell>
                <TableCell className="min-w-48">
                  <p className="font-medium text-slate-900">{b.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.phone} · {b.email}
                  </p>
                  {b.institution ? <p className="text-xs text-slate-500">{b.institution}</p> : null}
                  {b.groupMembers ? <p className="text-xs text-slate-500">With: {b.groupMembers}</p> : null}
                </TableCell>
                <TableCell className="max-w-64 text-xs text-slate-600">
                  {b.purpose ? <p>{b.purpose}</p> : null}
                  {b.plannedComponents ? <p className="mt-1 text-slate-500">Needs: {b.plannedComponents}</p> : null}
                  {b.notes ? <p className="mt-1 font-medium text-red-700">{b.notes}</p> : null}
                </TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ''}`}>
                    {status.replace('_', ' ')}
                  </span>
                </TableCell>
                {showMoney ? (
                  <TableCell className="whitespace-nowrap text-right">
                    {b.amountPaid != null ? `৳${b.amountPaid.toLocaleString('en-US')}` : '—'}
                    {b.trxId ? <p className="font-mono text-[11px] text-slate-500">{b.trxId}</p> : null}
                  </TableCell>
                ) : null}
                <TableCell className="text-right">
                  <BookingStatusActions id={b.id} status={status} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function ResearchHubDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; q?: string; all?: string }>
}) {
  const session = await requireTabAccess('researchHub')
  const canManage = canCreateArea(session, 'researchHub') || canEditOthersArea(session, 'researchHub')
  const showMoney = hasPermission(session, 'payments.view')
  const params = await searchParams
  const today = dhakaToday()
  const date = params.date && isValidDateString(params.date) ? params.date : today
  const query = params.q?.trim() || ''
  const showAll = params.all === '1'
  const nowIso = new Date().toISOString()

  const [settings, publicOn] = await Promise.all([
    getResearchHubSettings(),
    isFeatureEnabledFresh('registration.researchHub'),
  ])

  const searchResults = query ? await searchBookings(query) : null
  const [day, allBookings] = query
    ? [null, [] as ResearchHubBooking[]]
    : await Promise.all([getDayAvailability(date, { ignoreFlag: true, settings }), listBookingsForDate(date)])

  const activeBookings = allBookings.filter(
    (b) => ['confirmed', 'checked_in', 'completed', 'no_show'].includes(b.status) || isLiveHold(b, nowIso),
  )
  const shown = showAll ? allBookings : activeBookings
  const paid = activeBookings.filter((b) => b.status !== 'held')
  const people = paid.reduce((sum, b) => sum + b.persons, 0)
  const revenue = paid.reduce((sum, b) => sum + (b.amountPaid ?? 0), 0)
  const checkedIn = paid.filter((b) => b.status === 'checked_in' || b.status === 'completed').length

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))

  const linkFor = (d: string) => `/dashboard/research-hub?date=${d}${showAll ? '&all=1' : ''}`

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
            <FlaskConical className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Research Hub</h2>
            <p className="mt-1 text-sm text-slate-600">
              {settings.seatsPerHour} seats per hour · ৳{settings.ratePerPersonHour} per person per hour
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/research-hub" target="_blank">
              Public page
            </Link>
          </Button>
          {canManage ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/research-hub/content">
                <LayoutTemplate className="size-4" aria-hidden /> Page content
              </Link>
            </Button>
          ) : null}
          {canManage ? (
            <Button asChild>
              <Link href="/dashboard/research-hub/settings">
                <Settings className="size-4" aria-hidden /> Settings
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {!settings.configured || !publicOn ? (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="space-y-1">
            {!settings.configured ? (
              <p>
                <strong>Not set up yet.</strong> Set the price, seats and opening hours in{' '}
                <Link className="underline" href="/dashboard/research-hub/settings">
                  Settings
                </Link>{' '}
                before opening bookings.
              </p>
            ) : null}
            {!publicOn ? (
              <p>
                <strong>Public booking is off.</strong> A Super Admin can turn on “Research Hub booking” in{' '}
                <Link className="underline" href="/dashboard/feature-flags">
                  Feature flags
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="icon" aria-label="Previous day">
            <Link href={linkFor(addDays(date, -1))}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <form className="flex items-center gap-2" action="/dashboard/research-hub">
            <Input type="date" name="date" defaultValue={date} className="w-auto" />
            {showAll ? <input type="hidden" name="all" value="1" /> : null}
            <Button type="submit" variant="outline">
              Go
            </Button>
          </form>
          <Button asChild variant="outline" size="icon" aria-label="Next day">
            <Link href={linkFor(addDays(date, 1))}>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
          {date !== today ? (
            <Button asChild variant="ghost">
              <Link href={linkFor(today)}>Today</Link>
            </Button>
          ) : null}
        </div>
        <form className="flex items-center gap-2" action="/dashboard/research-hub">
          <Input name="q" placeholder="Search code, phone, email, name" defaultValue={query} className="w-72" />
          <Button type="submit" variant="outline" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>
        </form>
      </div>

      {searchResults ? (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="font-semibold text-slate-900">
                {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for “{query}”
              </p>
              <Link href="/dashboard/research-hub" className="text-sm text-sky-700 underline">
                Clear search
              </Link>
            </div>
            <BookingsTable bookings={searchResults} showMoney={showMoney} showDate nowIso={nowIso} />
          </CardContent>
        </Card>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-slate-900">{dateLabel}</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ['Bookings', String(paid.length)],
              ['People', String(people)],
              ['Checked in', `${checkedIn} / ${paid.length}`],
              ...(showMoney ? [['Revenue', `৳${revenue.toLocaleString('en-US')}`]] : []),
            ].map(([label, value]) => (
              <Card key={label} className="shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">{label}</p>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="mb-3 font-semibold text-slate-900">Seats by hour</p>
              {day && day.hours.length > 0 ? (
                <div className="grid gap-1.5">
                  {day.hours.map((slot) => {
                    const used = day.capacity - slot.seatsLeft
                    const pct = Math.min(100, Math.round((used / Math.max(1, day.capacity)) * 100))
                    return (
                      <div key={slot.hour} className="flex items-center gap-3 text-sm">
                        <span className="w-24 shrink-0 tabular-nums text-slate-600">
                          {formatHour(slot.hour)}–{formatHour(slot.hour + 1)}
                        </span>
                        <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                          <div
                            className={`h-full ${pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-sky-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right tabular-nums text-slate-700">
                          {used}/{day.capacity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {day?.reason === 'closedDay'
                    ? 'Closed on this weekday.'
                    : day?.reason === 'closure'
                      ? `Closed${day.closureReason ? `: ${day.closureReason}` : ''}.`
                      : day?.reason === 'notConfigured'
                        ? 'Set up the Research Hub in Settings first.'
                        : 'No opening hours for this day.'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="font-semibold text-slate-900">Bookings</p>
                <Link
                  href={`/dashboard/research-hub?date=${date}${showAll ? '' : '&all=1'}`}
                  className="text-sm text-sky-700 underline"
                >
                  {showAll ? 'Hide cancelled & unpaid' : 'Show cancelled & unpaid'}
                </Link>
              </div>
              <BookingsTable bookings={shown} showMoney={showMoney} nowIso={nowIso} />
            </CardContent>
          </Card>
          <p className="text-xs text-slate-500">
            <Badge variant="secondary" className="mr-1">
              Tip
            </Badge>
            Bookers show a QR code with their booking code at the desk. Search the code above to find any booking.
          </p>
        </>
      )}
    </div>
  )
}
