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
  if (!values) return text;
  // Support both {{key}} and {key} syntax
  return text
    .replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`))
    .replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
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
