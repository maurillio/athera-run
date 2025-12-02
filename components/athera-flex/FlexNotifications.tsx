/**
 * ATHERA FLEX v3.3.0 - Flex Notifications
 * Sistema de notificações toast para o Athera Flex
 */

'use client';

import { toast } from 'sonner';
import { CheckCircle2, XCircle, Zap, Undo2, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export const flexNotifications = {
  /**
   * Novo match detectado
   */
  matchDetected: (
    confidence: number,
    workoutTitle: string,
    onView: () => void
  ) => {
    toast(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-100 rounded-full">
          <Zap className="h-4 w-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Match Detectado!</p>
          <p className="text-sm text-muted-foreground">
            {workoutTitle} • {confidence}% confiança
          </p>
        </div>
      </div>,
      {
        action: {
          label: 'Ver',
          onClick: onView,
        },
        duration: 8000,
      }
    );
  },

  /**
   * Ajuste aplicado com sucesso
   */
  adjustmentApplied: (
    workoutTitle: string,
    confidence: number,
    onUndo?: () => void
  ) => {
    toast.success(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-100 rounded-full">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Ajuste Aplicado!</p>
          <p className="text-sm text-muted-foreground">
            {workoutTitle} marcado como completo
          </p>
        </div>
      </div>,
      {
        action: onUndo ? {
          label: 'Desfazer',
          onClick: onUndo,
        } : undefined,
        duration: 10000,
      }
    );
  },

  /**
   * Auto-ajuste aplicado (Premium)
   */
  autoAdjustApplied: (
    workoutTitle: string,
    confidence: number,
    onUndo?: () => void,
    onView?: () => void
  ) => {
    toast(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-full">
          <Zap className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            Auto-Ajuste Aplicado
            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
              Premium
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {workoutTitle} • {confidence}% confiança
          </p>
        </div>
      </div>,
      {
        action: {
          label: onUndo ? 'Desfazer' : 'Ver',
          onClick: onUndo || onView || (() => {}),
        },
        duration: 12000,
      }
    );
  },

  /**
   * Sugestão rejeitada
   */
  suggestionRejected: (workoutTitle: string) => {
    toast.info(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <XCircle className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Sugestão Rejeitada</p>
          <p className="text-sm text-muted-foreground">
            {workoutTitle} - O sistema aprenderá com sua decisão
          </p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  },

  /**
   * Ajuste desfeito
   */
  adjustmentUndone: (workoutTitle: string) => {
    toast.success(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-100 rounded-full">
          <Undo2 className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Ajuste Desfeito</p>
          <p className="text-sm text-muted-foreground">
            {workoutTitle} voltou ao estado original
          </p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  },

  /**
   * Threshold ajustado automaticamente (ML)
   */
  thresholdAdjusted: (oldValue: number, newValue: number) => {
    toast(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Info className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Sistema Aprendeu!</p>
          <p className="text-sm text-muted-foreground">
            Threshold ajustado de {oldValue}% para {newValue}% baseado em suas decisões
          </p>
        </div>
      </div>,
      {
        duration: 8000,
      }
    );
  },

  /**
   * Erro genérico
   */
  error: (message: string) => {
    toast.error(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Erro</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>,
      {
        duration: 6000,
      }
    );
  },

  /**
   * Premium feature locked
   */
  premiumRequired: (feature: string, onUpgrade?: () => void) => {
    toast(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Premium Necessário</p>
          <p className="text-sm text-muted-foreground">
            {feature} é uma funcionalidade Premium
          </p>
        </div>
      </div>,
      {
        action: onUpgrade ? {
          label: 'Upgrade',
          onClick: onUpgrade,
        } : undefined,
        duration: 8000,
      }
    );
  },

  /**
   * Multiple matches available
   */
  multipleMatches: (count: number, onView: () => void) => {
    toast(
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-100 rounded-full">
          <Zap className="h-4 w-4 text-yellow-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{count} Matches Detectados!</p>
          <p className="text-sm text-muted-foreground">
            Temos várias sugestões de ajustes para você
          </p>
        </div>
      </div>,
      {
        action: {
          label: 'Ver Todos',
          onClick: onView,
        },
        duration: 10000,
      }
    );
  },
};

// ============================================================================
// TOAST PROVIDER COMPONENT
// ============================================================================

/**
 * Este componente deve ser adicionado no layout root
 * 
 * Exemplo:
 * import { Toaster } from 'sonner';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster position="top-right" richColors />
 *       </body>
 *     </html>
 *   );
 * }
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Em qualquer componente:
import { flexNotifications } from '@/components/athera-flex/FlexNotifications';

// Quando detectar match:
flexNotifications.matchDetected(85, 'Longão 16km', () => {
  openModal();
});

// Quando aplicar ajuste:
flexNotifications.adjustmentApplied('Longão 16km', 85, async () => {
  await undoAdjustment();
});

// Auto-ajuste (Premium):
flexNotifications.autoAdjustApplied('Longão 16km', 92, async () => {
  await undoAdjustment();
});

// Múltiplos matches:
flexNotifications.multipleMatches(3, () => {
  router.push('/plano');
});

// Erro:
flexNotifications.error('Falha ao aplicar ajuste');

// Premium required:
flexNotifications.premiumRequired('Auto-ajuste', () => {
  router.push('/premium');
});
*/
