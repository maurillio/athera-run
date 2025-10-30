'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

function StravaAutoLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('userId');
  const email = searchParams?.get('email');

  useEffect(() => {
    const performAutoLogin = async () => {
      console.log('[STRAVA-AUTO-LOGIN-PAGE] Iniciando auto-login para:', email);

      if (!email) {
        console.error('[STRAVA-AUTO-LOGIN-PAGE] Email não fornecido');
        router.push('/login?error=missing_email');
        return;
      }

      try {
        // Tentar fazer login com credentials (usando a senha Strava)
        const result = await signIn('credentials', {
          email,
          password: 'strava_oauth_user',
          redirect: false
        });

        console.log('[STRAVA-AUTO-LOGIN-PAGE] Resultado do sign-in:', result);

        if (result?.ok) {
          console.log('[STRAVA-AUTO-LOGIN-PAGE] Auto-login bem-sucedido, redirecionando...');
          // Aguardar um pouco para sessão ser criada
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/dashboard');
        } else {
          console.error('[STRAVA-AUTO-LOGIN-PAGE] Falha no sign-in:', result?.error);
          // Se falhar, redirecionar para login
          router.push('/login?error=strava_auto_login_failed');
        }
      } catch (error) {
        console.error('[STRAVA-AUTO-LOGIN-PAGE] Erro:', error);
        router.push('/login?error=strava_auto_login_error');
      }
    };

    performAutoLogin();
  }, [email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Entrando na sua conta...</h1>
        <p className="text-muted-foreground">Você será redirecionado em breve</p>
      </div>
    </div>
  );
}

export default function StravaAutoLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <StravaAutoLoginContent />
    </Suspense>
  );
}
