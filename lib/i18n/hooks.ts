import { useParams } from 'next/navigation';
import type { Locale } from './config';
import ptBR from './translations/pt-BR.json';
import en from './translations/en.json';
import es from './translations/es.json';

const translations = {
  'pt-BR': ptBR,
  'en': en,
  'es': es,
};

export type TranslationFunction = (key: string, values?: Record<string, any>) => string;

export function useLocale(): Locale {
  try {
    const params = useParams();
    return (params?.locale as Locale) || 'pt-BR';
  } catch (e) {
    return 'pt-BR';
  }
}

function interpolate(text: string, values?: Record<string, any>): string {
  if (!text || typeof text !== 'string') return text || '';
  if (!values || Object.keys(values).length === 0) return text;
  
  let result = text;
  
  // First try {{key}} syntax (preferred)
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
  
  // Then try {key} syntax (fallback)
  result = result.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
  
  return result;
}

export function useTranslations(namespace?: string): TranslationFunction {
  const locale = useLocale();
  const t = translations[locale];

  if (!namespace) {
    const translateFn = (key: string, values?: Record<string, any>): string => {
      if (!key || typeof key !== 'string') return key || '';
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      const result = value || key;
      return interpolate(result, values);
    };
    return translateFn;
  }

  // Handle nested namespaces like 'header.userMenu'
  const namespaceKeys = namespace.split('.');
  let namespaceData: any = t;
  for (const key of namespaceKeys) {
    namespaceData = namespaceData?.[key];
  }
  namespaceData = namespaceData || {};
  
  const translateFn = (key: string, values?: Record<string, any>): string => {
    if (!key || typeof key !== 'string') return key || '';
    const keys = key.split('.');
    let value: any = namespaceData;
    for (const k of keys) {
      value = value?.[k];
    }
    const result = value || key;
    return interpolate(result, values);
  };
  return translateFn;
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
