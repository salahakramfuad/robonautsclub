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

          // Token is valid, update it in the cookie
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`
        } catch (error: any) {
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
