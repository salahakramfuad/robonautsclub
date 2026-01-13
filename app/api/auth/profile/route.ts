import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth'

/**
 * Profile Update API Route
 * Allows users to update their own profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { displayName, email } = body

    // Validate input
    if (!displayName || !email) {
      return NextResponse.json(
        { error: 'Display name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get current user data to check what changed
    const currentUser = await adminAuth.getUser(session.uid)
    const changes: string[] = []

    if (currentUser.displayName !== displayName) {
      changes.push('display name')
    }
    if (currentUser.email !== email) {
      changes.push('email')
    }

    // Update user
    const updateData: {
      displayName?: string
      email?: string
    } = {}

    if (displayName !== currentUser.displayName) {
      updateData.displayName = displayName.trim()
    }
    if (email !== currentUser.email) {
      updateData.email = email.trim()
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await adminAuth.updateUser(session.uid, updateData)

      // Create notification for profile update
      if (changes.length > 0) {
        try {
          const { adminDb } = await import('@/lib/firebase-admin')
          if (adminDb) {
            await adminDb.collection('notifications').add({
              type: 'profile_update',
              message: `${session.name || session.email} updated their ${changes.join(' and ')}`,
              userId: session.uid,
              userName: session.name,
              userEmail: session.email,
              changes: changes,
              readBy: [],
              createdAt: new Date(),
            })
          }
        } catch (notifError) {
          console.error('Error creating notification:', notifError)
          // Don't fail the profile update if notification fails
        }
      }
    }

    // Get updated user
    const updatedUser = await adminAuth.getUser(session.uid)

    return NextResponse.json({
      success: true,
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
      },
      message: 'Profile updated successfully',
    })
  } catch (error: unknown) {
    console.error('Error updating profile:', error)

    // Handle Firebase Auth errors
    const firebaseError = error as { code?: string; message?: string }
    if (firebaseError.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
