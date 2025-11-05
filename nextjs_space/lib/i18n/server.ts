import 'server-only';
import { Locale, defaultLocale } from './config';

const dictionaries = {
  'pt-BR': () => import('./translations/pt-BR.json').then((module) => module.default),
  en: () => import('./translations/en.json').then((module) => module.default),
  es: () => import('./translations/es.json').then((module) => module.default),
};

export async function getDictionary(locale: Locale) {
  const dictionaryLoader = dictionaries[locale] || dictionaries[defaultLocale];
  return dictionaryLoader();
}

export async function getTranslations(locale: Locale, namespace?: string) {
  const dictionary = await getDictionary(locale);
  
  if (!namespace) {
    return (key: string) => {
      const keys = key.split('.');
      let value: any = dictionary;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
  }
  
  const namespacedDict = (dictionary as any)[namespace] || {};
  return (key: string) => namespacedDict[key] || key;
}
