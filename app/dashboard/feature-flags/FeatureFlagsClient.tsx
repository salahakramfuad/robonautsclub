'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Megaphone } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveAnnouncement, setFeatureFlag } from './actions'

export type FlagRow = {
  key: string
  group: string
  label: string
  description: string
  enabled: boolean
}

type Announcement = { enabled: boolean; message: string; href: string }

function FlagToggle({ row }: { row: FlagRow }) {
  const [enabled, setEnabled] = useState(row.enabled)
  const [pending, startTransition] = useTransition()

  const onChange = (next: boolean) => {
    setEnabled(next) // optimistic
    startTransition(async () => {
      const result = await setFeatureFlag(row.key, next)
      if (result.success) {
        toast.success(`${row.label} ${next ? 'turned on' : 'turned off'}`)
      } else {
        setEnabled(!next)
        toast.error(result.error)
      }
    })
  }

  const id = `flag-${row.key}`
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-semibold text-gray-900">
          {row.label}
        </Label>
        <p className="mt-1 text-sm text-gray-600">{row.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pending ? <Loader2 className="size-4 animate-spin text-gray-400" aria-hidden /> : null}
        <span className={`text-xs font-semibold ${enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
          {enabled ? 'On' : 'Off'}
        </span>
        <Switch id={id} checked={enabled} onCheckedChange={onChange} disabled={pending} />
      </div>
    </div>
  )
}

function AnnouncementEditor({ initial }: { initial: Announcement }) {
  const [state, setState] = useState(initial)
  const [pending, startTransition] = useTransition()

  const save = (next: Announcement) => {
    startTransition(async () => {
      const result = await saveAnnouncement(next)
      if (result.success) {
        setState(next)
        toast.success(next.enabled ? 'Banner is live' : 'Banner saved (hidden)')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-0.5 size-5 text-indigo-600" aria-hidden />
            <div>
              <h2 className="text-base font-semibold text-gray-900">Announcement banner</h2>
              <p className="text-sm text-gray-600">A strip at the top of every public page.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${state.enabled ? 'text-emerald-600' : 'text-gray-400'}`}>
              {state.enabled ? 'Live' : 'Hidden'}
            </span>
            <Switch
              checked={state.enabled}
              disabled={pending}
              aria-label="Show announcement banner"
              onCheckedChange={(enabled) => save({ ...state, enabled })}
            />
          </div>
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            save(state)
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="banner-message">Message</Label>
            <Input
              id="banner-message"
              maxLength={200}
              value={state.message}
              placeholder="e.g. Robofest 2027 registration opens 1 March!"
              onChange={(e) => setState({ ...state, message: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="banner-href">Link (optional)</Label>
            <Input
              id="banner-href"
              maxLength={300}
              value={state.href}
              placeholder="/robofest or https://…"
              onChange={(e) => setState({ ...state, href: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={pending} className="bg-indigo-600 text-white hover:bg-indigo-700">
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Save banner
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function FeatureFlagsClient({
  rows,
  announcement,
}: {
  rows: FlagRow[]
  announcement: Announcement
}) {
  const groups = [...new Set(rows.map((r) => r.group))]
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group}>
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{group}</h2>
            <div className="divide-y divide-gray-100">
              {rows
                .filter((r) => r.group === group)
                .map((row) => (
                  <FlagToggle key={row.key} row={row} />
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <AnnouncementEditor initial={announcement} />
    </div>
  )
}
