import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { requireSuperAdmin } from '@/lib/auth'

/**
 * User Management API Routes
 * Super Admin only - List users and create new users
 */

/**
 * GET /api/admin/users
 * List all users with their roles
 * Super Admin only
 */
export async function GET(request: NextRequest) {
  try {
    // Require Super Admin
    await requireSuperAdmin()

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    // List all users
    const listUsersResult = await adminAuth.listUsers(1000) // Max 1000 users per page
    
    const users = listUsersResult.users.map((user) => {
      // Get role from custom claims
      const role = (user.customClaims?.role as 'superAdmin' | 'admin' | undefined) || 'admin'
      
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        emailVerified: user.emailVerified,
        role,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
        disabled: user.disabled,
      }
    })

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    })
  } catch (error) {
    console.error('Error listing users:', error)
    
    // Check if it's an auth error (not Super Admin)
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to list users' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/users
 * Create a new user (Admin role)
 * Super Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Require Super Admin
    const session = await requireSuperAdmin()

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password, displayName } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Validate password strength (minimum 6 characters for Firebase)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || '',
      emailVerified: false,
    })

    // Set Admin role (Super Admin can only create Admin users, not other Super Admins)
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
    })

    // Create notification for user creation
    if (adminDb) {
      try {
        await adminDb.collection('notifications').add({
          type: 'user_created',
          message: `${session.name} created a new admin user: ${email}`,
          userId: session.uid,
          userName: session.name,
          userEmail: session.email,
          changes: ['user created'],
          readBy: [],
          createdAt: new Date(),
        })
      } catch (error) {
        // Silently fail
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
        emailVerified: userRecord.emailVerified,
        role: 'admin',
      },
      message: 'User created successfully',
    })
  } catch (error: unknown) {
    console.error('Error creating user:', error)
    
    // Check if it's an auth error (not Super Admin)
    if (error instanceof Error && error.message.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin access required' },
        { status: 403 }
      )
    }

    // Handle Firebase Auth errors
    const firebaseError = error as { code?: string; message?: string }
    if (firebaseError.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
