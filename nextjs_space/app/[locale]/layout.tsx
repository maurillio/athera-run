import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

const locales = ['pt-BR', 'en-US', 'es-ES'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  // Fallback to Portuguese if translation not found
  const title = locale === 'pt-BR' 
    ? 'Athera Run - Treinamento de Corrida com Inteligência Artificial'
    : locale === 'en-US'
    ? 'Athera Run - AI-Powered Running Training'
    : 'Athera Run - Entrenamiento de Running con IA';
    
  const description = locale === 'pt-BR'
    ? 'Planos de treinamento personalizados com IA para corrida. 10km, meia-maratona e maratona. Treinos adaptados ao seu perfil e objetivos.'
    : locale === 'en-US'
    ? 'AI-powered personalized training plans for running. 10km, half-marathon and marathon. Training adapted to your profile and goals.'
    : 'Planes de entrenamiento personalizados con IA para running. 10km, media maratón y maratón. Entrenamientos adaptados a tu perfil y objetivos.';

  return {
    title,
    description,
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    openGraph: {
      title,
      description,
      images: ['/og-image.png'],
      type: 'website',
      url: 'https://atherarun.com',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    metadataBase: new URL('https://atherarun.com'),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
