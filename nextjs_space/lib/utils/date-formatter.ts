/**
 * Date Formatting Utilities
 * 
 * Provides consistent date formatting across all locales
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/en';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const APP_TIMEZONE = 'America/Sao_Paulo';

type SupportedLocale = 'pt-BR' | 'en' | 'es';

/**
 * Maps our locale format to dayjs locale format
 */
const getDayjsLocale = (locale: SupportedLocale): string => {
  switch (locale) {
    case 'pt-BR':
      return 'pt-br';
    case 'es':
      return 'es';
    case 'en':
    default:
      return 'en';
  }
};

/**
 * Formats a date string to localized full date with day name
 * Examples:
 *   pt-BR: "terça-feira, 5 de novembro de 2025"
 *   en: "Tuesday, November 5, 2025"
 *   es: "martes, 5 de noviembre de 2025"
 */
export function formatLocalizedDate(
  dateStr: string | Date,
  locale: SupportedLocale = 'pt-BR',
  includeYear: boolean = false
): string {
  const dayjsLocale = getDayjsLocale(locale);
  const date = dayjs(dateStr).tz(APP_TIMEZONE).locale(dayjsLocale);

  if (locale === 'pt-BR') {
    return includeYear
      ? date.format('dddd, D [de] MMMM [de] YYYY')
      : date.format('dddd, D [de] MMMM');
  } else if (locale === 'es') {
    return includeYear
      ? date.format('dddd, D [de] MMMM [de] YYYY')
      : date.format('dddd, D [de] MMMM');
  } else {
    // English
    return includeYear
      ? date.format('dddd, MMMM D, YYYY')
      : date.format('dddd, MMMM D');
  }
}

/**
 * Formats a date to short format (DD/MM or MM/DD)
 * Examples:
 *   pt-BR: "05/11"
 *   en: "11/05"
 *   es: "05/11"
 */
export function formatShortDate(
  dateStr: string | Date,
  locale: SupportedLocale = 'pt-BR'
): string {
  const date = new Date(dateStr);
  
  if (locale === 'en') {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit' 
    });
  }
  
  // pt-BR and es use DD/MM
  return date.toLocaleDateString(locale, { 
    day: '2-digit', 
    month: '2-digit' 
  });
}

/**
 * Formats a date range
 * Examples:
 *   pt-BR: "5-11 nov"
 *   en: "Nov 5-11"
 *   es: "5-11 nov"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
  locale: SupportedLocale = 'pt-BR'
): string {
  const dayjsLocale = getDayjsLocale(locale);
  const start = dayjs(startDate).tz(APP_TIMEZONE).locale(dayjsLocale);
  const end = dayjs(endDate).tz(APP_TIMEZONE).locale(dayjsLocale);

  const startDay = start.format('D');
  const endDay = end.format('D');
  const month = start.format('MMM');

  if (locale === 'en') {
    return `${month} ${startDay}-${endDay}`;
  }
  
  // pt-BR and es
  return `${startDay}-${endDay} ${month}`;
}

/**
 * Formats time duration
 * Examples:
 *   "01:30:45" → "1h 30min" (all locales)
 */
export function formatDuration(durationStr: string): string {
  const parts = durationStr.split(':');
  if (parts.length !== 3) return durationStr;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

/**
 * Formats pace (minutes per km)
 * Examples:
 *   "5:30" → "5:30 min/km" (all locales)
 */
export function formatPace(pace: string): string {
  return `${pace} min/km`;
}

/**
 * Gets relative time (e.g., "há 2 dias", "2 days ago")
 */
export function formatRelativeTime(
  dateStr: string | Date,
  locale: SupportedLocale = 'pt-BR'
): string {
  const dayjsLocale = getDayjsLocale(locale);
  return dayjs(dateStr).tz(APP_TIMEZONE).locale(dayjsLocale).fromNow();
}

/**
 * Capitalizes first letter (useful for day names in some locales)
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
