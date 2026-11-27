import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { getDb, notifications } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

const MARK_ALL_READ_LIMIT = 200

export async function POST() {
  try {
    const session = await requireAuth()
    const db = await getDb()

    // One read of the recent rows (raw payload JSON)…
    const rows = await db
      .select({ id: notifications.id, payload: notifications.payload })
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(MARK_ALL_READ_LIMIT)

    const updates = []
    for (const row of rows) {
      let payload: Record<string, unknown>
      try {
        payload = JSON.parse(row.payload || '{}') as Record<string, unknown>
      } catch {
        continue
      }
      const readBy = Array.isArray(payload.readBy)
        ? payload.readBy.filter((v): v is string => typeof v === 'string')
        : []
      if (readBy.includes(session.uid)) continue
      payload.readBy = [...readBy, session.uid]
      updates.push(
        db
          .update(notifications)
          .set({ payload: JSON.stringify(payload) })
          .where(eq(notifications.id, row.id)),
      )
    }

    // …and every update in a single D1 batch (one round trip, atomic) instead of
    // a read + write per notification.
    if (updates.length > 0) {
      await db.batch(updates as [(typeof updates)[number], ...(typeof updates)[number][]])
    }

    return NextResponse.json({
      success: true,
      markedAsRead: updates.length,
      message: `Marked ${updates.length} notification(s) as read`,
    })
  } catch (error) {
    console.error('mark-all-read failed:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}
