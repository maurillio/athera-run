
'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/sw-register';
import { UpdatePrompt } from '@/components/pwa/update-prompt';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { SyncIndicator } from '@/components/pwa/sync-indicator';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return (
    <SessionProvider>
      {children}
      <UpdatePrompt />
      <OfflineIndicator />
      <SyncIndicator />
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
