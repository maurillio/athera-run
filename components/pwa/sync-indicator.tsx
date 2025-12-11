'use client';

import { useEffect, useState } from 'react';
import { syncManager, SyncProgress } from '@/lib/pwa/sync-manager';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export function SyncIndicator() {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.onProgress((p) => {
      setProgress(p);
      setShow(true);

      if (p.completed + p.failed >= p.total) {
        setTimeout(() => setShow(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!show || !progress) return null;

  const isComplete = progress.completed + progress.failed >= progress.total;
  const percentage = progress.total > 0 
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
        <div className="flex items-center gap-3">
          {!isComplete && (
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          )}
          {isComplete && progress.failed === 0 && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {isComplete && progress.failed > 0 && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}

          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {!isComplete && 'Sincronizando...'}
              {isComplete && progress.failed === 0 && 'Sincronização completa'}
              {isComplete && progress.failed > 0 && 'Sincronização parcial'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {progress.completed} de {progress.total} itens
              {progress.failed > 0 && ` (${progress.failed} falhas)`}
            </p>
          </div>
        </div>

        {!isComplete && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
