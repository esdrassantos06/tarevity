import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from './lib/rateLimit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const rateLimits = {
    '/api/auth/login': { limit: 5, window: 300 },
    '/api/auth/register': { limit: 3, window: 3600 },
    '/api/auth/forgot-password': { limit: 3, window: 3600 },
    '/api/auth/reset-password': { limit: 5, window: 3600 },
    '/api/account/delete': { limit: 3, window: 86400 },
  }

  const routeConfig = Object.entries(rateLimits).find(([route]) =>
    pathname.startsWith(route),
  )

  if (routeConfig) {
    const [, config] = routeConfig

    const rateLimit = await rateLimiter(request, config)
    if (rateLimit) return rateLimit
  }

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : ''

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

  response.headers.set('Content-Security-Policy', cspHeader)

  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.tarevity.pt',
    'https://accounts.google.com',
    'https://github.com',
  ]

  if (pathname.startsWith('/api/')) {
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

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      })
    }
  }

  if (pathname.startsWith('/api/')) {
    return response
  }

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

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/((?!api/auth/callback).*)',
    '/api/todos/:path*',
    '/api/profile/:path*',
    '/api/stats/:path*',
    '/api/account/:path*',
  ],
}
