import { cookies } from 'next/headers'
import { adminAuth } from './firebase-admin'
import { redirect } from 'next/navigation'

/**
 * Get the current user session from the auth token cookie (server-side)
 * Returns the decoded token with user info, or null if not authenticated
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    const userInfo = cookieStore.get('user-info')?.value

    if (!token) {
      return null
    }

    // If Admin SDK is available, verify the token properly
    if (adminAuth) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        const user = await adminAuth.getUser(decodedToken.uid)
        
        return {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || user.email || 'Admin',
          emailVerified: user.emailVerified,
        }
      } catch (error: unknown) {
        const errorObj = error as { code?: string; message?: string }
        const errorCode = errorObj.code
        
        // Handle expected token expiration/invalidation errors silently
        // These are normal part of the auth flow and don't need to be logged as errors
        if (errorCode === 'auth/id-token-expired' || 
            errorCode === 'auth/argument-error' ||
            errorCode === 'auth/invalid-id-token') {
          // Token is expired or invalid - return null to trigger redirect
          // This is expected behavior and will be handled by redirecting to login
          return null
        }
        
        // Log unexpected errors (network issues, server errors, etc.)
        console.error('Unexpected error verifying auth token:', error)
        
        return null
      }
    }

    // Fallback: If Admin SDK is not available, use stored user info
    // This is less secure but allows the app to work without Admin SDK
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo)
        // Basic validation - ensure it has required fields
        if (parsed.uid && parsed.email) {
          return {
            uid: parsed.uid,
            email: parsed.email,
            name: parsed.name || parsed.email || 'Admin',
            emailVerified: parsed.emailVerified || false,
          }
        }
      } catch (error) {
        console.error('Error parsing user info:', error)
      }
    }

    // If no user info and no Admin SDK, return null (not authenticated)
    console.warn('Firebase Admin SDK not available and no user info found. Session verification failed.')
    return null
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Also redirects if token is expired or invalid
 * Use this in server components and server actions
 */
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    // Redirect to login - cookie clearing should be handled in logout route handler
    // Cookies cannot be modified from page components or server functions,
    // only from Server Actions or Route Handlers
    redirect('/login')
  }
  
  return session
}

/**
 * Set auth token in cookie (client-side helper)
 * This should be called after successful login
 */
export function setAuthToken(token: string) {
  document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax` // 24 hours
}

/**
 * Clear auth token cookie (client-side helper)
 * This should be called on logout
 */
export function clearAuthToken() {
  document.cookie = 'auth-token=; path=/; max-age=0'
}

