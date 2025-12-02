/**
 * ATHERA FLEX v3.3.0 - Flex Settings Panel
 * Painel de configurações do sistema de flexibilidade (Premium)
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Lock, Save, RotateCcw, Zap, Bell, Mail, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface FlexSettings {
  // Automação (Premium)
  autoAdjustEnabled: boolean;
  autoAdjustThreshold: number;
  notifyBeforeAdjust: boolean;
  
  // Notificações
  emailOnAutoAdjust: boolean;
  emailOnSuggestion: boolean;
  inAppNotifications: boolean;
  
  // Flexibilidade
  flexibilityWindow: number;
  allowVolumeIncrease: boolean;
  allowVolumeDecrease: boolean;
  maxVolumeVariance: number;
  
  // Avançado
  preferSameDay: boolean;
  autoAcceptHighConf: boolean;
  learningMode: boolean;
}

const DEFAULT_SETTINGS: FlexSettings = {
  autoAdjustEnabled: false,
  autoAdjustThreshold: 90,
  notifyBeforeAdjust: true,
  emailOnAutoAdjust: true,
  emailOnSuggestion: true,
  inAppNotifications: true,
  flexibilityWindow: 3,
  allowVolumeIncrease: true,
  allowVolumeDecrease: true,
  maxVolumeVariance: 50,
  preferSameDay: false,
  autoAcceptHighConf: false,
  learningMode: true,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function FlexSettingsPanel() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<FlexSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isPremium = session?.user?.isPremium || false;

  // Buscar settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/athera-flex/settings');
      if (!response.ok) throw new Error('Erro ao buscar configurações');
      
      const data = await response.json();
      setSettings(data.settings);
      setHasChanges(false);
    } catch (error: any) {
      console.error('[Settings] Error:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Salvar settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/athera-flex/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          toast.error(data.message || 'Recurso Premium necessário');
          return;
        }
        throw new Error(data.error || 'Erro ao salvar');
      }

      toast.success('Configurações salvas com sucesso!');
      setHasChanges(false);
      fetchSettings(); // Recarregar
    } catch (error: any) {
      console.error('[Settings] Save error:', error);
      toast.error(error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // Reset para defaults
  const handleReset = () => {
    if (!confirm('Tem certeza que deseja restaurar as configurações padrão?')) return;
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  // Update setting
  const updateSetting = <K extends keyof FlexSettings>(
    key: K,
    value: FlexSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Premium Lock Component
  const PremiumLock = () => (
    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-2">
      <Lock className="h-3 w-3 mr-1" />
      Premium
    </Badge>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Athera Flex - Configurações
        </CardTitle>
        <CardDescription>
          Personalize como o sistema detecta e aplica ajustes automaticamente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Auto-Adjust Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Auto-Ajuste Automático
                {!isPremium && <PremiumLock />}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sistema aplica ajustes automaticamente quando confiança {'≥'} threshold
              </p>
            </div>
            <Switch
              checked={isPremium ? settings.autoAdjustEnabled : false}
              onCheckedChange={(v) => updateSetting('autoAdjustEnabled', v)}
              disabled={!isPremium || saving}
            />
          </div>

          {settings.autoAdjustEnabled && isPremium && (
            <>
              <div className="space-y-2 pl-6">
                <Label>
                  Threshold de Confiança: {settings.autoAdjustThreshold}%
                </Label>
                <Slider
                  value={[settings.autoAdjustThreshold]}
                  onValueChange={([v]) => updateSetting('autoAdjustThreshold', v)}
                  min={60}
                  max={100}
                  step={5}
                  className="w-full"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Apenas matches com confiança {'>='} {settings.autoAdjustThreshold}% serão aplicados automaticamente
                </p>
              </div>

              <div className="flex items-center justify-between pl-6">
                <Label className="text-sm">Notificar antes de aplicar</Label>
                <Switch
                  checked={settings.notifyBeforeAdjust}
                  onCheckedChange={(v) => updateSetting('notifyBeforeAdjust', v)}
                  disabled={saving}
                />
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Notificações */}
        <div className="space-y-4">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </h3>

          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Notificações no app</Label>
              <Switch
                checked={settings.inAppNotifications}
                onCheckedChange={(v) => updateSetting('inAppNotifications', v)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                Email quando houver sugestão
              </Label>
              <Switch
                checked={settings.emailOnSuggestion}
                onCheckedChange={(v) => updateSetting('emailOnSuggestion', v)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                Email quando auto-ajuste for aplicado
                {!isPremium && <PremiumLock />}
              </Label>
              <Switch
                checked={isPremium ? settings.emailOnAutoAdjust : false}
                onCheckedChange={(v) => updateSetting('emailOnAutoAdjust', v)}
                disabled={!isPremium || saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Flexibilidade */}
        <div className="space-y-4">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Janela de Flexibilidade
          </h3>

          <div className="space-y-2 pl-6">
            <Label>
              Dias de tolerância: {settings.flexibilityWindow} {settings.flexibilityWindow === 1 ? 'dia' : 'dias'}
            </Label>
            <Slider
              value={[settings.flexibilityWindow]}
              onValueChange={([v]) => updateSetting('flexibilityWindow', v)}
              min={1}
              max={7}
              step={1}
              className="w-full"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Sistema buscará matches até {settings.flexibilityWindow} dias antes/depois da data planejada
            </p>
          </div>

          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Permitir aumento de volume</Label>
              <Switch
                checked={settings.allowVolumeIncrease}
                onCheckedChange={(v) => updateSetting('allowVolumeIncrease', v)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Permitir redução de volume</Label>
              <Switch
                checked={settings.allowVolumeDecrease}
                onCheckedChange={(v) => updateSetting('allowVolumeDecrease', v)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Variação máxima de volume: ±{settings.maxVolumeVariance}%
              </Label>
              <Slider
                value={[settings.maxVolumeVariance]}
                onValueChange={([v]) => updateSetting('maxVolumeVariance', v)}
                min={20}
                max={100}
                step={10}
                className="w-full"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Avançado */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">Configurações Avançadas</h3>

          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Preferir mesmo dia</Label>
                <p className="text-xs text-muted-foreground">Prioriza matches na mesma data</p>
              </div>
              <Switch
                checked={settings.preferSameDay}
                onCheckedChange={(v) => updateSetting('preferSameDay', v)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Modo aprendizado</Label>
                <p className="text-xs text-muted-foreground">Sistema ajusta threshold baseado em suas decisões</p>
              </div>
              <Switch
                checked={settings.learningMode}
                onCheckedChange={(v) => updateSetting('learningMode', v)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            disabled={saving}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
        </div>

        {/* Premium Upsell */}
        {!isPremium && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Desbloqueie o poder do Auto-Ajuste</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Com Premium, o sistema aplica ajustes automaticamente quando detecta matches de alta confiança. 
                    Economize tempo e nunca mais esqueça de marcar treinos como completos!
                  </p>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    Upgrade para Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
