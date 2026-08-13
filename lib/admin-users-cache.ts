import { unstable_cache, revalidateTag } from 'next/cache'
import { adminAuth } from '@/lib/firebase-admin'

export const DASHBOARD_ADMIN_USERS_TAG = 'dashboard-admin-users'

export type CachedAdminUser = {
  uid: string
  email: string
  displayName: string
  emailVerified: boolean
  role: 'superAdmin' | 'admin'
  createdAt: string
  lastSignIn: string | null
  disabled: boolean
}

async function fetchAdminUsersFromAuth(): Promise<CachedAdminUser[]> {
  if (!adminAuth) return []
  const listUsersResult = await adminAuth.listUsers(1000)
  return listUsersResult.users.map((user) => {
    const role =
      (user.customClaims?.role as 'superAdmin' | 'admin' | undefined) || 'admin'
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
}

export async function listAdminUsersCached(): Promise<CachedAdminUser[]> {
  return unstable_cache(fetchAdminUsersFromAuth, [DASHBOARD_ADMIN_USERS_TAG], {
    tags: [DASHBOARD_ADMIN_USERS_TAG],
    revalidate: 300,
  })()
}

export function revalidateAdminUsersCache(): void {
  revalidateTag(DASHBOARD_ADMIN_USERS_TAG, 'max')
}
