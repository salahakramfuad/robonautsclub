'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

/**
 * Client-side component that checks for token expiration
 * and redirects to login if the token has expired
 */
export default function TokenExpirationChecker() {
  const router = useRouter()

  useEffect(() => {
    // Only run on client side and if auth is available
    if (!auth) {
      return
    }

    // Check auth state changes (handles token expiration)
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          // User is not authenticated, clear cookies and redirect
          document.cookie = 'auth-token=; path=/; max-age=0'
          document.cookie = 'user-info=; path=/; max-age=0'
          router.push('/login')
          return
        }

        // Check if token is still valid by trying to get a fresh token
        try {
          const token = await user.getIdToken(true) // Force refresh if needed
          
          if (!token) {
            // No valid token, redirect to login
            document.cookie = 'auth-token=; path=/; max-age=0'
            document.cookie = 'user-info=; path=/; max-age=0'
            router.push('/login')
            return
          }

          // Assign/refresh role via server-side API (ensures custom claims are up-to-date)
          try {
            const roleResponse = await fetch('/api/auth/assign-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
            })

            if (roleResponse.ok) {
              // Get fresh token with updated claims after role assignment
              const freshToken = await user.getIdToken(true)
              // Use the fresh token with updated claims (1 hour session)
              document.cookie = `auth-token=${freshToken}; path=/; max-age=3600; SameSite=Lax`
            } else {
              // Role assignment failed, but continue with current token
              document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`
            }
          } catch (roleError) {
            console.error('Error assigning role during token refresh:', roleError)
            // Continue with current token even if role assignment fails
            // The role will be assigned on next token refresh or login
            document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`
          }
        } catch (error: unknown) {
          console.error('Token refresh error:', error)
          
          // Token refresh failed (likely expired), redirect to login
          document.cookie = 'auth-token=; path=/; max-age=0'
          document.cookie = 'user-info=; path=/; max-age=0'
          router.push('/login')
        }
      },
      (error) => {
        console.error('Auth state change error:', error)
        // Auth error occurred, clear cookies and redirect
        document.cookie = 'auth-token=; path=/; max-age=0'
        document.cookie = 'user-info=; path=/; max-age=0'
        router.push('/login')
      }
    )

    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [router])

  // This component doesn't render anything
  return null
}
