/**
 * Athera Flex Free User Banner
 * Banner contextual para usuários FREE mostrando benefícios Premium
 * v4.0.11 - Premium Integration Enhancement
 */

'use client';

import { Crown, Sparkles, Zap, BarChart3, Brain, Bell, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface FlexFreeUserBannerProps {
  onUpgrade: () => void;
  className?: string;
}

export default function FlexFreeUserBanner({ onUpgrade, className = '' }: FlexFreeUserBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('athera-flex-banner-dismissed');
    if (isDismissed) {
      const dismissedTime = parseInt(isDismissed);
      const now = Date.now();
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < threeDays) {
        setDismissed(true);
      } else {
        localStorage.removeItem('athera-flex-banner-dismissed');
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('athera-flex-banner-dismissed', Date.now().toString());
  };

  if (dismissed) return null;

  return (
    <Card className={`relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 ${className}`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-900/10 transition-colors z-10"
      >
        <X className="w-4 h-4 text-slate-600" />
      </button>

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                Desbloqueie o Poder Total do Athera Flex
              </h3>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            
            <p className="text-sm text-slate-600 mb-4">
              Você está usando a versão FREE. Faça upgrade para Premium e tenha acesso completo a:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-slate-700">
                  <strong>Auto-Match:</strong> Ajustes automáticos inteligentes
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-slate-700">
                  <strong>Analytics:</strong> Dashboard completo com insights
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-3.5 h-3.5 text-pink-600" />
                </div>
                <span className="text-slate-700">
                  <strong>Proativo:</strong> Sugestões baseadas em contexto
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-slate-700">
                  <strong>Notificações:</strong> Email, Push e In-App
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-slate-700">
                  <strong>AI Coach:</strong> Chat ilimitado com especialista
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-slate-700">
                  <strong>Relatórios:</strong> Exportação PDF profissional
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={onUpgrade}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Fazer Upgrade - R$ 9,90/mês
              </Button>
              
              <div className="text-xs text-slate-500">
                ou R$ 99/ano <span className="text-green-600 font-semibold">(economize 17%)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              ✨ Teste grátis por 7 dias • Cancele quando quiser • Sem compromisso
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
