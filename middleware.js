import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const PUBLIC_PREFIXES = ['/game/']; // guests can join games

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes and Next internals
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for the refresh cookie (HttpOnly) — set by the backend on login
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};