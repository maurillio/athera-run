// Notification System para Athera Flex
// Suporta: Email, Push (Web/Mobile), In-App
// Integra com SendGrid (email) e Firebase Cloud Messaging (push)

export type NotificationType = 
  | 'match_found'           // Match detectado (alta confiança)
  | 'match_pending'         // Match precisa decisão
  | 'auto_accepted'         // Match aceito automaticamente
  | 'adjustment_applied'    // Ajuste aplicado com sucesso
  | 'weekly_summary'        // Resumo semanal de ajustes
  | 'prediction_insight';   // Insights preditivos

export type NotificationChannel = 'email' | 'push' | 'in_app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    matchFound: boolean;
    matchPending: boolean;
    autoAccepted: boolean;
    adjustmentApplied: boolean;
    weeklySummary: boolean;
    predictionInsight: boolean;
  };
  push: {
    enabled: boolean;
    matchFound: boolean;
    matchPending: boolean;
    autoAccepted: boolean;
    adjustmentApplied: boolean;
  };
  inApp: {
    enabled: boolean;
    all: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
}

export interface NotificationTemplate {
  type: NotificationType;
  email: {
    subject: string;
    htmlBody: string;
    textBody: string;
  };
  push: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
  };
  inApp: {
    title: string;
    body: string;
    variant: 'info' | 'success' | 'warning' | 'error';
  };
}
