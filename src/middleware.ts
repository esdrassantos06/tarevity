import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rateLimit'
import { csrfProtection } from './middleware/csrf'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the internationalization middleware
// This only takes one argument (the request) and returns a response
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method

  // Skip middleware for specific paths that should be handled by next-intl only
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/trpc') ||
    pathname.match(/\.(.*)$/) // Files with extensions
  ) {
    return intlMiddleware(request)
  }

  // CSRF protection for non-GET methods on API routes
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(method) &&
    pathname.startsWith('/api/')
  ) {
    if (!pathname.startsWith('/api/auth/callback')) {
      const csrfResult = await csrfProtection(request)
      if (csrfResult instanceof NextResponse) {
        return csrfResult
      }
    }
  }

  // Public paths that bypass authentication
  const publicPaths = ['/', '/privacy', '/terms', '/auth/error']
  if (
    publicPaths.includes(pathname) ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    const response = NextResponse.next()
    addSecurityHeaders(response, request)
    
    // Apply security headers first, then handle with intl middleware
    const securedResponse = response;
    addSecurityHeaders(securedResponse, request)
    return intlMiddleware(request)
  }

  // Rate limiting for specific routes
  const rateLimits = {
    '/api/auth/login': { limit: 5, window: 300 },
    '/api/auth/register': { limit: 3, window: 3600 },
    '/api/auth/forgot-password': { limit: 3, window: 3600 },
    '/api/auth/reset-password': { limit: 5, window: 3600 },
    '/api/account/delete': { limit: 2, window: 86400 },
    '/api/profile/upload-image': { limit: 10, window: 3600 },
    '/api/admin/': { limit: 20, window: 60 },
    '/api/todos': { limit: 50, window: 60 },
  }

  let matchedConfig = null
  let matchedRoute = ''

  for (const [route, config] of Object.entries(rateLimits)) {
    if (pathname.startsWith(route) && route.length > matchedRoute.length) {
      matchedConfig = config
      matchedRoute = route
    }
  }

  if (matchedConfig) {
    try {
      const token = await getToken({
        req: request,
        secureCookie: process.env.NODE_ENV === 'production',
      })

      const ipHeader = request.headers.get('x-forwarded-for')
      const ipAddresses = ipHeader ? ipHeader.split(',') : []
      const clientIp =
        ipAddresses.length > 0
          ? ipAddresses[0].trim()
          : request.nextUrl.hostname || 'unknown-ip'

      const userId = token?.id || 'unauthenticated'

      const rateLimit = await rateLimiter(request, {
        ...matchedConfig,
        identifier: `${userId}:${clientIp}:${matchedRoute}`,
      })

      if (rateLimit) return rateLimit
    } catch (error) {
      console.error('Error applying rate limiting:', error)
    }
  }

  // Special handling for auth callback routes
  if (
    pathname.startsWith('/api/auth/callback') ||
    pathname.includes('/api/auth/callback/')
  ) {
    return NextResponse.next()
  }

  // Redirect loop prevention
  const redirectCount = parseInt(
    request.headers.get('x-redirect-count') || '0',
    10,
  )

  if (redirectCount > 5) {
    console.error('Redirect loop detected and prevented')
    return NextResponse.next()
  }

  const response = NextResponse.next()
  addSecurityHeaders(response, request)

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    const token = await getToken({
      req: request,
      secureCookie: process.env.NODE_ENV === 'production',
    })

    if (
      pathname.startsWith('/api/profile') ||
      pathname.startsWith('/api/todos') ||
      pathname.startsWith('/api/notifications') ||
      pathname.startsWith('/api/stats')
    ) {
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      return response
    }

    if (pathname.startsWith('/api/admin')) {
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }

      if (!token.is_admin) {
        return NextResponse.json(
          { message: 'Forbidden: Admin access required' },
          { status: 403 },
        )
      }

      return response
    }

    return response
  }

  // Authentication check
  const token = await getToken({
    req: request,
    secureCookie: process.env.NODE_ENV === 'production',
  })

  const isAuthenticated = !!token

  const protectedPaths = ['/dashboard', '/settings', '/profile', '/todo']
  const authPaths = [
    '/auth/login',
    '/auth/login/',
    '/auth/register',
    '/auth/register/',
    '/auth/forgot-password',
    '/auth/forgot-password/',
    '/auth/reset-password',
    '/auth/reset-password/',
  ]

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  if (isAuthenticated && isAuthPath) {
    const baseUrl = request.nextUrl.origin
    const redirectResponse = NextResponse.redirect(
      new URL('/dashboard', baseUrl),
      { status: 307 },
    )

    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )

    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    addSecurityHeaders(redirectResponse, request)

    // We need to return the redirect response after security headers
    // For redirects, we don't run the intl middleware as it would change the response type
    return redirectResponse
  }

  if (isProtectedPath && !isAuthenticated) {
    const safeCallbackUrl = new URL(pathname, request.url).pathname

    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', safeCallbackUrl)

    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )

    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    addSecurityHeaders(redirectResponse, request)

    // We need to return the redirect response after security headers
    // For redirects, we don't run the intl middleware as it would change the response type
    return redirectResponse
  }

  // For all other cases, apply security headers first
  addSecurityHeaders(response, request)
  
  // Then run the internationalization middleware
  return intlMiddleware(request)
}

function addSecurityHeaders(response: NextResponse, request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  let supabaseDomain = ''
  try {
    if (supabaseUrl) {
      supabaseDomain = new URL(supabaseUrl).hostname
    }
  } catch (error) {
    console.error('Invalid Supabase URL format:', error)
  }

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' https://cdnjs.cloudflare.com",
    "style-src 'self' https://cdnjs.cloudflare.com",
    `img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com ${supabaseDomain ? `https://${supabaseDomain}` : ''}`,
    "font-src 'self' https://cdnjs.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `connect-src 'self' ${supabaseUrl} ${appUrl}`,
    'upgrade-insecure-requests',
    'block-all-mixed-content',
  ]

  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  )

  const origin = request.headers.get('origin')
  const allowedOrigins = [
    appUrl,
    'https://www.tarevity.pt',
    'https://tarevity.pt',
  ].filter(Boolean)

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-csrf-token',
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
  }
}

// Combine both matchers: your original matchers and the next-intl matchers
export const config = {
  matcher: [
    // Original security middleware paths
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/todo/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/',
    '/privacy',
    '/terms',
    // next-intl matcher (excluding some paths)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ],
}