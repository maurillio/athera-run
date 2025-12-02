/**
 * ATHERA FLEX - Strava Sync Hook
 * Integra AutoMatchProcessor com sincronização do Strava
 * Fase 3 - Sessão 4
 */

import { AutoMatchProcessor } from '../jobs/AutoMatchProcessor';

export class StravaSyncHook {
  private processor: AutoMatchProcessor;

  constructor() {
    this.processor = new AutoMatchProcessor();
  }

  /**
   * Chamado APÓS sincronização bem-sucedida do Strava
   * Adicionar em: app/api/strava/sync/route.ts (no final do POST)
   */
  async onSyncComplete(userId: string): Promise<void> {
    try {
      console.log('[StravaSyncHook] Iniciando processamento Athera Flex...');

      // Aguarda 2 segundos para garantir que atividades foram salvas
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Processa matches automaticamente
      const result = await this.processor.processNewActivities(userId);

      console.log('[StravaSyncHook] Resultado:', result);

      // TODO: Se houver matches pendentes, notificar usuário
      if (result.pending > 0) {
        await this.notifyPendingMatches(userId, result.pending);
      }

    } catch (error) {
      console.error('[StravaSyncHook] Erro:', error);
      // Não falha o sync se Athera Flex falhar
    }
  }

  /**
   * Notifica usuário sobre matches pendentes
   * TODO: Integrar com sistema de notificações (email/push)
   */
  private async notifyPendingMatches(userId: string, count: number): Promise<void> {
    console.log(`[StravaSyncHook] ${count} matches pendentes para revisão do usuário ${userId}`);
    
    // TODO: Implementar notificação real quando tiver sistema de emails/push
    // Por enquanto, apenas log
  }
}

// Export singleton
export const stravaSyncHook = new StravaSyncHook();
