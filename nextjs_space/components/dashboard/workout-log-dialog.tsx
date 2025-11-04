'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface Workout {
  id: number;
  title: string;
  description: string;
  distance: number | null;
  duration: number | null;
  targetPace: string | null;
}

interface WorkoutLogDialogProps {
  workout: Workout | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkoutLogDialog({ workout, open, onClose, onSuccess }: WorkoutLogDialogProps) {
  const t = useTranslations('dashboard.workoutLog');
  const tCommon = useTranslations('common');
  const [submitting, setSubmitting] = useState(false);
  const [feeling, setFeeling] = useState<string>('good');
  const [perceivedEffort, setPerceivedEffort] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(true);

  const handleSubmit = async () => {
    if (!workout) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/workouts/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: workout.id,
          completed,
          feeling,
          perceivedEffort,
          notes,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao salvar relato do treino.');
      }
    } catch (error) {
      console.error('Error submitting workout log:', error);
      alert('Erro ao salvar relato do treino.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!workout) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{workout.title}</h4>
            <p className="text-sm text-gray-600">{workout.description}</p>
            <div className="flex gap-4 mt-2 text-sm">
              {workout.distance && <span>📍 {workout.distance} km</span>}
              {workout.duration && <span>⏱️ {workout.duration} min</span>}
              {workout.targetPace && <span>🎯 {workout.targetPace}</span>}
            </div>
          </div>

          {/* Completed? */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              {t('completed')}
            </Label>
            <RadioGroup value={completed ? 'yes' : 'no'} onValueChange={(val) => setCompleted(val === 'yes')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="completed-yes" />
                <Label htmlFor="completed-yes" className="cursor-pointer">{t('completedYes')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="completed-no" />
                <Label htmlFor="completed-no" className="cursor-pointer">{t('completedNo')}</Label>
              </div>
            </RadioGroup>
          </div>

          {completed && (
            <>
              {/* Feeling */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {t('feeling')}
                </Label>
                <RadioGroup value={feeling} onValueChange={setFeeling}>
                  {['excellent', 'good', 'ok', 'tired', 'bad'].map((f) => (
                    <div key={f} className="flex items-center space-x-2">
                      <RadioGroupItem value={f} id={`feeling-${f}`} />
                      <Label htmlFor={`feeling-${f}`} className="cursor-pointer">
                        {t(`feelings.${f}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Effort */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  {t('effort')}
                </Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={perceivedEffort}
                    onChange={(e) => setPerceivedEffort(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t('effortEasy')}</span>
                    <span className="font-semibold text-lg text-orange-600">{perceivedEffort}</span>
                    <span>{t('effortMax')}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
              {t('notes')}
            </Label>
            <Textarea
              id="notes"
              placeholder={t('notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {t('notesHelp')}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </Button>
            <Button onClick={onClose} variant="outline" disabled={submitting}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
