import { Inter } from 'next/font/google';
import { locales, type Locale } from '@/lib/i18n/config';
import { getTranslations } from '@/lib/i18n/hooks';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

// v3.2.9: Gera apenas pt-BR (mantém estrutura para reversibilidade)
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // v3.2.9: Força pt-BR sempre (ignora params.locale se for en/es)
  const lang = params.locale === 'pt-BR' ? 'pt-BR' : 'pt-BR';
  
  return (
    <html lang={lang}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
