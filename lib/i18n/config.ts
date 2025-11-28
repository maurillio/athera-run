// v3.2.9: Sistema pt-BR only (mantém estrutura para reversibilidade)
// Para reativar outros idiomas, descomente as linhas abaixo

export const locales = ['pt-BR'] as const; // Era: ['pt-BR', 'en', 'es']
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt-BR';

export const localeNames: Record<string, string> = {
  'pt-BR': 'Português (BR)',
  // 'en': 'English',      // Desabilitado v3.2.9
  // 'es': 'Español',      // Desabilitado v3.2.9
};

export const localeFlags: Record<string, string> = {
  'pt-BR': '🇧🇷',
  // 'en': '🇺🇸',          // Desabilitado v3.2.9
  // 'es': '🇪🇸',          // Desabilitado v3.2.9
};
