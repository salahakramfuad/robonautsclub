import { NextResponse } from 'next/server'
import { getBookingByRegistrationId } from '@/lib/verify-registration'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ registrationId: string }>
}

/**
 * API endpoint to verify a registration ID
 * Returns JSON with verification status and booking details
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { registrationId } = await params

    if (!registrationId || registrationId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Registration ID is required',
        },
        { status: 400 },
      )
    }

    const { booking, event } = await getBookingByRegistrationId(registrationId)

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Registration ID not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        booking: {
          id: booking.id,
          registrationId: booking.registrationId,
          name: booking.name,
          school: booking.school,
          email: booking.email,
          phone: booking.phone,
          bkashNumber: booking.bkashNumber,
          createdAt: booking.createdAt,
        },
        event: event
          ? {
              id: event.id,
              title: event.title,
              date: event.date,
              time: event.time,
              location: event.location,
              venue: event.venue,
              description: event.description,
            }
          : null,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error verifying registration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while verifying the registration',
      },
      { status: 500 },
    )
  }
}
