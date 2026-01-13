import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth'

/**
 * Mark all notifications as read for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    // Get all unread notifications
    const snapshot = await adminDb
      .collection('notifications')
      .get()

    const batch = adminDb.batch()
    let updatedCount = 0

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const readBy = data.readBy || []

      // If user hasn't read this notification, add them to readBy
      if (!readBy.includes(session.uid)) {
        batch.update(doc.ref, {
          readBy: [...readBy, session.uid],
        })
        updatedCount++
      }
    })

    // Commit all updates
    if (updatedCount > 0) {
      await batch.commit()
    }

    return NextResponse.json({
      success: true,
      markedAsRead: updatedCount,
      message: `Marked ${updatedCount} notification(s) as read`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}
