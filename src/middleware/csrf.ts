import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'cookie'

export async function csrfProtection(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Log para depuração
  console.log(`[CSRF] Checking CSRF for ${req.method} request to ${pathname}`);
  
  // Métodos seguros não precisam de verificação CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return NextResponse.next();
  }

  // Rotas isentas de verificação CSRF
  const exemptPaths = [
    '/api/auth/callback',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/csrf'
  ];
  
  if (exemptPaths.some(path => pathname.startsWith(path))) {
    console.log(`[CSRF] Skipping CSRF check for exempt path: ${pathname}`);
    return NextResponse.next();
  }

  // Verificar cabeçalho CSRF
  const csrfToken = req.headers.get('x-csrf-token');
  if (!csrfToken) {
    console.warn(`[CSRF] Missing CSRF token header for ${pathname}`);
    return NextResponse.json(
      { message: 'Missing CSRF token in request header', path: pathname },
      { status: 403 }
    );
  }

  // Verificar cookies
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    console.warn(`[CSRF] No cookies present for ${pathname}`);
    return NextResponse.json(
      { message: 'No cookies present in request', path: pathname },
      { status: 403 }
    );
  }

  // Analisar cookies
  const cookies = parse(cookieHeader);
  
  // Determinar nome do cookie CSRF
  const cookiePrefix = process.env.NODE_ENV === 'production' ? '__Secure-' : '';
  const csrfCookieName = `${cookiePrefix}next-auth.csrf-token`;
  
  // Verificar cookie CSRF
  const csrfCookie = cookies[csrfCookieName];
  if (!csrfCookie) {
    // Log de todos os cookies para depuração
    console.warn(`[CSRF] Missing CSRF cookie for ${pathname}. Available cookies:`, Object.keys(cookies));
    return NextResponse.json(
      { 
        message: 'Missing CSRF cookie',
        path: pathname,
        expectedCookieName: csrfCookieName,
        availableCookies: Object.keys(cookies)
      },
      { status: 403 }
    );
  }

  // Extrair token esperado do cookie
  let expectedToken = null;
  
  // Tentar primeiro formato padrão com pipe
  const cookieParts = csrfCookie.split('|');
  if (cookieParts.length > 0) {
    expectedToken = cookieParts[0];
  } 
  // Se não funcionar, usar o valor completo (versões mais recentes podem ter formato diferente)
  else {
    expectedToken = csrfCookie;
  }
  
  if (!expectedToken || csrfToken !== expectedToken) {
    console.warn(`[CSRF] Invalid CSRF token for ${pathname}. Expected: ${expectedToken?.substring(0, 10)}..., Got: ${csrfToken?.substring(0, 10)}...`);
    return NextResponse.json(
      { 
        message: 'Invalid CSRF token',
        path: pathname
      },
      { status: 403 }
    );
  }

  console.log(`[CSRF] CSRF validation successful for ${pathname}`);
  return NextResponse.next();
}