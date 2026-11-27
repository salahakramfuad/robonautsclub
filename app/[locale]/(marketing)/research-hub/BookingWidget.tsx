'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, Loader2, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import InstitutionAutocomplete from '@/components/InstitutionAutocomplete'
import { cn } from '@/lib/utils'
import { calculateAmount, type DayAvailability } from '@/lib/research-hub/shared'
import {
  getResearchHubAvailability,
  initiateResearchHubCheckout,
  type CheckoutErrorCode,
} from './actions'

export type DateOption = { date: string; closed: boolean }

type Props = {
  locale: string
  dates: DateOption[]
  initialDate: string
  initialStart?: number | null
  initialAvailability: DayAvailability
  horizonDays: number
  /** Approved school/university names from the school directory. */
  institutions?: string[]
}

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
  display,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  label: string
  display: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`${label} −`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-20 text-center text-lg font-semibold tabular-nums" aria-live="polite">
        {display}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`${label} +`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

function StepHeading({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
      <span className="flex size-7 items-center justify-center rounded-full bg-[#14264a] text-sm font-bold text-white">
        {n}
      </span>
      {children}
    </h3>
  )
}

export default function BookingWidget({
  locale,
  dates,
  initialDate,
  initialStart = null,
  initialAvailability,
  horizonDays,
  institutions = [],
}: Props) {
  const t = useTranslations('researchHub')
  const intlLocale = locale === 'bn' ? 'bn-BD' : 'en-GB'
  const numberFmt = useMemo(() => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US'), [locale])

  const [date, setDate] = useState(initialDate)
  const [day, setDay] = useState<DayAvailability>(initialAvailability)
  const [loadingDay, startDayTransition] = useTransition()
  const [startHour, setStartHour] = useState<number | null>(initialStart)
  const [hours, setHours] = useState(Math.max(1, initialAvailability.minHours))
  const [persons, setPersons] = useState(1)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    purpose: '',
    plannedComponents: '',
    groupMembers: '',
  })
  const [acceptRules, setAcceptRules] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, startSubmit] = useTransition()

  const dayFmt = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(intlLocale, { weekday: 'short', timeZone: 'UTC' }),
      day: new Intl.DateTimeFormat(intlLocale, { day: 'numeric', timeZone: 'UTC' }),
      month: new Intl.DateTimeFormat(intlLocale, { month: 'short', timeZone: 'UTC' }),
      long: new Intl.DateTimeFormat(intlLocale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }),
      hour: new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric', timeZone: 'UTC' }),
    }),
    [intlLocale, locale],
  )
  const toUtc = (d: string) => {
    const [y, m, dd] = d.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, dd))
  }
  const hourLabel = (h: number) => dayFmt.hour.format(new Date(Date.UTC(2000, 0, 1, h % 24)))

  /** Longest run of bookable hours from the chosen start, capped by maxHours. */
  const maxDuration = useMemo(() => {
    if (startHour == null) return day.maxHours
    let run = 0
    for (let h = startHour; run < day.maxHours; h++) {
      const slot = day.hours.find((s) => s.hour === h)
      if (!slot?.bookable) break
      run++
    }
    return run
  }, [day, startHour])

  const seatsInRange = useMemo(() => {
    if (startHour == null) return day.maxPersons
    let min = Infinity
    for (let h = startHour; h < startHour + hours; h++) {
      const slot = day.hours.find((s) => s.hour === h)
      min = Math.min(min, slot?.seatsLeft ?? 0)
    }
    return Number.isFinite(min) ? min : 0
  }, [day, startHour, hours])
  const maxPersons = Math.max(1, Math.min(day.maxPersons, seatsInRange))

  const amount = calculateAmount(day.rate, persons, hours)
  const canSubmit = startHour != null && hours >= day.minHours && hours <= maxDuration && persons <= seatsInRange

  function selectDate(next: string) {
    if (next === date) return
    setDate(next)
    setStartHour(null)
    setError(null)
    startDayTransition(async () => {
      const result = await getResearchHubAvailability(next)
      setDay(result)
      setHours((h) => Math.min(Math.max(h, result.minHours), result.maxHours))
    })
  }

  function selectStart(hour: number) {
    setStartHour(hour)
    setError(null)
    // Shrink duration/persons to what fits from this start.
    let run = 0
    for (let h = hour; run < day.maxHours; h++) {
      if (!day.hours.find((s) => s.hour === h)?.bookable) break
      run++
    }
    const nextHours = Math.min(Math.max(hours, day.minHours), Math.max(run, 1))
    setHours(nextHours)
    let seats = Infinity
    for (let h = hour; h < hour + nextHours; h++) {
      seats = Math.min(seats, day.hours.find((s) => s.hour === h)?.seatsLeft ?? 0)
    }
    setPersons((p) => Math.max(1, Math.min(p, day.maxPersons, seats)))
  }

  function errorMessage(code: CheckoutErrorCode, field?: string): string {
    if (code === 'invalid' && field && ['name', 'email', 'phone', 'acceptRules'].includes(field)) {
      return t(`errors.field.${field as 'name' | 'email' | 'phone' | 'acceptRules'}`)
    }
    if (code === 'duration') return t('errors.duration', { min: day.minHours, max: day.maxHours })
    if (code === 'persons') return t('errors.persons', { max: day.maxPersons })
    return t(`errors.${code}`)
  }

  async function refreshDay() {
    const result = await getResearchHubAvailability(date)
    setDay(result)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (startHour == null) {
      setError(t('widget.pickStart'))
      return
    }
    if (!acceptRules) {
      setError(t('errors.field.acceptRules'))
      return
    }
    startSubmit(async () => {
      const result = await initiateResearchHubCheckout({
        date,
        startHour,
        hours,
        persons,
        ...form,
        acceptRules: true,
      })
      if (result.success) {
        window.location.href = result.checkoutUrl
        return
      }
      setError(errorMessage(result.error, result.field))
      if (result.error === 'notEnoughSeats' || result.error === 'unavailable') {
        setStartHour(null)
        await refreshDay()
      }
    })
  }

  const closedMessage = (() => {
    if (day.open) return null
    if (day.reason === 'closure' && day.closureReason) return t('closed.closureReason', { reason: day.closureReason })
    if (day.reason === 'outOfRange') return t('closed.outOfRange', { days: horizonDays })
    if (day.reason) return t(`closed.${day.reason}`)
    return t('closed.noSlots')
  })()
  const hubUnavailable = day.reason === 'notConfigured' || day.reason === 'paused'

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-8">
        <StepHeading n={numberFmt.format(1)}>{t('widget.step1')}</StepHeading>
        {/* Date */}
        <fieldset className="min-w-0">
          <legend className="sr-only">{t('widget.date')}</legend>
          <p className="mb-3 text-sm font-medium text-slate-700">{t('widget.date')}</p>
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
            {dates.map((d) => {
              const dt = toUtc(d.date)
              const selected = d.date === date
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={d.closed || hubUnavailable}
                  onClick={() => selectDate(d.date)}
                  aria-pressed={selected}
                  aria-label={dayFmt.long.format(dt)}
                  className={cn(
                    'flex w-16 shrink-0 snap-start flex-col items-center rounded-xl border px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                    selected
                      ? 'border-[#14264a] bg-[#14264a] text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-[#14264a]/50',
                    (d.closed || hubUnavailable) && 'cursor-not-allowed opacity-40 hover:border-gray-200',
                  )}
                >
                  <span className="text-xs">{dayFmt.weekday.format(dt)}</span>
                  <span className="text-lg font-bold leading-6">{dayFmt.day.format(dt)}</span>
                  <span className="text-xs">{dayFmt.month.format(dt)}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Time */}
        <fieldset className="min-w-0">
          <legend className="sr-only">{t('widget.startTime')}</legend>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">{t('widget.startTime')}</p>
            {loadingDay ? (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Loader2 className="size-4 animate-spin" aria-hidden /> {t('widget.loading')}
              </span>
            ) : null}
          </div>
          {closedMessage ? (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{closedMessage}</p>
          ) : (
            <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5', loadingDay && 'opacity-50')}>
              {day.hours.map((slot) => {
                const inRange = startHour != null && slot.hour >= startHour && slot.hour < startHour + hours
                const isStart = slot.hour === startHour
                const low = slot.bookable && slot.seatsLeft <= Math.max(2, Math.ceil(day.capacity * 0.2))
                return (
                  <button
                    key={slot.hour}
                    type="button"
                    disabled={!slot.bookable || loadingDay}
                    onClick={() => selectStart(slot.hour)}
                    aria-pressed={isStart}
                    className={cn(
                      'rounded-xl border px-2 py-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
                      inRange
                        ? 'border-[#14264a] bg-[#14264a] text-white'
                        : 'border-slate-200 bg-white hover:border-[#14264a]/50',
                      !slot.bookable && 'cursor-not-allowed bg-gray-50 text-gray-400 hover:border-gray-200',
                    )}
                  >
                    <span className="block font-semibold">{hourLabel(slot.hour)}</span>
                    <span
                      className={cn(
                        'block text-xs',
                        inRange ? 'text-white/80' : low ? 'font-medium text-amber-700' : 'text-gray-500',
                      )}
                    >
                      {t('widget.seatsLeft', { count: slot.bookable ? slot.seatsLeft : 0 })}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {!closedMessage ? (
            <div className="mt-6 grid gap-6 rounded-2xl bg-[#f4f7fb] p-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">{t('widget.duration')}</p>
                <Stepper
                  label={t('widget.duration')}
                  value={hours}
                  min={day.minHours}
                  max={Math.max(day.minHours, startHour == null ? day.maxHours : maxDuration)}
                  onChange={(v) => {
                    setHours(v)
                    if (startHour != null) {
                      let seats = Infinity
                      for (let h = startHour; h < startHour + v; h++) {
                        seats = Math.min(seats, day.hours.find((s) => s.hour === h)?.seatsLeft ?? 0)
                      }
                      setPersons((p) => Math.max(1, Math.min(p, seats)))
                    }
                  }}
                  display={t('widget.hoursValue', { count: hours })}
                />
                {startHour != null ? (
                  <p className="mt-2 text-sm text-gray-500">
                    {hourLabel(startHour)} – {hourLabel(startHour + hours)}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">{t('widget.persons')}</p>
                <Stepper
                  label={t('widget.persons')}
                  value={persons}
                  min={1}
                  max={maxPersons}
                  onChange={setPersons}
                  display={numberFmt.format(persons)}
                />
                <p className="mt-2 text-sm text-gray-500">{t('widget.personsHint', { max: maxPersons })}</p>
              </div>
            </div>
          ) : null}
        </fieldset>

        {/* Details */}
        {!closedMessage ? (
          <fieldset className="min-w-0 space-y-5 border-t border-slate-200 pt-8">
            <legend className="sr-only">{t('widget.details')}</legend>
            <StepHeading n={numberFmt.format(2)}>{t('widget.step2')}</StepHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rh-name">{t('widget.name')}</Label>
                <Input
                  id="rh-name"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rh-email">{t('widget.email')}</Label>
                <Input
                  id="rh-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rh-phone">{t('widget.phone')}</Label>
                <Input
                  id="rh-phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rh-inst">{t('widget.institution')}</Label>
                <InstitutionAutocomplete
                  id="rh-inst"
                  value={form.institution}
                  onChange={(institution) => setForm((f) => ({ ...f, institution }))}
                  options={institutions}
                  placeholder={t('widget.institutionPlaceholder')}
                  noMatchText={t('widget.institutionNoMatch')}
                  matchedText={t('widget.institutionMatched')}
                  listLabel={t('widget.institutionSuggestions')}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rh-purpose">{t('widget.purpose')}</Label>
                <Textarea
                  id="rh-purpose"
                  rows={2}
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="rh-components">{t('widget.plannedComponents')}</Label>
                <Textarea
                  id="rh-components"
                  rows={2}
                  value={form.plannedComponents}
                  onChange={(e) => setForm({ ...form, plannedComponents: e.target.value })}
                />
                <p className="text-xs text-gray-500">{t('widget.plannedComponentsHint')}</p>
              </div>
              {persons > 1 ? (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="rh-group">{t('widget.groupMembers')}</Label>
                  <Textarea
                    id="rh-group"
                    rows={2}
                    value={form.groupMembers}
                    onChange={(e) => setForm({ ...form, groupMembers: e.target.value })}
                  />
                </div>
              ) : null}
            </div>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <Checkbox
                checked={acceptRules}
                onCheckedChange={(v) => setAcceptRules(v === true)}
                className="mt-0.5"
              />
              <span>{t('widget.acceptRules')}</span>
            </label>
          </fieldset>
        ) : null}
      </div>

      {/* Summary */}
      {!closedMessage ? (
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-[#14264a] p-6 text-white">
            <p className="text-lg font-semibold">{t('widget.summary')}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">{t('widget.date')}</dt>
                <dd className="text-right font-medium">{dayFmt.long.format(toUtc(date))}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">{t('widget.startTime')}</dt>
                <dd className="text-right font-medium">
                  {startHour != null ? `${hourLabel(startHour)} – ${hourLabel(startHour + hours)}` : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-white/60">
                  {t('widget.summaryLine', {
                    persons: numberFmt.format(persons),
                    hours: numberFmt.format(hours),
                    rate: numberFmt.format(day.rate),
                  })}
                </dt>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-white/15 pt-5">
              <span className="text-white/80">{t('widget.total')}</span>
              <span className="text-3xl font-bold tabular-nums">৳{numberFmt.format(amount)}</span>
            </div>

            {error ? (
              <p role="alert" className="mt-4 flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit || submitting}
              className="mt-5 h-12 w-full bg-[#e2136e] text-base text-white hover:bg-[#c10f5d] disabled:bg-white/15 disabled:text-white/60 disabled:opacity-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden /> {t('widget.redirecting')}
                </>
              ) : (
                t('widget.pay', { amount: numberFmt.format(amount) })
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-white/60">
              {startHour == null ? t('widget.pickStart') : t('widget.holdNote')}
            </p>
          </div>
        </aside>
      ) : null}
    </form>
  )
}
