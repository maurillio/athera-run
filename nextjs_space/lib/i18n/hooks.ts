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
  const params = useParams();
  return (params?.locale as Locale) || 'pt-BR';
}

export function useTranslations() {
  const locale = useLocale();
  const t = translations[locale];

  return {
    t,
    locale,
  };
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
