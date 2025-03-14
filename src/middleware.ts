import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from './lib/rateLimit'

export async function middleware(request: NextRequest) {
  // Get URL pathname for debugging
  const pathname = request.nextUrl.pathname

  const rateLimits = {
    '/api/auth/login': { limit: 5, window: 300 }, // 5 attempts per 5 minutes
    '/api/auth/register': { limit: 3, window: 3600 }, // 3 attempts per hour
    '/api/auth/forgot-password': { limit: 3, window: 3600 }, // 3 attempts per hour
    '/api/auth/reset-password': { limit: 5, window: 3600 }, // 5 attempts per hour
    '/api/account/delete': { limit: 3, window: 86400 }, // 3 attempts per day
  }

  const routeConfig = Object.entries(rateLimits).find(([route]) =>
    pathname.startsWith(route),
  )

  if (routeConfig) {
    const [, config] = routeConfig

    const rateLimit = await rateLimiter(request, config)
    if (rateLimit) return rateLimit
  }

  // Skip all processing for callback routes
  if (
    pathname.startsWith('/api/auth/callback') ||
    pathname.includes('/api/auth/callback/')
  ) {
    return NextResponse.next()
  }

  const redirectCount = parseInt(
    request.headers.get('x-redirect-count') || '0',
    10,
  )
  if (redirectCount > 5) {
    console.error('Redirect loop detected and prevented')
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : '';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com ${supabaseDomain ? `https://${supabaseDomain}` : ''};
  font-src 'self' https://cdnjs.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' ${supabaseUrl};
  upgrade-insecure-requests;
  block-all-mixed-content;
`
  .replace(/\s{2,}/g, ' ')
  .trim()
  const response = NextResponse.next()

  // Set Security Headers
  response.headers.set('Content-Security-Policy', cspHeader)

  // CORS Configuration
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.tarevity.pt',
    'https://accounts.google.com',
    'https://github.com',
  ]

  // Only set CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    // Only set the CORS headers if the origin is in our allowed list
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      )
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      )
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      })
    }
  }

  // Skip authentication logic for API routes
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Authentication logic
  const token = await getToken({
    req: request,
    secureCookie: process.env.NODE_ENV === 'production',
  })
  const isAuthenticated = !!token

  const protectedPaths = ['/dashboard', '/settings', '/profile']
  const authPaths = ['/auth/login', '/auth/register']

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )
    return redirectResponse
  }

  if (isAuthenticated && isAuthPath) {
    const redirectResponse = NextResponse.redirect(
      new URL('/dashboard', request.url),
    )
    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )
    return redirectResponse
  }

  return response
}

// Make sure your matcher includes all API paths but excludes OAuth callback paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/((?!api/auth/callback).*)',
    // Include specific API routes
    '/api/todos/:path*',
    '/api/profile/:path*',
    '/api/stats/:path*',
    '/api/account/:path*',
  ],
}
