/**
 * Minimal JWT payload decode for middleware (Edge).
 * Does NOT verify signature - used only to check exp for cookie clearing.
 */

const BUFFER_SECONDS = 60 // treat as expired 60s before actual exp

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = parts[1]
    // Base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    const parsed = JSON.parse(decoded) as { exp?: number }
    if (typeof parsed.exp !== 'number') return true
    const nowSeconds = Math.floor(Date.now() / 1000)
    return parsed.exp < nowSeconds + BUFFER_SECONDS
  } catch {
    return true
  }
}
