'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ResearchHubSettings, Weekday } from '@/lib/research-hub/shared'
import { saveResearchHubSettingsAction } from '../actions'

const DAY_NAMES: Record<Weekday, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
}
// Bangladesh week starts on Saturday.
const DAY_ORDER: Weekday[] = ['6', '0', '1', '2', '3', '4', '5']
const HOURS = Array.from({ length: 25 }, (_, h) => h)

function hourOption(h: number) {
  const suffix = h < 12 || h === 24 ? 'AM' : 'PM'
  const twelve = h % 12 === 0 ? 12 : h % 12
  return `${String(h).padStart(2, '0')}:00 (${twelve} ${h === 24 ? 'midnight' : suffix})`
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min,
  step,
}: {
  id: string
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        step={step ?? 1}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

export default function SettingsForm({ initial }: { initial: ResearchHubSettings }) {
  const router = useRouter()
  const [s, setS] = useState(initial)
  const [saving, startSave] = useTransition()

  const set = <K extends keyof ResearchHubSettings>(key: K, value: ResearchHubSettings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }))
  const setDay = (day: Weekday, patch: Partial<ResearchHubSettings['openingHours'][Weekday]>) =>
    setS((prev) => ({
      ...prev,
      openingHours: { ...prev.openingHours, [day]: { ...prev.openingHours[day], ...patch } },
    }))

  function save(e: React.FormEvent) {
    e.preventDefault()
    startSave(async () => {
      const result = await saveResearchHubSettingsAction(s)
      if (result.success) {
        toast.success('Settings saved')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="font-semibold text-slate-900">Price & capacity</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="rate"
              label="Price per person per hour (৳)"
              value={s.ratePerPersonHour}
              min={0}
              onChange={(v) => set('ratePerPersonHour', v)}
              hint={`Example: 3 people × 2 hours = ৳${(3 * 2 * (s.ratePerPersonHour || 0)).toLocaleString('en-US')}`}
            />
            <NumberField
              id="seats"
              label="Seats per hour"
              value={s.seatsPerHour}
              min={1}
              onChange={(v) => set('seatsPerHour', v)}
              hint="Total people the hub can hold at the same time."
            />
            <NumberField id="minHours" label="Minimum hours per booking" value={s.minHours} min={1} onChange={(v) => set('minHours', v)} />
            <NumberField id="maxHours" label="Maximum hours per booking" value={s.maxHours} min={1} onChange={(v) => set('maxHours', v)} />
            <NumberField
              id="maxPersons"
              label="Maximum people per booking"
              value={s.maxPersonsPerBooking}
              min={1}
              onChange={(v) => set('maxPersonsPerBooking', v)}
            />
            <NumberField
              id="horizon"
              label="Bookable days ahead"
              value={s.bookingHorizonDays}
              min={1}
              onChange={(v) => set('bookingHorizonDays', v)}
            />
            <NumberField
              id="lead"
              label="Minimum notice (minutes)"
              value={s.minLeadMinutes}
              min={0}
              onChange={(v) => set('minLeadMinutes', v)}
              hint="How long before a slot starts it can still be booked online."
            />
            <NumberField
              id="cutoff"
              label="Cancellation cut-off (hours before start)"
              value={s.cancellationCutoffHours}
              min={0}
              onChange={(v) => set('cancellationCutoffHours', v)}
              hint="Used by self-cancellation (coming soon)."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="location">Location shown to bookers</Label>
            <Input id="location" value={s.location} onChange={(e) => set('location', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="font-semibold text-slate-900">Opening hours</p>
          <p className="text-sm text-slate-600">Times are Bangladesh time. “Closes” is when the last slot ends.</p>
          <div className="divide-y divide-slate-100">
            {DAY_ORDER.map((day) => {
              const oh = s.openingHours[day]
              return (
                <div key={day} className="flex flex-wrap items-center gap-3 py-2.5">
                  <label className="flex w-36 items-center gap-2 text-sm font-medium text-slate-800">
                    <Switch checked={oh.open} onCheckedChange={(v) => setDay(day, { open: v })} />
                    {DAY_NAMES[day]}
                  </label>
                  {oh.open ? (
                    <div className="flex items-center gap-2 text-sm">
                      <select
                        aria-label={`${DAY_NAMES[day]} opens`}
                        className="rounded-md border border-slate-300 px-2 py-1.5"
                        value={oh.start}
                        onChange={(e) => setDay(day, { start: Number(e.target.value) })}
                      >
                        {HOURS.slice(0, 24).map((h) => (
                          <option key={h} value={h}>
                            {hourOption(h)}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-500">to</span>
                      <select
                        aria-label={`${DAY_NAMES[day]} closes`}
                        className="rounded-md border border-slate-300 px-2 py-1.5"
                        value={oh.end}
                        onChange={(e) => setDay(day, { end: Number(e.target.value) })}
                      >
                        {HOURS.slice(1).map((h) => (
                          <option key={h} value={h}>
                            {hourOption(h)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Closed</span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  )
}
