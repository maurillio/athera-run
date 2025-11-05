'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.genericError');
  const locale = useLocale();

  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {error.digest && (
            <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('retry')}
          </Button>
          <Link href={`/${locale}/dashboard`}>
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Ir para Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
