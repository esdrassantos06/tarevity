import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Caminhos que requerem autenticação
  const protectedPaths = ['/dashboard', '/settings', '/profile']

  // Verificar se a rota atual está protegida
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  )

  // Redirecionar para login se tentar acessar rota protegida sem autenticação
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirecionar para dashboard se tentar acessar login/registro já autenticado
  if (
    isAuthenticated &&
    (request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/register'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
