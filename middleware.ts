import createMiddleware from 'next-intl/middleware'
import { isTokenExpired } from '@/lib/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes

const handleI18nRouting = createMiddleware(routing)

function clearAuthAndRedirect(loginUrl: URL) {
  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete('auth-token')
  response.cookies.delete('user-info')
  response.cookies.delete('session-start')
  return response
}

/**
 * Edge middleware for Cloudflare OpenNext (Node.js middleware / proxy.ts is unsupported).
 * Combines auth gates with next-intl locale routing.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Dashboard is outside the locale tree — auth only.
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

    return NextResponse.next()
  }

  // Login (with or without /bn prefix) — redirect away if already authenticated.
  const isLoginPath =
    pathname === '/login' ||
    pathname === '/bn/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/bn/login/')

  if (isLoginPath && token) {
    const tokenParts = token.split('.')
    if (tokenParts.length === 3 && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const loginPath = pathname.startsWith('/bn') ? '/bn/login' : '/login'
    return clearAuthAndRedirect(new URL(loginPath, request.url))
  }

  // Skip i18n for API routes (matcher should already exclude them).
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: [
    // Auth + locale-aware public routes; skip api, static files, _next
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
