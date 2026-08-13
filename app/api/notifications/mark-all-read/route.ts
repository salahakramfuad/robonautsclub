import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth'

const MARK_ALL_READ_FALLBACK_LIMIT = 200

/**
 * Mark notifications as read for the current user.
 * Prefer an explicit `ids` list (loaded panel items). Without ids, only a recent window is scanned.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 },
      )
    }

    let ids: string[] = []
    try {
      const body = (await request.json()) as { ids?: unknown }
      if (Array.isArray(body?.ids)) {
        ids = body.ids
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          .map((id) => id.trim())
          .slice(0, 50)
      }
    } catch {
      // empty / non-JSON body — fall back to recent window
    }

    const batch = adminDb.batch()
    let updatedCount = 0

    if (ids.length > 0) {
      const refs = ids.map((id) => adminDb!.collection('notifications').doc(id))
      const snaps = await adminDb.getAll(...refs)
      for (const doc of snaps) {
        if (!doc.exists) continue
        const data = doc.data() || {}
        const readBy: string[] = Array.isArray(data.readBy) ? data.readBy : []
        if (readBy.includes(session.uid)) continue
        batch.update(doc.ref, { readBy: [...readBy, session.uid] })
        updatedCount++
      }
    } else {
      const snapshot = await adminDb
        .collection('notifications')
        .orderBy('createdAt', 'desc')
        .limit(MARK_ALL_READ_FALLBACK_LIMIT)
        .get()

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const readBy: string[] = Array.isArray(data.readBy) ? data.readBy : []
        if (readBy.includes(session.uid)) return
        batch.update(doc.ref, { readBy: [...readBy, session.uid] })
        updatedCount++
      })
    }

    if (updatedCount > 0) {
      await batch.commit()
    }

    return NextResponse.json({
      success: true,
      markedAsRead: updatedCount,
      message: `Marked ${updatedCount} notification(s) as read`,
    })
  } catch (error) {
    console.error('mark-all-read failed:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 },
    )
  }
}
