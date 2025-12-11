
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
  manifest: '/manifest.json',
  themeColor: '#E64A19',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Athera Run',
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
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
      <head>
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1170-2532.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="/splash/apple-splash-1242-2688.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-1536-2048.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-1668-2388.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/apple-splash-2048-2732.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
