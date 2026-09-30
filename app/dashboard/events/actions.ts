'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import {
  requireAuth,
  canCreateArea,
  canEditResource,
  canDeleteResource,
} from '@/lib/auth'
import {
  collectionAdd,
  collectionDelete,
  collectionGet,
  collectionSet,
  collectionWhere,
  getBookingsByEventId,
} from '@/lib/db/collections'
import { Event } from '@/types/event'
import { ensureUniqueEventSlug, slugifyEventTitle } from '@/lib/event-slug'
import { sanitizeEventForDatabase } from '@/lib/textSanitizer'
import { createNotification } from '@/lib/notifications'
import { normalizeCustomFormFields } from '@/lib/eventCustomForm'
import { normalizeDefaultRegistrationFields } from '@/lib/registrationFields'
import {
  type DashboardEventSummary,
  DASHBOARD_EVENTS_SUMMARY_TAG,
  DASHBOARD_EVENTS_LIST_TAG,
  PUBLIC_EVENTS_TAG,
  DASHBOARD_EVENT_DETAIL_TAG_PREFIX,
  getEventDetailTag,
  getEventBookingsTag,
  normalizeEventCategories,
  getCachedDashboardEventsSummary,
  getCachedEventsList,
  fetchDashboardEventByIdFromDb,
} from './cache'

/**
 * Get all events from Firestore
 */
export async function getEvents(): Promise<Event[]> {
  await requireAuth() // Ensure user is authenticated
  try {
    return await getCachedEventsList()
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

/**
 * Get dashboard event summary data from Firestore
 * Reads only fields needed by dashboard home stats and recent events
 */
export async function getDashboardEventsSummary(): Promise<DashboardEventSummary[]> {
  await requireAuth() // Ensure user is authenticated

  try {
    return await getCachedDashboardEventsSummary()
  } catch (error) {
    console.error('Error fetching dashboard events summary:', error)
    return []
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  await requireAuth()

  try {
    return await unstable_cache(
      async (): Promise<Event | null> => fetchDashboardEventByIdFromDb(id),
      [DASHBOARD_EVENT_DETAIL_TAG_PREFIX, id],
      {
        tags: [getEventDetailTag(id)],
      }
    )()
  } catch (error) {
    console.error('Error fetching event:', error)
    throw new Error('Failed to fetch event')
  }
}

/**
 * Create a new event
 * Checks for duplicate event names before creating
 */
export async function createEvent(formData: {
  title: string
  titleBn?: string
  date: string | string[] // Accept both string and array
  description: string
  descriptionBn?: string
  time?: string
  timeBn?: string
  location?: string
  locationBn?: string
  venue?: string
  venueBn?: string
  fullDescription?: string
  fullDescriptionBn?: string
  eligibility?: string
  eligibilityBn?: string
  agenda?: string
  agendaBn?: string
  image?: string
  tags?: string[]
  tagsBn?: string[]
  isPaid?: boolean
  amount?: number
  paymentBkashNumber?: string
  categories?: Array<{ name: string; nameBn?: string; amount?: number }>
  registrationClosingDate?: string
  contactPersonName?: string
  contactPersonNameBn?: string
  contactPersonDesignation?: string
  contactPersonDesignationBn?: string
  contactPersonMobileOrEmail?: string
  customFormFields?: Event['customFormFields']
  defaultRegistrationFields?: Event['defaultRegistrationFields']
  certificateTemplateId?: string | null
}): Promise<{ success: boolean; error?: string; eventId?: string }> {
  const session = await requireAuth()
  if (!canCreateArea(session, 'events')) {
    return { success: false, error: 'You do not have permission to create events.' }
  }

  try {
    // Apply default time before sanitization for consistency
    const defaultTime = '9:00 AM - 5:00 PM'
    
    // Sanitize all event text fields before processing
    const sanitized = sanitizeEventForDatabase({
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      venue: formData.venue,
      location: formData.location,
      eligibility: formData.eligibility,
      time: formData.time || defaultTime,
      agenda: formData.agenda,
      tags: formData.tags,
    })

    // Check if event with same sanitized title already exists
    const existingEvents = await collectionWhere('events', 'title', '==', sanitized.title)

    if (existingEvents.length > 0) {
      return {
        success: false,
        error: 'An event with this name already exists',
      }
    }

    // Create event in Firestore
    const now = new Date().toISOString()
    // Normalize date: convert array to comma-separated string, or use string as-is
    const normalizedDate = Array.isArray(formData.date) 
      ? formData.date.length === 1 
        ? formData.date[0] 
        : formData.date.join(',')
      : formData.date
    
    // Use sanitized values for all text fields
    const isPaid = formData.isPaid ?? false
    const categories = normalizeEventCategories(formData.categories, isPaid)
    const customFormFields = normalizeCustomFormFields(formData.customFormFields)
    const defaultRegistrationFields = normalizeDefaultRegistrationFields(formData.defaultRegistrationFields, {
      hasCategories: categories.length > 0,
    })
    const slug = await ensureUniqueEventSlug(slugifyEventTitle(sanitized.title))
    const tagsBn = Array.isArray(formData.tagsBn)
      ? formData.tagsBn.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0)
      : []
    const eventId = await collectionAdd('events', {
      title: sanitized.title,
      titleBn: formData.titleBn?.trim() ?? '',
      slug,
      date: normalizedDate,
      description: sanitized.description,
      descriptionBn: formData.descriptionBn?.trim() ?? '',
      time: sanitized.time || defaultTime,
      timeBn: formData.timeBn?.trim() ?? '',
      location: sanitized.location,
      locationBn: formData.locationBn?.trim() ?? '',
      venue: sanitized.venue || sanitized.location,
      venueBn: formData.venueBn?.trim() ?? '',
      fullDescription: sanitized.fullDescription || sanitized.description,
      fullDescriptionBn: formData.fullDescriptionBn?.trim() ?? '',
      eligibility: sanitized.eligibility,
      eligibilityBn: formData.eligibilityBn?.trim() ?? '',
      agenda: sanitized.agenda,
      agendaBn: formData.agendaBn?.trim() ?? '',
      image: formData.image || '/robotics-event.gif',
      tags: sanitized.tags,
      tagsBn,
      isPaid,
      ...(isPaid && { amount: formData.amount ?? 0 }),
      ...(categories.length > 0 && { categories }),
      ...(isPaid && formData.paymentBkashNumber?.trim() && { paymentBkashNumber: formData.paymentBkashNumber.trim() }),
      ...(formData.registrationClosingDate?.trim() && { registrationClosingDate: formData.registrationClosingDate.trim() }),
      contactPersonName: formData.contactPersonName?.trim() ?? '',
      contactPersonNameBn: formData.contactPersonNameBn?.trim() ?? '',
      contactPersonDesignation: formData.contactPersonDesignation?.trim() ?? '',
      contactPersonDesignationBn: formData.contactPersonDesignationBn?.trim() ?? '',
      contactPersonMobileOrEmail: formData.contactPersonMobileOrEmail?.trim() ?? '',
      customFormFields,
      defaultRegistrationFields,
      certificateTemplateId: formData.certificateTemplateId?.trim() || null,
      createdAt: now,
      updatedAt: now,
      createdBy: session.uid,
      createdByName: session.name,
      createdByEmail: session.email,
    })

    // Revalidate ISR pages to show new event immediately
    revalidatePath('/events')
    revalidatePath(`/events/${slug}`)
    revalidateTag(DASHBOARD_EVENTS_LIST_TAG, 'max')
    revalidateTag(DASHBOARD_EVENTS_SUMMARY_TAG, 'max')
    revalidateTag(PUBLIC_EVENTS_TAG, 'max')

    // Create notification for event creation
    await createNotification(
      'event_created',
      `${session.name} created a new event: "${sanitized.title}"`,
      session,
      ['event created']
    )

    return {
      success: true,
      eventId,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create event. Please try again.',
    }
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(
  eventId: string,
  formData: {
    title: string
    titleBn?: string
    date: string | string[] // Accept both string and array
    description: string
    descriptionBn?: string
    time?: string
    timeBn?: string
    location?: string
    locationBn?: string
    venue?: string
    venueBn?: string
    fullDescription?: string
    fullDescriptionBn?: string
    eligibility?: string
    eligibilityBn?: string
    agenda?: string
    agendaBn?: string
    image?: string
    tags?: string[]
    tagsBn?: string[]
    isPaid?: boolean
    amount?: number
    paymentBkashNumber?: string
    categories?: Array<{ name: string; nameBn?: string; amount?: number }>
    registrationClosingDate?: string
    registrationDisabled?: boolean
    contactPersonName?: string
    contactPersonNameBn?: string
    contactPersonDesignation?: string
    contactPersonDesignationBn?: string
    contactPersonMobileOrEmail?: string
    customFormFields?: Event['customFormFields']
    defaultRegistrationFields?: Event['defaultRegistrationFields']
    certificateTemplateId?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  try {
    const eventDoc = await collectionGet('events', eventId)
    if (!eventDoc) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    const eventData = eventDoc as Record<string, unknown>

    if (!canEditResource(session, 'events', eventData.createdBy as string | undefined)) {
      return {
        success: false,
        error: 'You do not have permission to edit this event.',
      }
    }

    // Apply default time before sanitization for consistency
    const defaultTime = '9:00 AM - 5:00 PM'
    
    // Sanitize all event text fields before processing
    const sanitized = sanitizeEventForDatabase({
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      venue: formData.venue,
      location: formData.location,
      eligibility: formData.eligibility,
      time: formData.time || defaultTime,
      agenda: formData.agenda,
      tags: formData.tags,
    })

    // Check if another event with the same sanitized title exists (excluding current event)
    const existingEvents = await collectionWhere('events', 'title', '==', sanitized.title)

    const hasDuplicate = existingEvents.some((doc) => String(doc.id) !== eventId)
    if (hasDuplicate) {
      return {
        success: false,
        error: 'An event with this name already exists',
      }
    }

    // Update event in Firestore
    // Normalize date: convert array to comma-separated string, or use string as-is
    const normalizedDate = Array.isArray(formData.date) 
      ? formData.date.length === 1 
        ? formData.date[0] 
        : formData.date.join(',')
      : formData.date
    
    // Use sanitized values for all text fields
    const isPaid = formData.isPaid ?? (Boolean(eventData.isPaid) || false)
    const categories = normalizeEventCategories(
      formData.categories ??
        (Array.isArray(eventData.categories)
          ? (eventData.categories as Array<{ name: string; nameBn?: string; amount?: number }>)
          : undefined),
      isPaid,
    )
    const customFormFields = normalizeCustomFormFields(
      formData.customFormFields ??
        (Array.isArray(eventData.customFormFields)
          ? (eventData.customFormFields as Event['customFormFields'])
          : undefined),
    )
    const defaultRegistrationFields = normalizeDefaultRegistrationFields(
      formData.defaultRegistrationFields ??
        (eventData.defaultRegistrationFields as Event['defaultRegistrationFields'] | undefined),
      {
        hasCategories: categories.length > 0,
      },
    )
    const previousSlug =
      typeof eventData.slug === 'string' && eventData.slug.trim() ? eventData.slug.trim() : ''
    const slug = await ensureUniqueEventSlug(slugifyEventTitle(sanitized.title), eventId)
    const tagsBn = Array.isArray(formData.tagsBn)
      ? formData.tagsBn.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0)
      : Array.isArray(eventData.tagsBn)
        ? (eventData.tagsBn as unknown[]).map((tag) => String(tag).trim()).filter((tag) => tag.length > 0)
        : []
    await collectionSet('events', eventId, {
      title: sanitized.title,
      titleBn: formData.titleBn?.trim() ?? (typeof eventData.titleBn === 'string' ? eventData.titleBn : ''),
      slug,
      date: normalizedDate,
      description: sanitized.description,
      descriptionBn:
        formData.descriptionBn?.trim() ??
        (typeof eventData.descriptionBn === 'string' ? eventData.descriptionBn : ''),
      time: sanitized.time || defaultTime,
      timeBn: formData.timeBn?.trim() ?? (typeof eventData.timeBn === 'string' ? eventData.timeBn : ''),
      location: sanitized.location,
      locationBn:
        formData.locationBn?.trim() ??
        (typeof eventData.locationBn === 'string' ? eventData.locationBn : ''),
      venue: sanitized.venue || sanitized.location,
      venueBn: formData.venueBn?.trim() ?? (typeof eventData.venueBn === 'string' ? eventData.venueBn : ''),
      fullDescription: sanitized.fullDescription || sanitized.description,
      fullDescriptionBn:
        formData.fullDescriptionBn?.trim() ??
        (typeof eventData.fullDescriptionBn === 'string' ? eventData.fullDescriptionBn : ''),
      eligibility: sanitized.eligibility,
      eligibilityBn:
        formData.eligibilityBn?.trim() ??
        (typeof eventData.eligibilityBn === 'string' ? eventData.eligibilityBn : ''),
      agenda: sanitized.agenda,
      agendaBn: formData.agendaBn?.trim() ?? (typeof eventData.agendaBn === 'string' ? eventData.agendaBn : ''),
      image: formData.image || '/robotics-event.gif',
      tags: sanitized.tags,
      tagsBn,
      isPaid,
      amount: isPaid ? (formData.amount ?? 0) : 0,
      categories,
      paymentBkashNumber: isPaid ? (formData.paymentBkashNumber ?? '').toString().trim() : '',
      registrationClosingDate: formData.registrationClosingDate?.trim() ?? '',
      registrationDisabled: formData.registrationDisabled ?? false,
      contactPersonName: formData.contactPersonName?.trim() ?? '',
      contactPersonNameBn:
        formData.contactPersonNameBn?.trim() ??
        (typeof eventData.contactPersonNameBn === 'string' ? eventData.contactPersonNameBn : ''),
      contactPersonDesignation: formData.contactPersonDesignation?.trim() ?? '',
      contactPersonDesignationBn:
        formData.contactPersonDesignationBn?.trim() ??
        (typeof eventData.contactPersonDesignationBn === 'string'
          ? eventData.contactPersonDesignationBn
          : ''),
      contactPersonMobileOrEmail: formData.contactPersonMobileOrEmail?.trim() ?? '',
      customFormFields,
      defaultRegistrationFields,
      certificateTemplateId: formData.certificateTemplateId?.trim() || null,
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    // Revalidate ISR pages to show updated event immediately
    revalidatePath('/events')
    revalidatePath(`/events/${slug}`)
    if (previousSlug && previousSlug !== slug) {
      revalidatePath(`/events/${previousSlug}`)
    }
    revalidatePath(`/events/${eventId}`)
    revalidateTag(DASHBOARD_EVENTS_LIST_TAG, 'max')
    revalidateTag(DASHBOARD_EVENTS_SUMMARY_TAG, 'max')
    revalidateTag(getEventDetailTag(eventId), 'max')
    revalidateTag(PUBLIC_EVENTS_TAG, 'max')

    // Create notification for event update
    await createNotification(
      'event_updated',
      `${session.name} updated the event: "${sanitized.title}"`,
      session,
      ['event updated']
    )

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating event:', error)
    return {
      success: false,
      error: 'Failed to update event. Please try again.',
    }
  }
}

/**
 * Delete an event
 * Only the user who created the event can delete it
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireAuth()

  try {
    const eventDoc = await collectionGet('events', eventId)
    if (!eventDoc) {
      return {
        success: false,
        error: 'Event not found',
      }
    }

    const eventData = eventDoc as Record<string, unknown>

    if (!canDeleteResource(session, 'events', eventData.createdBy as string | undefined)) {
      return {
        success: false,
        error: 'You do not have permission to delete this event.',
      }
    }

    // Delete all bookings associated with this event
    const bookings = await getBookingsByEventId(eventId)
    await Promise.all([
      ...bookings.map((b) => collectionDelete('bookings', String(b.id))),
      collectionDelete('events', eventId),
    ])

    // Revalidate ISR pages to remove deleted event immediately
    const deletedSlug =
      typeof eventData.slug === 'string' && eventData.slug.trim() ? eventData.slug.trim() : ''
    revalidatePath('/events')
    if (deletedSlug) {
      revalidatePath(`/events/${deletedSlug}`)
    }
    revalidatePath(`/events/${eventId}`)
    revalidateTag(DASHBOARD_EVENTS_LIST_TAG, 'max')
    revalidateTag(DASHBOARD_EVENTS_SUMMARY_TAG, 'max')
    revalidateTag(getEventDetailTag(eventId), 'max')
    revalidateTag(getEventBookingsTag(eventId), 'max')
    revalidateTag(PUBLIC_EVENTS_TAG, 'max')

    // Create notification for event deletion
    await createNotification(
      'event_deleted',
      `${session.name} deleted the event: "${eventData.title}"`,
      session,
      ['event deleted']
    )

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    return {
      success: false,
      error: 'Failed to delete event. Please try again.',
    }
  }
}
