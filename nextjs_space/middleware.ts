
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { defaultLocale, locales, type Locale } from './lib/i18n/config';

// Get user's preferred locale
function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('atherarun_locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
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

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Skip i18n redirect for API routes and static files
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Check if pathname already has locale
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // Routes that have been migrated to i18n (exist in [locale] folder)
    const i18nRoutes = [
      '/dashboard',
      '/login',
      '/signup',
      '/onboarding',
      '/plano',
      '/perfil',
      '/tracking',
      '/training',
      '/'
    ];

    // Only redirect to locale if:
    // 1. Path doesn't have locale yet
    // 2. Path is in the i18n routes list
    if (!pathnameHasLocale) {
      const shouldRedirect = i18nRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );

      if (shouldRedirect) {
        const locale = getLocale(req);
        const newUrl = new URL(`/${locale}${pathname}`, req.url);
        return NextResponse.redirect(newUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access to public pages
        const publicPaths = ['/login', '/signup', '/'];
        const pathname = req.nextUrl.pathname;
        
        // Always allow API routes (including auth callbacks)
        if (pathname.startsWith('/api/')) {
          return true;
        }
        
        // Check for locale prefix and extract actual path
        const pathWithoutLocale = pathname.replace(/^\/(pt-BR|en|es)/, '') || '/';
        
        if (publicPaths.includes(pathWithoutLocale)) {
          return true;
        }
        
        // Protected routes require token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
