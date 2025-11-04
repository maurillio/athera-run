
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const locales = ['pt-BR', 'en-US', 'es-ES'];
const defaultLocale = 'pt-BR';

// i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // pt-BR não aparece na URL
});

// Protected routes
const protectedPaths = [
  '/dashboard',
  '/onboarding',
  '/tracking',
  '/calculator',
  '/plano',
  '/training',
  '/nutrition',
  '/prevention',
  '/glossary',
  '/overtraining',
  '/admin',
  '/perfil'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Remove locale prefix to check path
  const pathnameWithoutLocale = pathname.replace(/^\/(pt-BR|en-US|es-ES)/, '');
  
  // Check if path is protected
  const isProtected = protectedPaths.some(path => 
    pathnameWithoutLocale.startsWith(path)
  );
  
  if (isProtected) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      // Preserve locale in redirect
      const locale = pathname.match(/^\/(pt-BR|en-US|es-ES)/)?.[1] || defaultLocale;
      const loginUrl = new URL(
        locale === defaultLocale ? '/login' : `/${locale}/login`,
        request.url
      );
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Apply i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
