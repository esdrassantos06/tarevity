import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60 * 15


export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  const isProd = process.env.NODE_ENV === 'production'


  const cspHeader = [
    "default-src 'self'",
    isProd 
      ? `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com` // Produção: precisa de unsafe-inline para o Next.js
      : `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com`, // Dev: precisa de eval para HMR
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self'",
    "connect-src 'self'" + (isProd ? "" : " ws: wss:"),
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    isProd ? "report-uri /api/csp-report" : "",
    isProd ? "upgrade-insecure-requests" : ""
  ].filter(Boolean).join("; ")

  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  if (isProd) {
    const stricterPolicyForReporting = cspHeader.replace("'unsafe-inline'", `'nonce-${nonce}'`)
    response.headers.set('Content-Security-Policy-Report-Only', stricterPolicyForReporting)
  }

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
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|public).*)',
  ],
}
