import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth'

/**
 * Notifications API Routes
 * GET: List notifications for authenticated users (admins/super admins)
 * POST: Create a notification (internal use)
 */

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query - get all notifications ordered by date
    const snapshot = await adminDb
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    // Map and filter notifications
    const allNotifications = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        const isRead = (data.readBy || []).includes(session.uid)

        return {
          id: doc.id,
          type: data.type,
          message: data.message,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          changes: data.changes || [],
          readBy: data.readBy || [],
          isRead,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        }
      })

    // Count unread from all notifications
    const unreadCount = allNotifications.filter((n) => !n.isRead).length

    // Filter unread if requested
    const filteredNotifications = unreadOnly
      ? allNotifications.filter((n) => !n.isRead)
      : allNotifications

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount,
      total: filteredNotifications.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a notification (internal use, typically called from other API routes)
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

    const body = await request.json()
    const { type, message, userId, userName, userEmail, changes } = body

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Type and message are required' },
        { status: 400 }
      )
    }

    const notification = {
      type,
      message,
      userId: userId || session.uid,
      userName: userName || session.name,
      userEmail: userEmail || session.email,
      changes: changes || [],
      readBy: [],
      createdAt: new Date(),
    }

    const docRef = await adminDb.collection('notifications').add(notification)

    return NextResponse.json({
      success: true,
      notificationId: docRef.id,
      notification,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
