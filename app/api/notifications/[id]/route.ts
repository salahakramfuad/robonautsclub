import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth'

/**
 * Notification API Routes - Individual Notification Operations
 * PUT: Mark notification as read
 * DELETE: Delete notification (optional)
 */

/**
 * PUT /api/notifications/[id]
 * Mark a notification as read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Get the notification
    const notificationRef = adminDb.collection('notifications').doc(id)
    const notificationDoc = await notificationRef.get()

    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const data = notificationDoc.data()!
    const readBy = data.readBy || []

    // Add current user to readBy if not already there
    if (!readBy.includes(session.uid)) {
      await notificationRef.update({
        readBy: [...readBy, session.uid],
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification (optional feature)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    await adminDb.collection('notifications').doc(id).delete()

    return NextResponse.json({
      success: true,
      message: 'Notification deleted',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
