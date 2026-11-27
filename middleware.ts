import { isTokenExpired } from '@/lib/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes

function clearAuthAndRedirect(loginUrl: URL) {
  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete('auth-token')
  response.cookies.delete('user-info')
  response.cookies.delete('session-start')
  return response
}

/**
 * Edge middleware for Cloudflare OpenNext (Node.js middleware / proxy.ts is unsupported).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return clearAuthAndRedirect(loginUrl)
    }

    if (isTokenExpired(token)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return clearAuthAndRedirect(loginUrl)
    }

    const sessionStartCookie = request.cookies.get('session-start')?.value
    if (sessionStartCookie) {
      const sessionStart = parseInt(sessionStartCookie, 10)
      if (Number.isFinite(sessionStart) && Date.now() - sessionStart > SESSION_DURATION_MS) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return clearAuthAndRedirect(loginUrl)
      }
    }
  }

  if (pathname === '/login' && token) {
    const tokenParts = token.split('.')
    if (tokenParts.length === 3 && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return clearAuthAndRedirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/dashboard') || pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.next()
  }

  // Public marketing pages: `/bn/...` for Bangla, unprefixed English rewritten to `/en/...`.
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login/:path*',
    // Everything except API routes, Next internals, and files with an extension
    // (sitemap.xml, robots.txt, .well-known/*, images, fonts…).
    '/((?!api|_next|_vercel|monitoring|.*\\..*).*)',
  ],
}
