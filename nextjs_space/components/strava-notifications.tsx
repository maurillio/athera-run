
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function StravaNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const success = searchParams?.get('strava_success');
    const error = searchParams?.get('strava_error');

    if (success) {
      setNotification({
        type: 'success',
        message: 'Conta Strava conectada com sucesso! Suas atividades serão importadas automaticamente.'
      });
      
      // Remover parâmetro da URL após 5 segundos
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('strava_success');
        window.history.replaceState({}, '', url.toString());
        setNotification(null);
      }, 5000);
    } else if (error) {
      let errorMessage = 'Erro ao conectar com o Strava. Tente novamente.';
      
      if (error === 'access_denied') {
        errorMessage = 'Autorização negada. Você precisa autorizar o acesso para conectar sua conta Strava.';
      } else if (error === 'auth_failed') {
        errorMessage = 'Falha na autenticação com o Strava. Verifique suas credenciais e tente novamente.';
      } else if (error === 'no_code') {
        errorMessage = 'Erro ao receber código de autorização do Strava. Tente novamente.';
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Remover parâmetro da URL após 8 segundos
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('strava_error');
        window.history.replaceState({}, '', url.toString());
        setNotification(null);
      }, 8000);
    }
  }, [searchParams]);

  if (!notification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-right">
      <Alert 
        className={`shadow-lg ${
          notification.type === 'success' 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
        }`}
      >
        <div className="flex items-start gap-3">
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          
          <div className="flex-1">
            <AlertTitle className={notification.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {notification.type === 'success' ? 'Sucesso!' : 'Erro'}
            </AlertTitle>
            <AlertDescription className={notification.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notification.message}
            </AlertDescription>
          </div>
          
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
}
