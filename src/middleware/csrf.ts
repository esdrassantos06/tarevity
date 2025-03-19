import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'cookie'

export async function csrfProtection(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return NextResponse.next()
  }

  const exemptPaths = [
    '/api/auth/callback',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/csrf',
  ]

  if (exemptPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const csrfToken = req.headers.get('x-csrf-token')
  if (!csrfToken) {
    console.warn(`[CSRF] Missing CSRF token header for ${pathname}`)
    return NextResponse.json(
      { message: 'Missing CSRF token in request header', path: pathname },
      { status: 403 },
    )
  }

  const cookieHeader = req.headers.get('cookie')
  if (!cookieHeader) {
    console.warn(`[CSRF] No cookies present for ${pathname}`)
    return NextResponse.json(
      { message: 'No cookies present in request', path: pathname },
      { status: 403 },
    )
  }

  const cookies = parse(cookieHeader)

  const cookiePrefix = process.env.NODE_ENV === 'production' ? '__Secure-' : ''
  const csrfCookieName = `${cookiePrefix}next-auth.csrf-token`

  const csrfCookie = cookies[csrfCookieName]
  if (!csrfCookie) {
    console.warn(
      `[CSRF] Missing CSRF cookie for ${pathname}. Available cookies:`,
      Object.keys(cookies),
    )
    return NextResponse.json(
      {
        message: 'Missing CSRF cookie',
        path: pathname,
        expectedCookieName: csrfCookieName,
        availableCookies: Object.keys(cookies),
      },
      { status: 403 },
    )
  }

  let expectedToken = null

  const cookieParts = csrfCookie.split('|')
  if (cookieParts.length > 0) {
    expectedToken = cookieParts[0]
  } else {
    expectedToken = csrfCookie
  }

  if (!expectedToken || csrfToken !== expectedToken) {
    console.warn(
      `[CSRF] Invalid CSRF token for ${pathname}. Expected: ${expectedToken?.substring(0, 10)}..., Got: ${csrfToken?.substring(0, 10)}...`,
    )
    return NextResponse.json(
      {
        message: 'Invalid CSRF token',
        path: pathname,
      },
      { status: 403 },
    )
  }

  return NextResponse.next()
}
