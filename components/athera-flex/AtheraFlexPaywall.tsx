/**
 * Athera Flex Paywall Modal
 * Modal específico para features premium do Athera Flex
 * v4.0.10 - Premium Integration
 */

'use client';

import { Crown, X, Check, ArrowRight, Sparkles, Zap, Brain, TrendingUp, Bell, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AtheraFlexPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'auto-match' | 'analytics' | 'proactive' | 'notifications' | 'coach-chat' | 'export';
}

const FEATURE_CONFIG = {
  'auto-match': {
    title: 'Auto-Match Inteligente',
    icon: Zap,
    description: 'Deixe a IA ajustar seus treinos automaticamente com 85%+ de confiança',
  },
  'analytics': {
    title: 'Analytics Avançado',
    icon: BarChart3,
    description: 'Visualize insights profundos sobre seus padrões de treino e evolução',
  },
  'proactive': {
    title: 'Modo Proativo',
    icon: Brain,
    description: 'Sugestões inteligentes antecipadas baseadas em clima, energia e recuperação',
  },
  'notifications': {
    title: 'Notificações Multicanal',
    icon: Bell,
    description: 'Receba alertas por email, push e in-app sobre ajustes e sugestões',
  },
  'coach-chat': {
    title: 'AI Coach Chat',
    icon: Sparkles,
    description: 'Converse ilimitadamente com seu treinador virtual especializado',
  },
  'export': {
    title: 'Exportação de Relatórios',
    icon: TrendingUp,
    description: 'Exporte relatórios completos em PDF com análises detalhadas',
  },
};

const PREMIUM_BENEFITS = [
  {
    icon: Zap,
    title: 'Auto-Match Inteligente',
    description: 'Ajustes automáticos com ML de alta confiança',
  },
  {
    icon: BarChart3,
    title: 'Analytics Completo',
    description: 'Dashboard com 5+ gráficos profissionais',
  },
  {
    icon: Brain,
    title: 'Modo Proativo',
    description: 'Sugestões baseadas em contexto real',
  },
  {
    icon: Bell,
    title: 'Notificações Multicanal',
    description: 'Email, Push e In-App notifications',
  },
  {
    icon: Sparkles,
    title: 'AI Coach Ilimitado',
    description: 'Chat sem limites com especialista IA',
  },
  {
    icon: TrendingUp,
    title: 'Relatórios PDF',
    description: 'Exportação profissional de análises',
  },
];

export default function AtheraFlexPaywall({ isOpen, onClose, feature }: AtheraFlexPaywallProps) {
  const config = FEATURE_CONFIG[feature];
  const FeatureIcon = config.icon;

  const handleUpgrade = () => {
    window.location.href = '/pricing?feature=athera-flex';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 z-50"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
            <FeatureIcon className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Description */}
          <div className="text-center px-4">
            <Badge variant="outline" className="mb-3 bg-purple-50 text-purple-700 border-purple-200">
              <Sparkles className="w-3 h-3 mr-1" />
              PREMIUM FEATURE
            </Badge>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>

          {/* Premium Benefits Grid */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4 text-center">
              ✨ Tudo que você ganha com Premium:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREMIUM_BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {benefit.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Athera Flex Premium
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                R$ 9,90
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                /mês
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ou R$ 99/ano (economize 17%)
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg"
              size="lg"
              onClick={handleUpgrade}
            >
              <Crown className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              Talvez mais tarde
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            💳 Pagamento seguro via Stripe • Cancele quando quiser
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
