
'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/sw-register';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        expand={false}
        duration={5000}
      />
    </SessionProvider>
  );
}
