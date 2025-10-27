
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RunCoach - Seu Treinador de Corrida Personalizado',
  description: 'Planos de treinamento personalizados para 10km, meia-maratona e maratona. Para iniciantes, intermediários e avançados.',
  openGraph: {
    title: 'RunCoach - Seu Treinador de Corrida Personalizado',
    description: 'Planos de treinamento personalizados para 10km, meia-maratona e maratona',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunCoach - Seu Treinador de Corrida Personalizado',
    description: 'Planos de treinamento personalizados para 10km, meia-maratona e maratona',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
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
