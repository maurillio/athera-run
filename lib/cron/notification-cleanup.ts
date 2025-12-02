// lib/cron/notification-cleanup.ts
// ATHERA FLEX v3.3.0 - Cron Job para Limpeza de Notificações Antigas

import { notificationService } from '@/lib/notifications/NotificationService';

/**
 * Executa limpeza de notificações antigas (> 30 dias e lidas)
 * Deve ser executado diariamente via Vercel Cron
 */
export async function cleanupOldNotifications(): Promise<{
  success: boolean;
  deleted: number;
  error?: string;
}> {
  try {
    console.log('[Cron] Iniciando limpeza de notificações antigas...');
    
    const deleted = await notificationService.cleanupOldNotifications();
    
    console.log(`[Cron] Limpeza concluída: ${deleted} notificações removidas`);
    
    return {
      success: true,
      deleted
    };
  } catch (error: any) {
    console.error('[Cron] Erro na limpeza:', error);
    return {
      success: false,
      deleted: 0,
      error: error.message
    };
  }
}
