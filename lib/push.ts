// lib/push.ts
// ATHERA FLEX v3.3.0 - Push Notification Service (OneSignal)

interface SendPushParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendPushNotification({ userId, title, body, data }: SendPushParams): Promise<void> {
  // TODO: Implementar com OneSignal API
  // Por enquanto apenas log (implementar quando tiver API key)
  
  if (process.env.ONESIGNAL_API_KEY && process.env.ONESIGNAL_APP_ID) {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${process.env.ONESIGNAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.ONESIGNAL_APP_ID,
          include_external_user_ids: [userId],
          headings: { en: title },
          contents: { en: body },
          data: data || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`OneSignal API error: ${response.statusText}`);
      }

      console.log(`[Push] Enviado para usuário ${userId}: ${title}`);
    } catch (error) {
      console.error('[Push] Erro ao enviar:', error);
      throw error;
    }
  } else {
    console.log(`[Push] [DEV MODE] Para: ${userId}`);
    console.log(`[Push] [DEV MODE] Título: ${title}`);
    console.log(`[Push] [DEV MODE] Mensagem: ${body}`);
    console.log(`[Push] [DEV MODE] Configure ONESIGNAL_API_KEY e ONESIGNAL_APP_ID para enviar push reais`);
  }
}
