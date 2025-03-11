import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

// Rate limit configuration
const RATE_LIMIT_MAX = 5 // Maximum attempts
const RATE_LIMIT_WINDOW = 60 * 15 // 15 minutes in seconds

// Define isDev variable to check if we're in development mode
const isDev = process.env.NODE_ENV === 'development'

function generateNonce() {
  const randomBytes = new Uint8Array(16)
  crypto.getRandomValues(randomBytes)

  let base64Nonce = ''
  randomBytes.forEach((byte) => {
    base64Nonce += String.fromCharCode(byte)
  })
  return btoa(base64Nonce)
}

export async function middleware(request: NextRequest) {
  // Create a response that we'll eventually return
  const response = NextResponse.next()

  // Generate nonce for CSP
  const nonce = generateNonce()

  // Define CSP directives as arrays and join them with semicolons
  const devCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
    "form-action 'self'"
  ].join("; ");

  const prodCsp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdnjs.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "report-uri /api/csp-report"
  ].join("; ");

  // Select appropriate CSP based on environment
  const cspHeader = isDev ? devCsp : prodCsp;

  // Add the CSP header
  response.headers.set('Content-Security-Policy', cspHeader)

  // Add the nonce as a custom header
  response.headers.set('x-nonce', nonce)

  // Rate limiting for auth endpoints
  if (
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/auth/forgot-password')
  ) {
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const key = `rate-limit:${ip}:${request.nextUrl.pathname}`

      const result = await redis.get(key)
      // Get current count and timestamp
      const count = result ? parseInt(result as string, 10) : 0

      if (count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { message: 'Too many requests, please try again later' },
          { status: 429 },
        )
      }

      await redis.incr(key)

      if (count === 0) {
        await redis.expire(key, RATE_LIMIT_WINDOW)
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue even if rate limiting fails
    }
  }

  // Your existing authentication logic
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  const protectedPaths = ['/dashboard', '/settings', '/profile']

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (
    isAuthenticated &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/register'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}