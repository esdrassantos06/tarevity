import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get URL pathname for debugging
  const pathname = request.nextUrl.pathname
  console.log('Middleware processing:', pathname)

  // Skip all processing for callback routes
  if (pathname.startsWith('/api/auth/callback') || pathname.includes('/api/auth/callback/')) {
    console.log('Skipping middleware for OAuth callback:', pathname)
    return NextResponse.next()
  }

  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0', 10)
  if (redirectCount > 5) {
    console.error('Redirect loop detected and prevented')
    return NextResponse.next()
  }
  
  // Create a basic CSP policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com;
  `.replace(/\s{2,}/g, ' ').trim()

  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', cspHeader)
  
  // Skip authentication logic for API routes
  if (pathname.startsWith('/api/')) {
    return response
  }

  // Authentication logic
  const token = await getToken({ 
    req: request,
    secureCookie: process.env.NODE_ENV === 'production'
  })
  const isAuthenticated = !!token

  console.log('Path:', pathname, 'Authenticated:', isAuthenticated)

  const protectedPaths = ['/dashboard', '/settings', '/profile']
  const authPaths = ['/auth/login', '/auth/register']

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  const isAuthPath = authPaths.some((path) =>
    pathname.startsWith(path),
  )

  if (isProtectedPath && !isAuthenticated) {
    console.log('Redirecting unauthenticated user from protected path to login')
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  if (isAuthenticated && isAuthPath) {
    console.log('Redirecting authenticated user from auth path to dashboard')
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    redirectResponse.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return redirectResponse;
  }

  return response;
}

// Make sure your matcher includes all API paths but excludes OAuth callback paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
    // Generic matcher with callback exclusion
    '/((?!api/auth/callback|_next/static|_next/image|_next/data|favicon.ico|public).*)',
  ],
};