/**
 * API Response Utilities with i18n support
 * 
 * Usage:
 * import { ApiResponse } from '@/lib/i18n/api-utils';
 * 
 * return ApiResponse.error('unauthorized', 401, locale);
 * return ApiResponse.success('created', data, locale);
 */

import { NextResponse } from 'next/server';
import { type Locale, defaultLocale } from './config';
import ptBR from './translations/api-errors.json';

const translations = ptBR as Record<Locale, any>;

/**
 * Get translated API message
 */
export function getApiMessage(
  key: string,
  locale: Locale = defaultLocale
): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      break;
    }
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  // Fallback to defaultLocale
  value = translations[defaultLocale];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

/**
 * API Response Helper
 */
export class ApiResponse {
  /**
   * Success response with i18n
   */
  static success(
    messageKey: string,
    data?: any,
    locale: Locale = defaultLocale,
    status: number = 200
  ) {
    const message = getApiMessage(`api.success.${messageKey}`, locale);
    return NextResponse.json(
      { success: true, message, data },
      { status }
    );
  }

  /**
   * Error response with i18n
   */
  static error(
    messageKey: string,
    status: number = 400,
    locale: Locale = defaultLocale,
    details?: any
  ) {
    const message = getApiMessage(`api.errors.${messageKey}`, locale);
    return NextResponse.json(
      { success: false, error: message, details },
      { status }
    );
  }

  /**
   * Validation error response
   */
  static validationError(
    errors: Record<string, string>,
    locale: Locale = defaultLocale
  ) {
    const message = getApiMessage('api.errors.validationError', locale);
    return NextResponse.json(
      { success: false, error: message, errors },
      { status: 400 }
    );
  }

  /**
   * Common error responses
   */
  static unauthorized(locale: Locale = defaultLocale) {
    return this.error('unauthorized', 401, locale);
  }

  static forbidden(locale: Locale = defaultLocale) {
    return this.error('forbidden', 403, locale);
  }

  static notFound(locale: Locale = defaultLocale) {
    return this.error('notFound', 404, locale);
  }

  static internalError(locale: Locale = defaultLocale) {
    return this.error('internalError', 500, locale);
  }
}

/**
 * Extract locale from request headers or cookie
 */
export function getLocaleFromRequest(req: Request): Locale {
  // Try to get from cookie first
  const cookies = req.headers.get('cookie') || '';
  const localeMatch = cookies.match(/atherarun_locale=([^;]+)/);
  if (localeMatch && localeMatch[1]) {
    const locale = localeMatch[1] as Locale;
    if (['pt-BR', 'en', 'es'].includes(locale)) {
      return locale;
    }
  }

  // Try Accept-Language header
  const acceptLanguage = req.headers.get('accept-language') || '';
  if (acceptLanguage.includes('pt')) return 'pt-BR';
  if (acceptLanguage.includes('es')) return 'es';
  if (acceptLanguage.includes('en')) return 'en';

  return defaultLocale;
}
