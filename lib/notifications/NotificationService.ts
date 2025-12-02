// lib/notifications/NotificationService.ts
// ATHERA FLEX v3.3.0 - Sistema de Notificações Completo
// Envia email, push e in-app notifications

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';

export interface NotificationPayload {
  userId: string;
  type: 'match_found' | 'auto_accepted' | 'manual_accepted' | 'rejected' | 'suggestion_available';
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Envia notificação multicanal baseado nas preferências do usuário
   */
  async send(payload: NotificationPayload): Promise<void> {
    const { userId, type, title, message, data, actionUrl } = payload;

    // 1. Buscar preferências do usuário
    const prefs = await prisma.notification_preferences.findUnique({
      where: { user_id: userId }
    });

    if (!prefs) {
      console.log(`[NotificationService] Usuário ${userId} sem preferências, usando defaults`);
      // Se não tem preferências, usa defaults (tudo habilitado)
      await this.sendAll(payload);
      return;
    }

    const promises: Promise<any>[] = [];

    // 2. EMAIL
    if (this.shouldSendEmail(prefs, type)) {
      promises.push(this.sendEmailNotification(userId, title, message, actionUrl));
    }

    // 3. PUSH
    if (this.shouldSendPush(prefs, type)) {
      promises.push(this.sendPushNotification(userId, title, message, data));
    }

    // 4. IN-APP (sempre cria registro se habilitado)
    if (prefs.in_app_enabled) {
      promises.push(this.createInAppNotification(userId, type, title, message, data, actionUrl));
    }

    await Promise.all(promises);
  }

  /**
   * Verifica se deve enviar email baseado em preferências e tipo
   */
  private shouldSendEmail(prefs: any, type: string): boolean {
    if (!prefs.email_enabled) return false;

    switch (type) {
      case 'match_found':
        return prefs.email_match_found;
      case 'auto_accepted':
        return prefs.email_auto_accepted;
      default:
        return true; // outros tipos sempre enviam se email habilitado
    }
  }

  /**
   * Verifica se deve enviar push baseado em preferências e tipo
   */
  private shouldSendPush(prefs: any, type: string): boolean {
    if (!prefs.push_enabled) return false;

    switch (type) {
      case 'match_found':
        return prefs.push_match_found;
      default:
        return true;
    }
  }

  /**
   * Envia email
   */
  private async sendEmailNotification(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user?.email) {
        console.log(`[NotificationService] Usuário ${userId} sem email`);
        return;
      }

      const emailHtml = this.buildEmailTemplate(user.name || 'Atleta', title, message, actionUrl);

      await sendEmail({
        to: user.email,
        subject: `🏃 Athera Flex: ${title}`,
        html: emailHtml
      });

      console.log(`[NotificationService] Email enviado para ${user.email}`);
    } catch (error) {
      console.error('[NotificationService] Erro ao enviar email:', error);
    }
  }

  /**
   * Envia push notification
   */
  private async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      await sendPushNotification({
        userId,
        title,
        body: message,
        data: data || {}
      });

      console.log(`[NotificationService] Push enviado para ${userId}`);
    } catch (error) {
      console.error('[NotificationService] Erro ao enviar push:', error);
    }
  }

  /**
   * Cria notificação in-app no banco
   */
  private async createInAppNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, any>,
    actionUrl?: string
  ): Promise<void> {
    try {
      await prisma.in_app_notifications.create({
        data: {
          user_id: userId,
          type,
          title,
          message,
          data: data || {},
          action_url: actionUrl,
          is_read: false,
          created_at: new Date()
        }
      });

      console.log(`[NotificationService] In-app criada para ${userId}`);
    } catch (error) {
      console.error('[NotificationService] Erro ao criar in-app:', error);
    }
  }

  /**
   * Envia para todos os canais (usado quando não há preferências)
   */
  private async sendAll(payload: NotificationPayload): Promise<void> {
    await Promise.all([
      this.sendEmailNotification(payload.userId, payload.title, payload.message, payload.actionUrl),
      this.sendPushNotification(payload.userId, payload.title, payload.message, payload.data),
      this.createInAppNotification(
        payload.userId,
        payload.type,
        payload.title,
        payload.message,
        payload.data,
        payload.actionUrl
      )
    ]);
  }

  /**
   * Template HTML para emails
   */
  private buildEmailTemplate(
    userName: string,
    title: string,
    message: string,
    actionUrl?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🏃 Athera Flex</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px; margin: 0 0 10px 0;">Olá, <strong>${userName}</strong>!</p>
      
      <h2 style="color: #667eea; font-size: 20px; margin: 20px 0;">${title}</h2>
      
      <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">${message}</p>

      ${actionUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Ver Detalhes
        </a>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.5;">
        <strong>O que é Athera Flex?</strong><br>
        Sistema inteligente que sugere ajustes no seu plano de treino quando detecta mudanças na sua rotina.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        <a href="https://atherarun.com/settings/notifications" style="color: #667eea; text-decoration: none;">Gerenciar Preferências</a>
        <br><br>
        © 2025 Athera Run - Treinos Inteligentes
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Marca notificação in-app como lida
   */
  async markAsRead(notificationId: number): Promise<void> {
    await prisma.in_app_notifications.update({
      where: { id: notificationId },
      data: { 
        is_read: true,
        read_at: new Date()
      }
    });
  }

  /**
   * Marca todas as notificações do usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.in_app_notifications.updateMany({
      where: { 
        user_id: userId,
        is_read: false
      },
      data: { 
        is_read: true,
        read_at: new Date()
      }
    });
  }

  /**
   * Busca notificações in-app do usuário
   */
  async getInAppNotifications(userId: string, limit: number = 20): Promise<any[]> {
    return await prisma.in_app_notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  /**
   * Conta notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.in_app_notifications.count({
      where: { 
        user_id: userId,
        is_read: false
      }
    });
  }

  /**
   * Deleta notificações antigas (> 30 dias)
   */
  async cleanupOldNotifications(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.in_app_notifications.deleteMany({
      where: {
        created_at: { lt: thirtyDaysAgo },
        is_read: true
      }
    });

    console.log(`[NotificationService] Deletadas ${result.count} notificações antigas`);
    return result.count;
  }
}

// Export singleton
export const notificationService = new NotificationService();
