import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { routing } from './i18n/routing';
import createMiddleware from 'next-intl/middleware';

const protectedRoutes = ['/profile', '/admin', '/dashboard', '/settings'];

const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const intlResponse = intlMiddleware(req);

  if (
    intlResponse &&
    (intlResponse.status === 307 || intlResponse.status === 308)
  ) {
    const redirectUrl = intlResponse.headers.get('location');
    if (redirectUrl) {
      const url = new URL(redirectUrl, req.url);
      const locale = url.pathname.split('/')[1];
      const pathWithoutLocale = url.pathname.replace(`/${locale}`, '') || '/';

      const sessionCookie = getSessionCookie(req, {
        cookiePrefix: 'tarevity-session',
      });

      const isLoggedIn = !!sessionCookie;

      const isProtectedRoute = protectedRoutes.some(
        (route) =>
          pathWithoutLocale === route ||
          pathWithoutLocale.startsWith(`${route}/`),
      );

      const isAuthRoute = pathWithoutLocale.startsWith('/auth');

      if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url));
      }

      if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
    }

    addSecurityHeaders(intlResponse);
    return intlResponse;
  }

  const locale = pathname.split('/')[1];
  const isLocalePath = routing.locales.includes(
    locale as (typeof routing.locales)[number],
  );
  const pathWithoutLocale = isLocalePath
    ? pathname.replace(`/${locale}`, '') || '/'
    : pathname;

  const sessionCookie = getSessionCookie(req, {
    cookiePrefix: 'tarevity-session',
  });

  const isLoggedIn = !!sessionCookie;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`),
  );

  const isAuthRoute = pathWithoutLocale.startsWith('/auth');

  if (isProtectedRoute && !isLoggedIn) {
    const redirectUrl = isLocalePath
      ? new URL(`/${locale}/auth/login`, req.url)
      : new URL('/auth/login', req.url);
    const response = NextResponse.redirect(redirectUrl);
    addSecurityHeaders(response);
    return response;
  }

  if (isAuthRoute && isLoggedIn) {
    const redirectUrl = isLocalePath
      ? new URL(`/${locale}/dashboard`, req.url)
      : new URL('/dashboard', req.url);
    const response = NextResponse.redirect(redirectUrl);
    addSecurityHeaders(response);
    return response;
  }

  const response = intlResponse || NextResponse.next();

  addSecurityHeaders(response);

  return response;
}

function addSecurityHeaders(response: NextResponse) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDevelopment = process.env.NODE_ENV === 'development';

  const scriptSrc = isDevelopment
    ? `'self' 'unsafe-inline' 'unsafe-eval' https:`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'sha256-n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk='`;

  const styleSrc = `'self' 'unsafe-inline'`;

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src ${styleSrc};
    img-src 'self' data: blob: https://api.iconify.design https://lh3.googleusercontent.com https://api.simplesvg.com https://api.unisvg.com ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''};
    font-src 'self';
    connect-src 'self' https://api.iconify.design https://lh3.googleusercontent.com https://api.simplesvg.com https://api.unisvg.com ${process.env.NEXT_PUBLIC_SUPABASE_URL || ''};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
