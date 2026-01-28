import { isTokenExpired } from '@/lib/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function clearAuthAndRedirect(loginUrl: URL) {
  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete('auth-token')
  response.cookies.delete('user-info')
  return response
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Protect dashboard routes
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
  }

  // If user is logged in with valid token and tries to access login, redirect to dashboard
  if (pathname === '/login' && token) {
    const tokenParts = token.split('.')
    if (tokenParts.length === 3 && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Expired or invalid token: clear cookies so login page loads
    return clearAuthAndRedirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

