import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

// Rate limit configurations
const AUTH_RATE_LIMIT = 5
const AUTH_RATE_LIMIT_WINDOW = 60 * 15 // 15 minutes
const API_RATE_LIMIT = 60
const API_RATE_LIMIT_WINDOW = 60 // 1 minute

export async function middleware(request: NextRequest) {
  
  // Create a comprehensive CSP policy with nonce
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com;
    font-src 'self' https://cdnjs.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''};
    upgrade-insecure-requests;
    block-all-mixed-content;
  `.replace(/\s{2,}/g, ' ').trim()

  const response = NextResponse.next()

  // Set Security Headers
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // CORS Configuration
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'https://tarevity.pt',
    'https://accounts.google.com',
    'https://github.com',
  ]
  
  // Only set CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Only set the CORS headers if the origin is in our allowed list
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers
      })
    }
  }

  // Enhanced rate limiting for auth endpoints
  if (
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/auth/forgot-password') ||
    request.nextUrl.pathname.startsWith('/api/auth/reset-password')
  ) {
    response.headers.set('Access-Control-Allow-Origin', '*')  // ou mais restrito se preferir
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
    response.headers.set('Access-Control-Allow-Credentials', 'true')


    
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const path = request.nextUrl.pathname
      const key = `rate-limit:${ip}:${path}`

      // Get current count
      const count = await getRequestCount(key)

      // Check for penalty
      const penaltyKey = `rate-limit-penalty:${ip}`
      const hasPenalty = await redis.exists(penaltyKey)
      
      if (hasPenalty) {
        // Get remaining time for the penalty
        const ttl = await redis.ttl(penaltyKey)
        
        return NextResponse.json(
          { message: 'Too many requests, please try again later' },
          { 
            status: 429, 
            headers: { 
              'Retry-After': String(ttl),
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + ttl)
            } 
          }
        )
      }

      if (count >= AUTH_RATE_LIMIT) {
        // Apply a 5-minute penalty for reaching the limit
        await redis.set(penaltyKey, '1', { ex: 60 * 5 })
        
        return NextResponse.json(
          { message: 'Too many requests, please try again later' },
          { 
            status: 429, 
            headers: { 
              'Retry-After': String(AUTH_RATE_LIMIT_WINDOW),
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + AUTH_RATE_LIMIT_WINDOW)
            } 
          }
        )
      }

      // Increment count
      if (count === 0) {
        await redis.set(key, '1', { ex: AUTH_RATE_LIMIT_WINDOW })
      } else {
        await redis.incr(key)
      }
      
      // Set headers for rate limit info
      response.headers.set('X-RateLimit-Limit', String(AUTH_RATE_LIMIT))
      response.headers.set('X-RateLimit-Remaining', String(Math.max(0, AUTH_RATE_LIMIT - (count + 1))))
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + AUTH_RATE_LIMIT_WINDOW))
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue even if rate limiting fails
    }
  }
  
  // General API rate limiting (higher limits for normal API calls)
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      const key = `rate-limit:${ip}:api`

      // Get current count
      const count = await getRequestCount(key)

      if (count >= API_RATE_LIMIT) {
        return NextResponse.json(
          { message: 'Too many requests, please try again later' },
          { 
            status: 429, 
            headers: { 
              'Retry-After': String(API_RATE_LIMIT_WINDOW),
              'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + API_RATE_LIMIT_WINDOW)
            } 
          }
        )
      }

      // Increment count
      if (count === 0) {
        await redis.set(key, '1', { ex: API_RATE_LIMIT_WINDOW })
      } else {
        await redis.incr(key)
      }
      
      // Set headers for rate limit info
      response.headers.set('X-RateLimit-Limit', String(API_RATE_LIMIT))
      response.headers.set('X-RateLimit-Remaining', String(Math.max(0, API_RATE_LIMIT - (count + 1))))
      response.headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + API_RATE_LIMIT_WINDOW))
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue even if rate limiting fails
    }
  }

  // Authentication logic
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

// Helper function to get the current request count
async function getRequestCount(key: string): Promise<number> {
  const count = await redis.get(key)
  return count ? parseInt(count as string, 10) : 0
}

// Make sure your matcher includes all API paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    '/api/:path*', // This ensures we catch all API routes for CORS
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|public).*)',
  ],
}