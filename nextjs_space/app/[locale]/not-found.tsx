'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/hooks';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('errors.pageNotFound');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {t('title')}
          </h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Link href="/dashboard">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              {t('goHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
