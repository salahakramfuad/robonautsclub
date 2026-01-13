/**
 * Client-side auth utilities
 * Helper functions for checking roles in client components
 */

/**
 * Get user role from cookie (client-side)
 * Note: This is a fallback and may not always be accurate.
 * For accurate role checking, use server-side getServerSession()
 */
export function getClientRole(): 'superAdmin' | 'admin' | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const userInfoCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user-info='))
      ?.split('=')[1]

    if (!userInfoCookie) {
      return null
    }

    const userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
    return userInfo.role || 'admin'
  } catch (error) {
    console.error('Error parsing user info cookie:', error)
    return null
  }
}

/**
 * Check if current user is Super Admin (client-side)
 * Note: This is a fallback and may not always be accurate.
 * For accurate role checking, use server-side isSuperAdmin()
 */
export function isClientSuperAdmin(): boolean {
  const role = getClientRole()
  return role === 'superAdmin'
}

/**
 * Check if current user is Admin (client-side)
 * Note: This is a fallback and may not always be accurate.
 * For accurate role checking, use server-side isAdmin()
 */
export function isClientAdmin(): boolean {
  const role = getClientRole()
  return role === 'admin' || role === 'superAdmin'
}
