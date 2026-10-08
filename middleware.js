import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/game') ||
    pathname.startsWith('/questions');

  if (!isProtected) return NextResponse.next();

  const userId = req.cookies.get('userId')?.value;
  if (!userId) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/game/:path*', '/questions/:path*'],
};