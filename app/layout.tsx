
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Athera Run - Treinamento de Corrida com Inteligência Artificial',
  description: 'Planos de treinamento personalizados com IA para corrida. 10km, meia-maratona e maratona. Treinos adaptados ao seu perfil e objetivos.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    title: 'Athera Run - Treinamento de Corrida com IA',
    description: 'Planos de treinamento personalizados com IA para corrida de todos os níveis',
    images: ['/og-image.png'],
    type: 'website',
    url: 'https://atherarun.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Athera Run - Treinamento de Corrida com IA',
    description: 'Planos de treinamento personalizados com IA para corrida de todos os níveis',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  metadataBase: new URL('https://atherarun.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
