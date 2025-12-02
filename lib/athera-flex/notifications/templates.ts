import { NotificationType, NotificationTemplate } from './types';

// Templates de notificações em PT-BR
// Personalizáveis por tipo e canal

export const notificationTemplates: Record<NotificationType, NotificationTemplate> = {
  match_found: {
    type: 'match_found',
    email: {
      subject: '🎯 Athera Flex detectou um match no seu treino!',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">🎯 Match Detectado!</h2>
          <p>Olá {{userName}},</p>
          <p>Detectamos que você realizou um treino que pode corresponder ao planejado:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Treino Executado:</strong> {{executedWorkout}}</p>
            <p><strong>Treino Planejado:</strong> {{plannedWorkout}}</p>
            <p><strong>Confiança:</strong> {{confidence}}%</p>
          </div>
          <p>{{reasoning}}</p>
          <a href="{{actionUrl}}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver Detalhes e Decidir
          </a>
          <p style="color: #6b7280; font-size: 12px;">
            Athera Flex · Seu treino, sua flexibilidade
          </p>
        </div>
      `,
      textBody: `
        🎯 Match Detectado!
        
        Olá {{userName}},
        
        Detectamos que você realizou um treino que pode corresponder ao planejado:
        
        Treino Executado: {{executedWorkout}}
        Treino Planejado: {{plannedWorkout}}
        Confiança: {{confidence}}%
        
        {{reasoning}}
        
        Acesse: {{actionUrl}}
        
        Athera Flex · Seu treino, sua flexibilidade
      `
    },
    push: {
      title: '🎯 Match detectado!',
      body: '{{executedWorkout}} pode ser {{plannedWorkout}}. Confiança: {{confidence}}%',
      icon: '/icons/flex-match.png',
      badge: '/icons/badge.png'
    },
    inApp: {
      title: 'Match Detectado',
      body: '{{executedWorkout}} pode corresponder a {{plannedWorkout}} ({{confidence}}% confiança)',
      variant: 'info'
    }
  },

  match_pending: {
    type: 'match_pending',
    email: {
      subject: '⏰ Você tem matches pendentes no Athera Flex',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⏰ Decisões Pendentes</h2>
          <p>Olá {{userName}},</p>
          <p>Você tem {{count}} match(es) aguardando sua decisão:</p>
          <ul style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            {{#matches}}
            <li>{{workout}} (Confiança: {{confidence}}%)</li>
            {{/matches}}
          </ul>
          <a href="{{actionUrl}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Revisar Agora
          </a>
          <p style="color: #6b7280; font-size: 12px;">
            Athera Flex · Seu treino, sua flexibilidade
          </p>
        </div>
      `,
      textBody: `
        ⏰ Decisões Pendentes
        
        Olá {{userName}},
        
        Você tem {{count}} match(es) aguardando sua decisão.
        
        Acesse: {{actionUrl}}
        
        Athera Flex · Seu treino, sua flexibilidade
      `
    },
    push: {
      title: '⏰ Matches pendentes',
      body: '{{count}} treino(s) aguardam sua decisão',
      icon: '/icons/flex-pending.png'
    },
    inApp: {
      title: 'Matches Pendentes',
      body: 'Você tem {{count}} treino(s) aguardando decisão',
      variant: 'warning'
    }
  },

  auto_accepted: {
    type: 'auto_accepted',
    email: {
      subject: '✅ Athera Flex aceitou automaticamente um match!',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✅ Match Aceito Automaticamente!</h2>
          <p>Olá {{userName}},</p>
          <p>Um match de alta confiança foi aceito automaticamente:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Treino Executado:</strong> {{executedWorkout}}</p>
            <p><strong>Substituiu:</strong> {{plannedWorkout}}</p>
            <p><strong>Confiança:</strong> {{confidence}}%</p>
          </div>
          <p>{{reasoning}}</p>
          <p>Seu calendário foi atualizado automaticamente!</p>
          <a href="{{actionUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver no Calendário
          </a>
          <p style="color: #6b7280; font-size: 11px;">
            💡 Não concorda? Você pode reverter essa decisão nas configurações do Athera Flex.
          </p>
        </div>
      `,
      textBody: `
        ✅ Match Aceito Automaticamente!
        
        Olá {{userName}},
        
        Um match de alta confiança foi aceito automaticamente:
        
        Treino Executado: {{executedWorkout}}
        Substituiu: {{plannedWorkout}}
        Confiança: {{confidence}}%
        
        {{reasoning}}
        
        Seu calendário foi atualizado automaticamente!
        
        Acesse: {{actionUrl}}
        
        💡 Não concorda? Você pode reverter essa decisão.
      `
    },
    push: {
      title: '✅ Match aceito automaticamente',
      body: '{{executedWorkout}} → {{plannedWorkout}} ({{confidence}}%)',
      icon: '/icons/flex-success.png'
    },
    inApp: {
      title: 'Match Aceito Automaticamente',
      body: '{{executedWorkout}} substituiu {{plannedWorkout}}',
      variant: 'success'
    }
  },

  adjustment_applied: {
    type: 'adjustment_applied',
    email: {
      subject: '🔄 Ajuste aplicado ao seu plano de treino',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">🔄 Ajuste Aplicado!</h2>
          <p>Olá {{userName}},</p>
          <p>Um ajuste foi aplicado ao seu plano:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Tipo:</strong> {{adjustmentType}}</p>
            <p><strong>Treino:</strong> {{workout}}</p>
            <p><strong>Mudança:</strong> {{change}}</p>
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver Plano Atualizado
          </a>
        </div>
      `,
      textBody: `
        🔄 Ajuste Aplicado!
        
        Olá {{userName}},
        
        Um ajuste foi aplicado ao seu plano:
        
        Tipo: {{adjustmentType}}
        Treino: {{workout}}
        Mudança: {{change}}
        
        Acesse: {{actionUrl}}
      `
    },
    push: {
      title: '🔄 Ajuste aplicado',
      body: '{{adjustmentType}}: {{workout}}',
      icon: '/icons/flex-adjust.png'
    },
    inApp: {
      title: 'Ajuste Aplicado',
      body: '{{adjustmentType}} aplicado em {{workout}}',
      variant: 'info'
    }
  },

  weekly_summary: {
    type: 'weekly_summary',
    email: {
      subject: '📊 Seu resumo semanal Athera Flex',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">📊 Resumo Semanal</h2>
          <p>Olá {{userName}},</p>
          <p>Aqui está o resumo dos ajustes da última semana:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>✅ Matches aceitos:</strong> {{acceptedCount}}</p>
            <p><strong>❌ Matches rejeitados:</strong> {{rejectedCount}}</p>
            <p><strong>🤖 Automáticos:</strong> {{autoCount}}</p>
            <p><strong>📈 Taxa de match:</strong> {{matchRate}}%</p>
          </div>
          <p><strong>Insights:</strong></p>
          <ul>
            {{#insights}}
            <li>{{insight}}</li>
            {{/insights}}
          </ul>
          <a href="{{actionUrl}}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver Histórico Completo
          </a>
        </div>
      `,
      textBody: `
        📊 Resumo Semanal
        
        Olá {{userName}},
        
        Resumo dos ajustes da última semana:
        
        ✅ Matches aceitos: {{acceptedCount}}
        ❌ Matches rejeitados: {{rejectedCount}}
        🤖 Automáticos: {{autoCount}}
        📈 Taxa de match: {{matchRate}}%
        
        Acesse: {{actionUrl}}
      `
    },
    push: {
      title: '📊 Resumo semanal',
      body: '{{acceptedCount}} matches esta semana. Taxa: {{matchRate}}%',
      icon: '/icons/flex-summary.png'
    },
    inApp: {
      title: 'Resumo Semanal',
      body: '{{acceptedCount}} matches aceitos esta semana',
      variant: 'info'
    }
  },

  prediction_insight: {
    type: 'prediction_insight',
    email: {
      subject: '🔮 Athera Flex: Insights preditivos para seus treinos',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">🔮 Insights Preditivos</h2>
          <p>Olá {{userName}},</p>
          <p>Com base no seu histórico, detectamos padrões interessantes:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            {{#predictions}}
            <div style="margin: 15px 0;">
              <p><strong>{{workout}}</strong></p>
              <p>{{insight}}</p>
              <p style="color: #6b7280; font-size: 13px;">Confiança: {{confidence}}%</p>
            </div>
            {{/predictions}}
          </div>
          <a href="{{actionUrl}}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Ver Predições Completas
          </a>
        </div>
      `,
      textBody: `
        🔮 Insights Preditivos
        
        Olá {{userName}},
        
        Com base no seu histórico, detectamos padrões interessantes.
        
        Acesse: {{actionUrl}}
      `
    },
    push: {
      title: '🔮 Insights preditivos',
      body: 'Novos padrões detectados nos seus treinos',
      icon: '/icons/flex-predict.png'
    },
    inApp: {
      title: 'Insights Preditivos',
      body: 'Novos padrões detectados baseados no seu histórico',
      variant: 'info'
    }
  }
};

export function getTemplate(type: NotificationType): NotificationTemplate {
  return notificationTemplates[type];
}

export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  let rendered = template;
  
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(placeholder, String(value));
  }
  
  return rendered;
}
