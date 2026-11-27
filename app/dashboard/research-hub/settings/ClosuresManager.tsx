'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { formatHour } from '@/lib/research-hub/shared'
import { addResearchHubClosureAction, deleteResearchHubClosureAction } from '../actions'

type Closure = { id: string; date: string; startHour: number | null; endHour: number | null; reason: string }

export default function ClosuresManager({ closures }: { closures: Closure[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [date, setDate] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [startHour, setStartHour] = useState(10)
  const [endHour, setEndHour] = useState(14)
  const [reason, setReason] = useState('')

  function add(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await addResearchHubClosureAction({ date, allDay, startHour, endHour, reason })
      if (result.success) {
        toast.success('Closure added')
        setReason('')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteResearchHubClosureAction(id)
      if (result.success) router.refresh()
      else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <p className="font-semibold text-slate-900">Closures</p>
          <p className="text-sm text-slate-600">
            Block a whole day or some hours (holidays, club events, maintenance). Existing bookings are not cancelled,
            so check the day view first.
          </p>
        </div>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="closure-date">Date</Label>
            <Input id="closure-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <Switch checked={allDay} onCheckedChange={setAllDay} /> All day
          </label>
          {!allDay ? (
            <div className="flex items-center gap-2 pb-1 text-sm">
              <select
                aria-label="From"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
              <span>to</span>
              <select
                aria-label="To"
                className="rounded-md border border-slate-300 px-2 py-1.5"
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor="closure-reason">Reason (shown to the public)</Label>
            <Input
              id="closure-reason"
              placeholder="e.g. Eid holiday"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending}>
            Add closure
          </Button>
        </form>

        {closures.length > 0 ? (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {closures.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>
                  <strong>{c.date}</strong>{' '}
                  {c.startHour == null || c.endHour == null
                    ? 'All day'
                    : `${formatHour(c.startHour)}–${formatHour(c.endHour)}`}
                  {c.reason ? <span className="text-slate-500"> · {c.reason}</span> : null}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove closure"
                  disabled={pending}
                  onClick={() => remove(c.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No upcoming closures.</p>
        )}
      </CardContent>
    </Card>
  )
}
