
import { NextRequest, NextResponse } from 'next/server';

const locales = ['pt-BR', 'en', 'es'];
const defaultLocale = 'pt-BR';

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('atherarun_locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const browserLocale = acceptLanguage.split(',')[0].split(';')[0].trim();
    if (browserLocale.startsWith('pt')) return 'pt-BR';
    if (browserLocale.startsWith('es')) return 'es';
    if (browserLocale.startsWith('en')) return 'en';
  }

  return defaultLocale;
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for API, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale, redirect to locale-prefixed route
  if (!pathnameHasLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
