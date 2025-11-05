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

export function useLocale(): Locale {
  try {
    const params = useParams();
    return (params?.locale as Locale) || 'pt-BR';
  } catch (e) {
    return 'pt-BR';
  }
}

export function useTranslations(namespace?: string) {
  const locale = useLocale();
  const t = translations[locale];

  if (!namespace) {
    return (key: string) => {
      if (!key || typeof key !== 'string') return key || '';
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }

  // Handle nested namespaces like 'header.userMenu'
  const namespaceKeys = namespace.split('.');
  let namespaceData: any = t;
  for (const key of namespaceKeys) {
    namespaceData = namespaceData?.[key];
  }
  namespaceData = namespaceData || {};
  
  return (key: string) => {
    if (!key || typeof key !== 'string') return key || '';
    const keys = key.split('.');
    let value: any = namespaceData;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
