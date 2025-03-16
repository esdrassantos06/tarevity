import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'cookie'

export async function csrfProtection(req: NextRequest) {

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith('/api/auth/callback')) {
    return NextResponse.next();
  }

  const csrfToken = req.headers.get('x-csrf-token');
  if (!csrfToken) {
    return NextResponse.json(
      { message: 'Missing CSRF token' },
      { status: 403 }
    );
  }

  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    return NextResponse.json(
      { message: 'No cookies present' },
      { status: 403 }
    );
  }

  const cookies = parse(cookieHeader);
  const cookiePrefix = process.env.NODE_ENV === 'production' ? '__Secure-' : '';
  const csrfCookieName = `${cookiePrefix}next-auth.csrf-token`;
  
  const csrfCookie = cookies[csrfCookieName];
  if (!csrfCookie) {
    return NextResponse.json(
      { message: 'Missing CSRF cookie' },
      { status: 403 }
    );
  }

  const [expectedToken] = csrfCookie.split('|');
  
  if (csrfToken !== expectedToken) {
    return NextResponse.json(
      { message: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}