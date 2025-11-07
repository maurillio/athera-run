/**
 * AutoSaveIndicator Component
 * 
 * Visual indicator showing auto-save status
 * - Saving: Shows spinner
 * - Saved: Shows check with timestamp
 * - Error: Shows error message
 */

import React from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  className?: string;
}

export function AutoSaveIndicator({
  isSaving,
  lastSaved,
  error,
  className
}: AutoSaveIndicatorProps) {
  if (!isSaving && !lastSaved && !error) {
    return null;
  }

  return (
    <div className={cn("fixed top-4 right-4 z-50", className)}>
      {isSaving && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Salvando...
          </span>
        </div>
      )}

      {!isSaving && lastSaved && !error && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">
            Salvo{' '}
            {formatDistanceToNow(lastSaved, {
              locale: ptBR,
              addSuffix: true
            })}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-900">
            Erro ao salvar
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Inline variant for use within forms
 */
export function AutoSaveIndicatorInline({
  isSaving,
  lastSaved,
  error
}: Omit<AutoSaveIndicatorProps, 'className'>) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isSaving && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}

      {!isSaving && lastSaved && !error && (
        <>
          <Check className="h-3 w-3 text-green-600" />
          <span className="text-muted-foreground">
            Salvo {formatDistanceToNow(lastSaved, { locale: ptBR, addSuffix: true })}
          </span>
        </>
      )}

      {error && (
        <>
          <AlertCircle className="h-3 w-3 text-red-600" />
          <span className="text-red-600 text-xs">Erro ao salvar</span>
        </>
      )}
    </div>
  );
}
