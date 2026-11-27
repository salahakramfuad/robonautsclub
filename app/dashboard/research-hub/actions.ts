'use server'

import { revalidatePath } from 'next/cache'
import { canCreateArea, canEditOthersArea, getServerSession, type Session } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import {
  isValidDateString,
  type BookingStatus,
  type ResearchHubContent,
  type ResearchHubSettings,
} from '@/lib/research-hub/shared'
import {
  addClosure,
  deleteClosure,
  getBookingById,
  normalizeContent,
  normalizeSettings,
  saveResearchHubContent,
  saveResearchHubSettings,
  setStaffStatus,
} from '@/lib/research-hub/store'

type Result = { success: true } | { success: false; error: string }

async function requireArea(level: 'view' | 'manage'): Promise<Session | null> {
  const session = await getServerSession()
  if (!session) return null
  if (session.role === 'superAdmin') return session
  const perms = session.permissions || []
  if (!perms.includes('tab:researchHub')) return null
  if (level === 'manage' && !canCreateArea(session, 'researchHub') && !canEditOthersArea(session, 'researchHub')) {
    return null
  }
  return session
}

const STAFF_STATUSES: BookingStatus[] = ['checked_in', 'completed', 'no_show', 'confirmed']

export async function updateResearchHubBookingStatus(id: string, status: BookingStatus): Promise<Result> {
  const session = await requireArea('view')
  if (!session) return { success: false, error: 'You do not have access to the Research Hub.' }
  if (!STAFF_STATUSES.includes(status)) return { success: false, error: 'Invalid status.' }

  const changed = await setStaffStatus(String(id), status)
  if (!changed) return { success: false, error: 'This booking can no longer be changed to that status.' }

  const booking = await getBookingById(String(id))
  await createNotification(
    'research_hub_status',
    `Research Hub booking ${booking?.code ?? id} marked ${status.replace('_', ' ')}`,
    session,
  )
  revalidatePath('/dashboard/research-hub')
  return { success: true }
}

export async function saveResearchHubSettingsAction(input: ResearchHubSettings): Promise<Result> {
  const session = await requireArea('manage')
  if (!session) return { success: false, error: 'You do not have permission to change Research Hub settings.' }

  const settings = normalizeSettings({ ...input, configured: true })
  if (settings.ratePerPersonHour <= 0) {
    return { success: false, error: 'Set a price per person per hour greater than 0.' }
  }
  await saveResearchHubSettings(settings, session.email)
  await createNotification('research_hub_settings', 'Research Hub settings updated', session, [
    `Rate ৳${settings.ratePerPersonHour}/person/hour`,
    `${settings.seatsPerHour} seats per hour`,
  ])
  revalidatePath('/dashboard/research-hub')
  revalidatePath('/research-hub')
  return { success: true }
}

export async function addResearchHubClosureAction(input: {
  date: string
  allDay: boolean
  startHour?: number
  endHour?: number
  reason?: string
}): Promise<Result> {
  const session = await requireArea('manage')
  if (!session) return { success: false, error: 'You do not have permission to manage closures.' }
  if (!isValidDateString(input.date)) return { success: false, error: 'Pick a valid date.' }

  let startHour: number | null = null
  let endHour: number | null = null
  if (!input.allDay) {
    startHour = Math.floor(Number(input.startHour))
    endHour = Math.floor(Number(input.endHour))
    if (!(startHour >= 0 && endHour <= 24 && endHour > startHour)) {
      return { success: false, error: 'End time must be after start time.' }
    }
  }
  await addClosure({
    date: input.date,
    startHour,
    endHour,
    reason: String(input.reason ?? '').trim().slice(0, 200),
    createdBy: session.email,
  })
  await createNotification('research_hub_closure', `Research Hub closure added for ${input.date}`, session)
  revalidatePath('/dashboard/research-hub/settings')
  return { success: true }
}

export async function deleteResearchHubClosureAction(id: string): Promise<Result> {
  const session = await requireArea('manage')
  if (!session) return { success: false, error: 'You do not have permission to manage closures.' }
  await deleteClosure(String(id))
  revalidatePath('/dashboard/research-hub/settings')
  return { success: true }
}

export async function saveResearchHubContentAction(input: ResearchHubContent): Promise<Result> {
  const session = await requireArea('manage')
  if (!session) return { success: false, error: 'You do not have permission to edit the Research Hub page.' }
  const content = normalizeContent(input)
  await saveResearchHubContent(content, session.email)
  await createNotification('research_hub_content', 'Research Hub page content updated', session, [
    `${content.inventory.length} inventory items`,
    `${content.photos.length} photos`,
  ])
  revalidatePath('/dashboard/research-hub/content')
  revalidatePath('/research-hub')
  revalidatePath('/bn/research-hub')
  return { success: true }
}
