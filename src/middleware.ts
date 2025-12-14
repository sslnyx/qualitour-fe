import { NextRequest, NextResponse } from 'next/server';
import { i18n } from './i18n/config';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isRscRequest = request.nextUrl.searchParams.has('_rsc') || request.headers.get('RSC') === '1';
  const isPrefetchRequest =
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('x-middleware-prefetch') === '1';

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // If path starts with /en, redirect to root path (English is default)
  if (pathname.startsWith('/en/') || pathname === '/en') {
    // Avoid redirecting internal Next.js RSC/prefetch requests.
    // Redirecting these creates a second request (and thus duplicate server fetches).
    if (isRscRequest || isPrefetchRequest) {
      return NextResponse.next();
    }
    const newPath = pathname.replace(/^\/en/, '') || '/';
    const newUrl = new URL(newPath, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If already has locale, let it through
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Root paths without locale prefix -> rewrite to /en
  // This makes / serve from /[lang] with lang=en
  const rewriteUrl = new URL(`/en${pathname}`, request.url);
  rewriteUrl.search = request.nextUrl.search;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
