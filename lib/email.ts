// lib/email.ts
// ATHERA FLEX v3.3.0 - Email Service (Resend)

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  // TODO: Implementar com Resend API
  // Por enquanto apenas log (implementar quando tiver API key)
  
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Athera Run <noreply@atherarun.com>',
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      console.log(`[Email] Enviado para ${to}: ${subject}`);
    } catch (error) {
      console.error('[Email] Erro ao enviar:', error);
      throw error;
    }
  } else {
    console.log(`[Email] [DEV MODE] Para: ${to}`);
    console.log(`[Email] [DEV MODE] Assunto: ${subject}`);
    console.log(`[Email] [DEV MODE] Configure RESEND_API_KEY para enviar emails reais`);
  }
}
