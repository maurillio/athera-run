'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function StravaSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const email = searchParams?.get('email');
    const redirectTo = searchParams?.get('redirectTo') || '/dashboard';

    if (!email) {
      setError('Email não fornecido');
      router.push('/login');
      return;
    }

    // Fazer login automático com a credencial fake do Strava
    const doLogin = async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password: 'strava_oauth_user',
          redirect: false
        });

        if (result?.error) {
          console.error('Login error:', result.error);
          // Se falhar, tentar redirecionar para a página normalmente
          // O middleware pode proteger a rota
          router.push(redirectTo);
        } else {
          // Login bem-sucedido
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Exception during login:', error);
        router.push(redirectTo);
      }
    };

    doLogin();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-gray-600">Finalizando login com Strava...</p>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default function StravaSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-gray-600">Finalizando login com Strava...</p>
        </div>
      </div>
    }>
      <StravaSuccessContent />
    </Suspense>
  );
}
