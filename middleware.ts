
import { NextRequest, NextResponse } from 'next/server';

const locales = ['pt-BR', 'en', 'es'];
const defaultLocale = 'pt-BR';

// v3.2.9: Sistema agora é pt-BR only (mantém estrutura para reversibilidade)
function getLocale(request: NextRequest): string {
  // SEMPRE retorna pt-BR (desabilita detecção de idioma)
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

  // If no locale, redirect to pt-BR only
  if (!pathnameHasLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, req.url));
  }

  // Redirect en/es to pt-BR (força idioma único)
  if (pathname.startsWith('/en/') || pathname.startsWith('/es/')) {
    const pathWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
    return NextResponse.redirect(new URL(`/pt-BR${pathWithoutLocale}`, req.url));
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
