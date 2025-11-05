
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Activity } from 'lucide-react';

interface WorkoutLogFormProps {
  athleteId: number;
  onSuccess?: () => void;
}

export default function WorkoutLogFormImproved({ athleteId, onSuccess }: WorkoutLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'running',
    subtype: 'easy',
    distance: '',
    duration: '',
    avgHeartRate: '',
    perceivedEffort: '5',
    feeling: 'ok',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          athleteId,
          date: formData.date,
          type: formData.type,
          subtype: formData.subtype,
          distance: formData.distance ? parseFloat(formData.distance) : null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          avgHeartRate: formData.avgHeartRate ? parseInt(formData.avgHeartRate) : null,
          perceivedEffort: parseInt(formData.perceivedEffort),
          feeling: formData.feeling,
          notes: formData.notes || null
        }),
      });

      if (response.ok) {
        toast.success('Treino registrado com sucesso! 🎉', {
          description: 'Seu treino foi salvo e está disponível no histórico.',
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        });
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'running',
          subtype: 'easy',
          distance: '',
          duration: '',
          avgHeartRate: '',
          perceivedEffort: '5',
          feeling: 'ok',
          notes: ''
        });

        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        toast.error('Erro ao registrar treino', {
          description: error.error || 'Tente novamente mais tarde',
        });
      }
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Erro ao registrar treino', {
        description: 'Verifique sua conexão e tente novamente',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Registrar Treino
        </CardTitle>
        <CardDescription>
          Preencha os dados do seu treino para manter seu histórico atualizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data do Treino</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          {/* Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Treino</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Corrida</SelectItem>
                  <SelectItem value="strength">Musculação</SelectItem>
                  <SelectItem value="swimming">Natação</SelectItem>
                  <SelectItem value="cross_training">Treino Cruzado</SelectItem>
                  <SelectItem value="rest">Descanso Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'running' && (
              <div className="space-y-2">
                <Label htmlFor="subtype">Subtipo</Label>
                <Select 
                  value={formData.subtype || 'easy'} 
                  onValueChange={(value) => handleChange('subtype', value)}
                >
                  <SelectTrigger id="subtype">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil (Z2)</SelectItem>
                    <SelectItem value="tempo">Tempo</SelectItem>
                    <SelectItem value="intervals">Intervalado</SelectItem>
                    <SelectItem value="long">Longão</SelectItem>
                    <SelectItem value="recovery">Recuperação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Métricas */}
          {formData.type === 'running' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance">Distância (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder="10.5"
                  value={formData.distance}
                  onChange={(e) => handleChange('distance', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* FC e Esforço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgHeartRate">FC Média (bpm)</Label>
              <Input
                id="avgHeartRate"
                type="number"
                placeholder="150"
                value={formData.avgHeartRate}
                onChange={(e) => handleChange('avgHeartRate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perceivedEffort">Esforço Percebido (1-10)</Label>
              <Select 
                value={formData.perceivedEffort} 
                onValueChange={(value) => handleChange('perceivedEffort', value)}
              >
                <SelectTrigger id="perceivedEffort">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feeling */}
          <div className="space-y-2">
            <Label htmlFor="feeling">Como se sentiu?</Label>
            <Select 
              value={formData.feeling} 
              onValueChange={(value) => handleChange('feeling', value)}
            >
              <SelectTrigger id="feeling">
                <SelectValue placeholder="ok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">Excelente 🔥</SelectItem>
                <SelectItem value="good">Bem 👍</SelectItem>
                <SelectItem value="ok">Normal 😐</SelectItem>
                <SelectItem value="tired">Cansado 😴</SelectItem>
                <SelectItem value="bad">Ruim 😰</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como foi o treino? Algum desconforto? Percepções..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Registrar Treino
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
