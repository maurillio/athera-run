import { prisma } from '@/lib/db';
import {
  NotificationPayload,
  NotificationPreferences,
  NotificationType,
  NotificationChannel,
  NotificationPriority
} from './types';
import { getTemplate, renderTemplate } from './templates';

export class NotificationService {
  
  // Enviar notificação multi-canal
  async send(payload: NotificationPayload): Promise<{
    success: boolean;
    channels: Record<NotificationChannel, boolean>;
    error?: string;
  }> {
    try {
      // 1. Buscar preferências do usuário
      const prefs = await this.getPreferences(payload.userId);
      
      // 2. Verificar quiet hours
      if (this.isQuietHours(prefs)) {
        console.log(`User ${payload.userId} in quiet hours, queuing notification`);
        await this.queueNotification(payload);
        return {
          success: true,
          channels: { email: false, push: false, in_app: false }
        };
      }

      // 3. Filtrar canais baseado em preferências
      const activeChannels = this.filterChannelsByPreferences(
        payload.channels,
        payload.type,
        prefs
      );

      // 4. Enviar por cada canal ativo
      const results: Record<NotificationChannel, boolean> = {
        email: false,
        push: false,
        in_app: false
      };

      for (const channel of activeChannels) {
        try {
          switch (channel) {
            case 'email':
              results.email = await this.sendEmail(payload);
              break;
            case 'push':
              results.push = await this.sendPush(payload);
              break;
            case 'in_app':
              results.in_app = await this.sendInApp(payload);
              break;
          }
        } catch (error) {
          console.error(`Error sending ${channel} notification:`, error);
          results[channel] = false;
        }
      }

      // 5. Registrar no histórico
      await this.logNotification(payload, results);

      return {
        success: Object.values(results).some(v => v),
        channels: results
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        channels: { email: false, push: false, in_app: false },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Enviar email via SendGrid
  private async sendEmail(payload: NotificationPayload): Promise<boolean> {
    try {
      // Buscar template
      const template = getTemplate(payload.type);
      if (!template) {
        console.error(`Template not found for ${payload.type}`);
        return false;
      }

      // Buscar email do usuário
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { email: true, name: true }
      });

      if (!user?.email) {
        console.error(`User email not found for ${payload.userId}`);
        return false;
      }

      // Renderizar template
      const data = {
        userName: user.name || 'Atleta',
        ...payload.data
      };

      const subject = renderTemplate(template.email.subject, data);
      const htmlBody = renderTemplate(template.email.htmlBody, data);
      const textBody = renderTemplate(template.email.textBody, data);

      // TODO: Integrar com SendGrid
      // Por enquanto, apenas log
      console.log('📧 Email would be sent:', {
        to: user.email,
        subject,
        preview: textBody.substring(0, 100)
      });

      // Simulando sucesso (na produção, chamar SendGrid API)
      return true;

    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Enviar push notification via Firebase Cloud Messaging
  private async sendPush(payload: NotificationPayload): Promise<boolean> {
    try {
      // Buscar FCM tokens do usuário
      const tokens = await this.getUserPushTokens(payload.userId);
      
      if (tokens.length === 0) {
        console.log(`No push tokens for user ${payload.userId}`);
        return false;
      }

      // Buscar template
      const template = getTemplate(payload.type);
      if (!template) return false;

      // Renderizar template
      const title = renderTemplate(template.push.title, payload.data || {});
      const body = renderTemplate(template.push.body, payload.data || {});

      // TODO: Integrar com Firebase Cloud Messaging
      // Por enquanto, apenas log
      console.log('📱 Push would be sent:', {
        tokens: tokens.length,
        title,
        body
      });

      // Simulando sucesso (na produção, chamar FCM API)
      return true;

    } catch (error) {
      console.error('Error sending push:', error);
      return false;
    }
  }

  // Enviar notificação in-app (salva no banco)
  private async sendInApp(payload: NotificationPayload): Promise<boolean> {
    try {
      // Buscar template
      const template = getTemplate(payload.type);
      if (!template) return false;

      // Renderizar template
      const title = renderTemplate(template.inApp.title, payload.data || {});
      const body = renderTemplate(template.inApp.body, payload.data || {});

      // Salvar no banco (tabela de notificações in-app)
      await prisma.inAppNotification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          priority: payload.priority,
          title,
          body,
          variant: template.inApp.variant,
          actionUrl: payload.actionUrl,
          actionLabel: payload.actionLabel,
          data: payload.data,
          read: false,
          expiresAt: payload.expiresAt
        }
      });

      return true;

    } catch (error) {
      console.error('Error sending in-app notification:', error);
      return false;
    }
  }

  // Buscar preferências do usuário
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId }
    });

    if (!prefs) {
      // Retornar padrões se não existe
      return this.getDefaultPreferences(userId);
    }

    return prefs as NotificationPreferences;
  }

  // Preferências padrão
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: {
        enabled: true,
        matchFound: true,
        matchPending: true,
        autoAccepted: true,
        adjustmentApplied: true,
        weeklySummary: true,
        predictionInsight: false
      },
      push: {
        enabled: true,
        matchFound: true,
        matchPending: true,
        autoAccepted: true,
        adjustmentApplied: false
      },
      inApp: {
        enabled: true,
        all: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'America/Sao_Paulo'
      }
    };
  }

  // Verificar se está em horário de silêncio
  private isQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quietHours.enabled) return false;

    const now = new Date();
    const [startH, startM] = prefs.quietHours.start.split(':').map(Number);
    const [endH, endM] = prefs.quietHours.end.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes < endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Quiet hours cross midnight
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  // Filtrar canais baseado em preferências
  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    type: NotificationType,
    prefs: NotificationPreferences
  ): NotificationChannel[] {
    return channels.filter(channel => {
      if (channel === 'email') {
        if (!prefs.email.enabled) return false;
        return (prefs.email as any)[this.typeToPreferenceKey(type)] !== false;
      }
      
      if (channel === 'push') {
        if (!prefs.push.enabled) return false;
        return (prefs.push as any)[this.typeToPreferenceKey(type)] !== false;
      }
      
      if (channel === 'in_app') {
        return prefs.inApp.enabled && prefs.inApp.all;
      }

      return false;
    });
  }

  // Converter tipo para chave de preferência
  private typeToPreferenceKey(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      match_found: 'matchFound',
      match_pending: 'matchPending',
      auto_accepted: 'autoAccepted',
      adjustment_applied: 'adjustmentApplied',
      weekly_summary: 'weeklySummary',
      prediction_insight: 'predictionInsight'
    };
    return map[type];
  }

  // Buscar tokens push do usuário
  private async getUserPushTokens(userId: string): Promise<string[]> {
    const devices = await prisma.userDevice.findMany({
      where: {
        userId,
        pushToken: { not: null },
        active: true
      },
      select: { pushToken: true }
    });

    return devices
      .map(d => d.pushToken)
      .filter((t): t is string => t !== null);
  }

  // Guardar notificação em fila (para quiet hours)
  private async queueNotification(payload: NotificationPayload): Promise<void> {
    await prisma.notificationQueue.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        priority: payload.priority,
        channels: payload.channels,
        payload: payload as any,
        scheduledFor: this.calculateNextActiveTime(payload.userId)
      }
    });
  }

  // Calcular próximo horário ativo
  private async calculateNextActiveTime(userId: string): Promise<Date> {
    const prefs = await this.getPreferences(userId);
    const now = new Date();
    
    if (!prefs.quietHours.enabled) {
      return now;
    }

    const [endH, endM] = prefs.quietHours.end.split(':').map(Number);
    const nextActive = new Date(now);
    nextActive.setHours(endH, endM, 0, 0);

    if (nextActive <= now) {
      nextActive.setDate(nextActive.getDate() + 1);
    }

    return nextActive;
  }

  // Registrar notificação no histórico
  private async logNotification(
    payload: NotificationPayload,
    results: Record<NotificationChannel, boolean>
  ): Promise<void> {
    await prisma.notificationLog.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        priority: payload.priority,
        channels: payload.channels,
        sent: results,
        success: Object.values(results).some(v => v),
        payload: payload as any
      }
    });
  }

  // Processar fila de notificações (cron job)
  async processQueue(): Promise<number> {
    const now = new Date();
    const pending = await prisma.notificationQueue.findMany({
      where: {
        scheduledFor: { lte: now },
        processed: false
      },
      take: 50
    });

    let processed = 0;
    for (const item of pending) {
      try {
        await this.send(item.payload as any);
        await prisma.notificationQueue.update({
          where: { id: item.id },
          data: { processed: true, processedAt: new Date() }
        });
        processed++;
      } catch (error) {
        console.error(`Error processing queued notification ${item.id}:`, error);
      }
    }

    return processed;
  }
}
