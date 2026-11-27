'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { BookingStatus } from '@/lib/research-hub/shared'
import { updateResearchHubBookingStatus } from './actions'

const ACTIONS: Partial<Record<string, Array<{ to: BookingStatus; label: string; variant?: 'default' | 'outline' }>>> = {
  confirmed: [
    { to: 'checked_in', label: 'Check in' },
    { to: 'no_show', label: 'No-show', variant: 'outline' },
  ],
  checked_in: [{ to: 'completed', label: 'Done', variant: 'outline' }],
  no_show: [{ to: 'checked_in', label: 'Check in', variant: 'outline' }],
}

export default function BookingStatusActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const actions = ACTIONS[status] ?? []
  if (actions.length === 0) return <span className="text-xs text-slate-400">—</span>

  return (
    <div className="flex justify-end gap-1.5">
      {actions.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant={a.variant ?? 'default'}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await updateResearchHubBookingStatus(id, a.to)
              if (result.success) {
                toast.success(`Marked ${a.label.toLowerCase()}`)
                router.refresh()
              } else {
                toast.error(result.error)
              }
            })
          }
        >
          {a.label}
        </Button>
      ))}
    </div>
  )
}
