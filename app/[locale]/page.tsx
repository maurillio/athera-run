'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/lib/i18n/hooks';
import Link from 'next/link';

export default function LocaleHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const locale = useLocale();

  useEffect(() => {
    // Se autenticado, redirecionar para dashboard
    if (status === 'loading') return;
    
    if (session) {
      router.push(`/${locale}/dashboard`);
    }
    // Se NÃO autenticado, não redirecionar (mostrar landing)
  }, [router, locale, session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (session) return null; // Aguardando redirect

  // Landing Page para usuários não autenticados
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AR</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                Athera Run
              </h1>
            </div>
            <div className="flex gap-4">
              <Link href={`/${locale}/login`}>
                <button className="px-4 py-2 hover:bg-gray-100 rounded-lg">Entrar</button>
              </Link>
              <Link href={`/${locale}/signup`}>
                <button className="px-6 py-2 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-lg">
                  Começar Grátis
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-32 text-center space-y-8">
        <div className="inline-block bg-orange-100 text-orange-700 text-sm px-4 py-1 rounded-full">
          Para todos os níveis de corredores
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold">
          <span className="bg-gradient-to-r from-orange-600 via-red-500 to-blue-600 bg-clip-text text-transparent">
            Seu Treinador
          </span>
          <br />
          <span>de Corrida Personalizado</span>
        </h1>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Planos de treinamento científicos e personalizados para 10km, meia-maratona e maratona.
        </p>
        
        <Link href={`/${locale}/signup`}>
          <button className="text-lg px-8 py-4 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-lg font-semibold">
            Criar Meu Plano Grátis →
          </button>
        </Link>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2025 Athera Run. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
