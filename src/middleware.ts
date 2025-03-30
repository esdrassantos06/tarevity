import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rateLimit'
import { csrfProtection } from './middleware/csrf'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const method = request.method

  const baseUrl = request.nextUrl.origin

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/trpc') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next()
  }

  // IMPORTANT: The /api/auth/session endpoint needs to be handled before internationalization
  // to avoid the error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
  if (pathname === '/api/auth/session') {
    return NextResponse.next()
  }

  // Important: Do not apply internationalization middleware to API routes
  if (pathname.startsWith('/api/')) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      if (
        !pathname.startsWith('/api/auth/callback') &&
        !pathname.startsWith('/api/notifications')
      ) {
        const csrfResult = await csrfProtection(request)
        if (csrfResult instanceof NextResponse) {
          return csrfResult
        }
      }
    }

    if (
      pathname.startsWith('/api/auth/callback') ||
      pathname.includes('/api/auth/callback/')
    ) {
      return NextResponse.next()
    }

    // Verificar autenticação para APIs protegidas
    const token = await getToken({
      req: request,
      secureCookie: process.env.NODE_ENV === 'production',
    })

    const isAuthenticated = !!token

    // Definir caminhos protegidos para APIs
    const protectedApiPaths = [
      '/api/profile',
      '/api/todos',
      '/api/notifications',
      '/api/stats',
    ]

    // Verificar se é um caminho de API protegido
    const isProtectedApiPath = protectedApiPaths.some((path) =>
      pathname.startsWith(path),
    )

    // Tratamento para APIs protegidas não autenticadas
    if (isProtectedApiPath && !isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verificação de permissão de admin
    if (pathname.startsWith('/api/admin') && isAuthenticated) {
      if (!token.is_admin) {
        return NextResponse.json(
          { message: 'Forbidden: Admin access required' },
          { status: 403 },
        )
      }
    }

    // Rate limiting para APIs
    const rateLimits = {
      '/api/auth/login': { limit: 5, window: 300 },
      '/api/auth/register': { limit: 3, window: 3600 },
      '/api/auth/forgot-password': { limit: 3, window: 3600 },
      '/api/auth/reset-password': { limit: 5, window: 3600 },
      '/api/account/delete': { limit: 2, window: 86400 },
      '/api/profile/upload-image': { limit: 5, window: 3600 },
      '/api/admin/': { limit: 20, window: 60 },
      '/api/todos': { limit: 50, window: 60 },
      'api/notifications': { limit: 50, window: 60 },
      'api/profile': { limit: 50, window: 60 },
      'api/stats': { limit: 50, window: 60 },
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

    const response = NextResponse.next()
    addSecurityHeaders(response, request)
    return response
  }

  // From here on, we only handle non-API routes (pages)

  const publicPaths = ['/', '/privacy', '/terms']
  if (
    publicPaths.includes(pathname) ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    const response = NextResponse.next()
    addSecurityHeaders(response, request)
    return intlMiddleware(request)
  }

  const authPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname === `${path}/`,
  )

  if (isAuthPath) {
    const response = NextResponse.next()
    addSecurityHeaders(response, request)
    return intlMiddleware(request)
  }

  const token = await getToken({
    req: request,
    secureCookie: process.env.NODE_ENV === 'production',
  })

  const isAuthenticated = !!token

  const redirectCount = parseInt(
    request.headers.get('x-redirect-count') || '0',
    10,
  )

  if (redirectCount > 5) {
    console.error('Redirect loop detected and prevented')
    return NextResponse.next()
  }

  const protectedPaths = ['/dashboard', '/settings', '/profile', '/todo']

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  if (isProtectedPath && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname)

    const loginUrl = new URL('/auth/login', baseUrl)
    loginUrl.searchParams.set('callbackUrl', callbackUrl)

    if (redirectCount > 3) {
      console.error('Redirect loop detected for path:', pathname)
      return NextResponse.redirect(new URL('/', baseUrl), { status: 302 })
    }

    const redirectResponse = NextResponse.redirect(loginUrl, { status: 302 })
    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )
    redirectResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    )
    redirectResponse.headers.set('Pragma', 'no-cache')
    redirectResponse.headers.set('Expires', '0')

    addSecurityHeaders(redirectResponse, request)

    return redirectResponse
  }

  if (isAuthPath && isAuthenticated) {
    const redirectResponse = NextResponse.redirect(
      new URL('/dashboard', baseUrl),
      { status: 302 },
    )
    redirectResponse.headers.set(
      'x-redirect-count',
      (redirectCount + 1).toString(),
    )
    redirectResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    addSecurityHeaders(redirectResponse, request)

    return redirectResponse
  }

  const response = NextResponse.next()
  addSecurityHeaders(response, request)
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

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/todo/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/',
    '/privacy',
    '/terms',
    '/404',
    // next-intl matcher (excluding some paths)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
}
