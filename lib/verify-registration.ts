import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { adminDb } from '@/lib/firebase-admin'
import type { Booking } from '@/types/booking'
import type { Event } from '@/types/event'

export type VerifyRegistrationResult = {
  booking: Booking | null
  event: Event | null
}

function serializeBooking(booking: Booking): Booking {
  const createdAt =
    booking.createdAt instanceof Date
      ? booking.createdAt.toISOString()
      : booking.createdAt
  return { ...booking, createdAt }
}

function serializeEvent(event: Event): Event {
  const createdAt =
    event.createdAt instanceof Date
      ? event.createdAt.toISOString()
      : event.createdAt
  const updatedAt =
    event.updatedAt instanceof Date
      ? event.updatedAt.toISOString()
      : event.updatedAt
  return { ...event, createdAt, updatedAt }
}

async function fetchBookingByRegistrationIdFromDb(
  registrationId: string,
): Promise<VerifyRegistrationResult> {
  if (!adminDb || !registrationId.trim()) {
    return { booking: null, event: null }
  }

  const bookingsSnapshot = await adminDb
    .collection('bookings')
    .where('registrationId', '==', registrationId.trim())
    .limit(1)
    .get()

  if (bookingsSnapshot.empty) {
    return { booking: null, event: null }
  }

  const bookingDoc = bookingsSnapshot.docs[0]
  const bookingData = bookingDoc.data()
  const booking = serializeBooking({
    id: bookingDoc.id,
    ...bookingData,
    createdAt: bookingData.createdAt?.toDate?.() || bookingData.createdAt,
  } as Booking)

  const eventDoc = await adminDb.collection('events').doc(booking.eventId).get()
  if (!eventDoc.exists) {
    return { booking, event: null }
  }

  const eventData = eventDoc.data()!
  const event = serializeEvent({
    id: eventDoc.id,
    ...eventData,
    createdAt: eventData.createdAt?.toDate?.() || eventData.createdAt,
    updatedAt: eventData.updatedAt?.toDate?.() || eventData.updatedAt,
  } as Event)

  return { booking, event }
}

/**
 * Request-scoped dedupe (metadata + page) plus short TTL cache per registrationId.
 */
export const getBookingByRegistrationId = cache(
  async (registrationId: string): Promise<VerifyRegistrationResult> => {
    const id = registrationId.trim()
    if (!id || !adminDb) {
      return { booking: null, event: null }
    }

    try {
      return await unstable_cache(
        () => fetchBookingByRegistrationIdFromDb(id),
        ['verify-registration', id],
        {
          tags: [`verify-registration-${id}`],
          revalidate: 120,
        },
      )()
    } catch (error) {
      console.error('Error fetching booking for verify:', error)
      return { booking: null, event: null }
    }
  },
)
