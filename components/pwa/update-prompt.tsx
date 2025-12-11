'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setShowPrompt(true);
          }
        });
      });

      if (reg.waiting) {
        setShowPrompt(true);
      }
    });

    const checkForUpdates = () => {
      navigator.serviceWorker.ready.then((reg) => {
        reg.update();
      });
    };

    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              Nova versão disponível
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Uma atualização do Athera Run está pronta para ser instalada.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Atualizar agora
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
