import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import next from 'next'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Protected routes
  const protectedPaths = ['/dashboard', '/settings', '/profile']

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  // Redirects to login if not authenticated
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirects to dashboard if authenticated
  if (
    isAuthenticated &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/register'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')

  response.headers.set('X-Frame-Options', 'DENY')

  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  )

  response.headers.set('X-XSS-Protection', '1; mode=block')

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self'",
  )

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
