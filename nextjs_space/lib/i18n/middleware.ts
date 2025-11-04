import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales, type Locale } from './config';

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

export function i18nMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}
