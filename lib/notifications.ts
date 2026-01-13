import { adminDb } from './firebase-admin'
import type { Session } from './auth'

/**
 * Helper function to create notifications for database changes
 * This is called from server actions to notify all admins/super admins
 */
export async function createNotification(
  type: string,
  message: string,
  session: Session,
  changes?: string[]
): Promise<void> {
  try {
    if (!adminDb) {
      return
    }

    await adminDb.collection('notifications').add({
      type,
      message,
      userId: session.uid,
      userName: session.name,
      userEmail: session.email,
      changes: changes || [],
      readBy: [],
      createdAt: new Date(),
    })
  } catch (error) {
    // Silently fail - don't break the main operation if notification fails
  }
}
