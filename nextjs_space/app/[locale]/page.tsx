'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function LocaleHome() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { locale } = useTranslations();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      router.push(`/${locale}/dashboard`);
    } else {
      router.push(`/${locale}/login`);
    }
  }, [router, locale, session, status]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
