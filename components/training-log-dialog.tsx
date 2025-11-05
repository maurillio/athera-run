
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingLogDialogProps {
  onSuccess?: () => void;
}

export default function TrainingLogDialog({ onSuccess }: TrainingLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    workoutCompleted: true,
    overallFeeling: 'good',
    energyLevel: 7,
    sleepQuality: 7,
    stressLevel: 5,
    motivationLevel: 7,
    trainingDifficulty: 'perfect',
    perceivedEffort: 7,
    hasPain: false,
    painDescription: '',
    painIntensity: 0,
    hasInjury: false,
    injuryDescription: '',
    hasIllness: false,
    illnessDescription: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/training-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erro ao salvar relato');

      const { log } = await response.json();

      toast.success('Relato salvo com sucesso!');

      // Analisar com IA automaticamente
      setAnalyzing(true);
      try {
        const analyzeResponse = await fetch('/api/training-log/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId: log.id })
        });

        if (analyzeResponse.ok) {
          const { requiresAttention } = await analyzeResponse.json();
          if (requiresAttention) {
            toast.warning('Análise IA detectou pontos de atenção. Verifique suas recomendações.', {
              icon: <Sparkles className="h-5 w-5 text-yellow-500" />
            });
          } else {
            toast.success('Análise IA concluída!', {
              icon: <Sparkles className="h-5 w-5 text-green-500" />
            });
          }
        }
      } catch (error) {
        console.error('Error analyzing:', error);
      } finally {
        setAnalyzing(false);
      }

      setOpen(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar relato');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      workoutCompleted: true,
      overallFeeling: 'good',
      energyLevel: 7,
      sleepQuality: 7,
      stressLevel: 5,
      motivationLevel: 7,
      trainingDifficulty: 'perfect',
      perceivedEffort: 7,
      hasPain: false,
      painDescription: '',
      painIntensity: 0,
      hasInjury: false,
      injuryDescription: '',
      hasIllness: false,
      illnessDescription: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <BookOpen className="mr-2 h-4 w-4" />
          Adicionar Relato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Relato Diário</DialogTitle>
          <DialogDescription>
            Como você está se sentindo hoje? Compartilhe seu feedback sobre o treino.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <input
              id="date"
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Treino Completado */}
          <div className="flex items-center justify-between">
            <Label htmlFor="completed">Conseguiu completar o treino de hoje?</Label>
            <Switch
              id="completed"
              checked={formData.workoutCompleted}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, workoutCompleted: checked }))}
            />
          </div>

          {/* Sensação Geral */}
          <div className="space-y-2">
            <Label>Como você se sentiu hoje?</Label>
            <Select
              value={formData.overallFeeling}
              onValueChange={(value) => setFormData(prev => ({ ...prev, overallFeeling: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">😄 Excelente</SelectItem>
                <SelectItem value="good">🙂 Bem</SelectItem>
                <SelectItem value="ok">😐 Ok</SelectItem>
                <SelectItem value="tired">😴 Cansado</SelectItem>
                <SelectItem value="bad">😔 Mal</SelectItem>
                <SelectItem value="exhausted">😫 Exausto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Métricas com Sliders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Energia: {formData.energyLevel}/10</Label>
              <Slider
                value={[formData.energyLevel]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, energyLevel: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Qualidade do Sono: {formData.sleepQuality}/10</Label>
              <Slider
                value={[formData.sleepQuality]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, sleepQuality: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Nível de Estresse: {formData.stressLevel}/10</Label>
              <Slider
                value={[formData.stressLevel]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, stressLevel: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Motivação: {formData.motivationLevel}/10</Label>
              <Slider
                value={[formData.motivationLevel]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, motivationLevel: value }))}
                min={1}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Dificuldade do Treino */}
          {formData.workoutCompleted && (
            <>
              <div className="space-y-2">
                <Label>Dificuldade do Treino</Label>
                <Select
                  value={formData.trainingDifficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trainingDifficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="too_easy">Muito Fácil</SelectItem>
                    <SelectItem value="perfect">Perfeito</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                    <SelectItem value="too_hard">Muito Difícil</SelectItem>
                    <SelectItem value="impossible">Impossível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Esforço Percebido: {formData.perceivedEffort}/10</Label>
                <Slider
                  value={[formData.perceivedEffort]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, perceivedEffort: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            </>
          )}

          {/* Dor */}
          <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasPain">Sentiu alguma dor?</Label>
              <Switch
                id="hasPain"
                checked={formData.hasPain}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasPain: checked }))}
              />
            </div>

            {formData.hasPain && (
              <>
                <div className="space-y-2">
                  <Label>Intensidade da Dor: {formData.painIntensity}/10</Label>
                  <Slider
                    value={[formData.painIntensity]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, painIntensity: value }))}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descreva a dor (localização, tipo)</Label>
                  <Textarea
                    value={formData.painDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, painDescription: e.target.value }))}
                    placeholder="Ex: Dor leve no joelho direito ao subir escadas..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          {/* Lesão */}
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasInjury">Teve alguma lesão?</Label>
              <Switch
                id="hasInjury"
                checked={formData.hasInjury}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasInjury: checked }))}
              />
            </div>

            {formData.hasInjury && (
              <div className="space-y-2">
                <Label>Descreva a lesão</Label>
                <Textarea
                  value={formData.injuryDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, injuryDescription: e.target.value }))}
                  placeholder="Ex: Torci o tornozelo durante a corrida..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Doença */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="hasIllness">Está doente ou indisposto?</Label>
              <Switch
                id="hasIllness"
                checked={formData.hasIllness}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasIllness: checked }))}
              />
            </div>

            {formData.hasIllness && (
              <div className="space-y-2">
                <Label>Descreva os sintomas</Label>
                <Textarea
                  value={formData.illnessDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, illnessDescription: e.target.value }))}
                  placeholder="Ex: Gripe, febre de 38°C..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Notas Gerais */}
          <div className="space-y-2">
            <Label>Notas Adicionais</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Qualquer outra observação sobre o dia..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || analyzing}>
              {loading || analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {analyzing ? 'Analisando...' : 'Salvando...'}
                </>
              ) : (
                'Salvar Relato'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
