
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { toISODate } from '@/lib/utils/date-helpers';

interface Workout { // Define Workout interface here for reusability
  id: number;
  date: string;
  type: string;
  subtype: string | null;
  distance: number | null;
  duration: number | null;
  pace: string | null;
  avgHeartRate: number | null;
  perceivedEffort: number | null;
  feeling: string | null;
  notes: string | null;
  source: string; // Added source property
}

interface WorkoutLogFormProps {
  athleteId: number;
  initialWorkout?: Workout; // Optional workout data for editing
  onWorkoutSaved: () => void; // Callback after saving
}

export default function WorkoutLogForm({ athleteId, initialWorkout, onWorkoutSaved }: WorkoutLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [clientDate, setClientDate] = useState('');
  const isStravaWorkout = initialWorkout?.source === 'strava';
  
  // Set date only on client to avoid hydration mismatch
  useEffect(() => {
    if (!initialWorkout?.date) {
      const today = new Date().toISOString().split('T')[0];
      setClientDate(today);
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [initialWorkout?.date]);
  
  const [formData, setFormData] = useState({
    date: initialWorkout?.date ? toISODate(initialWorkout.date) : '',
    type: initialWorkout?.type || 'running',
    subtype: initialWorkout?.subtype || 'easy',
    distance: initialWorkout?.distance?.toString() || '',
    duration: initialWorkout?.duration?.toString() || '',
    avgHeartRate: initialWorkout?.avgHeartRate?.toString() || '',
    perceivedEffort: initialWorkout?.perceivedEffort?.toString() || '5',
    feeling: initialWorkout?.feeling || 'good',
    notes: initialWorkout?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = initialWorkout ? 'PUT' : 'POST';
    const url = initialWorkout ? `/api/workouts/${initialWorkout.id}` : '/api/workouts/log';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteId,
          ...formData,
          distance: formData.distance ? parseFloat(formData.distance) : null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          avgHeartRate: formData.avgHeartRate ? parseInt(formData.avgHeartRate) : null,
          perceivedEffort: parseInt(formData.perceivedEffort)
        })
      });

      if (!response.ok) throw new Error(`Erro ao ${initialWorkout ? 'atualizar' : 'registrar'} treino`);

      toast.success(`Treino ${initialWorkout ? 'atualizado' : 'registrado'} com sucesso!`);

      // Clear form only if creating a new workout
      if (!initialWorkout) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: 'running',
          subtype: 'easy',
          distance: '',
          duration: '',
          avgHeartRate: '',
          perceivedEffort: '5',
          feeling: 'good',
          notes: ''
        });
      }
      onWorkoutSaved(); // Call callback instead of reloading
    } catch (error) {
      toast.error(`Erro ao ${initialWorkout ? 'atualizar' : 'registrar'} treino`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data */}
        <div>
          <Label htmlFor="date">Data do Treino</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isStravaWorkout} // Added disabled prop
          />
        </div>

        {/* Tipo */}
        <div>
          <Label htmlFor="type">Tipo de Treino</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
            disabled={isStravaWorkout} // Added disabled prop
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="running">Corrida</SelectItem>
              <SelectItem value="strength">Musculação</SelectItem>
              <SelectItem value="swimming">Natação</SelectItem>
              <SelectItem value="rest">Descanso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subtipo (apenas para corrida) */}
        {formData.type === 'running' && (
          <div>
            <Label htmlFor="subtype">Tipo de Corrida</Label>
            <Select
              value={formData.subtype}
              onValueChange={(value) => setFormData({ ...formData, subtype: value })}
              disabled={isStravaWorkout} // Added disabled prop
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Regenerativo</SelectItem>
                <SelectItem value="long">Longão</SelectItem>
                <SelectItem value="tempo">Tempo Run</SelectItem>
                <SelectItem value="intervals">Intervalado</SelectItem>
                <SelectItem value="fartlek">Fartlek</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Distância */}
        {formData.type === 'running' && (
          <div>
            <Label htmlFor="distance">Distância (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="0.1"
                        placeholder="10.5"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        disabled={isStravaWorkout} // Added disabled prop
                      />          </div>
        )}

        {/* Duração */}
        <div>
          <Label htmlFor="duration">Duração (minutos)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="60"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            disabled={isStravaWorkout} // Added disabled prop
          />
        </div>

        {/* Frequência Cardíaca Média */}
        {formData.type === 'running' && (
          <div>
            <Label htmlFor="avgHeartRate">FC Média (bpm)</Label>
                      <Input
                        id="avgHeartRate"
                        type="number"
                        placeholder="150"
                        value={formData.avgHeartRate}
                        onChange={(e) => setFormData({ ...formData, avgHeartRate: e.target.value })}
                        disabled={isStravaWorkout} // Added disabled prop
                      />          </div>
        )}

        {/* Esforço Percebido */}
        <div>
          <Label htmlFor="perceivedEffort">Esforço Percebido (1-10)</Label>
          <Select
            value={formData.perceivedEffort}
            onValueChange={(value) => setFormData({ ...formData, perceivedEffort: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} - {num <= 3 ? 'Muito Fácil' : num <= 5 ? 'Fácil' : num <= 7 ? 'Moderado' : num <= 9 ? 'Difícil' : 'Máximo'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Como se sentiu */}
        <div>
          <Label htmlFor="feeling">Como se sentiu?</Label>
          <Select
            value={formData.feeling}
            onValueChange={(value) => setFormData({ ...formData, feeling: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="great">😄 Ótimo</SelectItem>
              <SelectItem value="good">🙂 Bem</SelectItem>
              <SelectItem value="ok">😐 OK</SelectItem>
              <SelectItem value="tired">😓 Cansado</SelectItem>
              <SelectItem value="bad">😞 Ruim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notas */}
      <div>
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Ex: Sentiu dor? Como estava o clima? Alguma observação importante..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Botão Submit */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          initialWorkout ? 'Salvar Alterações' : 'Registrar Treino'
        )}
      </Button>
    </form>
  );
}
