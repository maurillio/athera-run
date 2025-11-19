
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Target, RefreshCw, Loader2, Info, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/lib/i18n/hooks';

interface Race {
  id: number;
  raceName: string;
  distance: string;
  raceDate: string;
  targetTime?: string;
  priority: 'A' | 'B' | 'C';
  trainingSuggest?: string;
  weeksBeforeA: number | null;
  status: string;
}

interface RaceManagementProps {
  races: Race[];
  onRacesUpdated: () => void;
}

export default function RaceManagement({ races, onRacesUpdated }: RaceManagementProps) {
  const t = useTranslations('raceManagement');
  const [isAddingRace, setIsAddingRace] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRaceId, setEditingRaceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    raceName: '',
    distance: '10k',
    raceDate: '',
    targetTime: '',
    location: '',
    priority: 'B' as 'A' | 'B' | 'C'
  });

  const handleAddRace = async () => {
    setIsAddingRace(true);
    try {
      const response = await fetch('/api/race-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddDialog(false);
        setFormData({
          raceName: '',
          distance: '10k',
          raceDate: '',
          targetTime: '',
          location: '',
          priority: 'B'
        });
        
        // Classificar automaticamente
        await handleClassifyRaces();
        onRacesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || t('addError'));
      }
    } catch (error) {
      console.error('Error adding race:', error);
      alert(t('addError'));
    } finally {
      setIsAddingRace(false);
    }
  };

  const handleClassifyRaces = async () => {
    setIsClassifying(true);
    try {
      const response = await fetch('/api/race-goals/classify', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Corridas classificadas:', data);
        onRacesUpdated();
      }
    } catch (error) {
      console.error('Error classifying races:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleDeleteRace = async (raceId: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const response = await fetch(`/api/race-goals/${raceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onRacesUpdated();
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting race:', error);
      alert(t('deleteError'));
    }
  };

  const handleEditRace = (race: Race) => {
    setEditingRaceId(race.id);
    setFormData({
      raceName: race.raceName,
      distance: race.distance,
      raceDate: race.raceDate.split('T')[0], // Converter para formato YYYY-MM-DD
      targetTime: race.targetTime || '',
      location: '',
      priority: race.priority
    });
    setShowEditDialog(true);
  };

  const handleUpdateRace = async () => {
    if (!editingRaceId) return;

    setIsAddingRace(true);
    try {
      const response = await fetch(`/api/race-goals/${editingRaceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowEditDialog(false);
        setEditingRaceId(null);
        setFormData({
          raceName: '',
          distance: '10k',
          raceDate: '',
          targetTime: '',
          location: '',
          priority: 'B'
        });

        // Classificar automaticamente após editar
        await handleClassifyRaces();
        onRacesUpdated();
      } else {
        const error = await response.json();
        alert(error.error || t('updateError'));
      }
    } catch (error) {
      console.error('Error updating race:', error);
      alert(t('updateError'));
    } finally {
      setIsAddingRace(false);
    }
  };

  const getPriorityColor = (priority: 'A' | 'B' | 'C') => {
    const colors = {
      'A': 'bg-red-600 text-white hover:bg-red-700',
      'B': 'bg-amber-500 text-white hover:bg-amber-600',
      'C': 'bg-blue-600 text-white hover:bg-blue-700'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: 'A' | 'B' | 'C') => {
    return t(`priorities.${priority}` as any);
  };

  return (
    <Card className="border-slate-200 shadow-elevation-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-5 w-5 text-brand-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {t('description')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClassifyRaces}
              disabled={isClassifying || races.length === 0}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('classifying')}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('reclassify')}
                </>
              )}
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addRace')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('addRaceTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('addRaceDesc')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="raceName">{t('raceName')}</Label>
                    <Input
                      id="raceName"
                      value={formData.raceName}
                      onChange={(e) => setFormData({...formData, raceName: e.target.value})}
                      placeholder={t('raceNamePlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distance">{t('distance')}</Label>
                      <Select
                        value={formData.distance}
                        onValueChange={(value) => setFormData({...formData, distance: value})}
                      >
                        <SelectTrigger id="distance">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k">{t('distances.5k')}</SelectItem>
                          <SelectItem value="10k">{t('distances.10k')}</SelectItem>
                          <SelectItem value="15k">{t('distances.15k')}</SelectItem>
                          <SelectItem value="10mile">{t('distances.10mile')}</SelectItem>
                          <SelectItem value="half_marathon">{t('distances.half_marathon')}</SelectItem>
                          <SelectItem value="30k">{t('distances.30k')}</SelectItem>
                          <SelectItem value="marathon">{t('distances.marathon')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="raceDate">{t('raceDate')}</Label>
                      <Input
                        id="raceDate"
                        type="date"
                        value={formData.raceDate}
                        onChange={(e) => setFormData({...formData, raceDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetTime">{t('targetTime')}</Label>
                      <Input
                        id="targetTime"
                        value={formData.targetTime}
                        onChange={(e) => setFormData({...formData, targetTime: e.target.value})}
                        placeholder={t('targetTimePlaceholder')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">{t('location')}</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder={t('locationPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">{t('classification')}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'A' | 'B' | 'C') => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">
                          <span className="font-semibold">{t('priorityOptions.A.label')}</span> - {t('priorityOptions.A.description')}
                        </SelectItem>
                        <SelectItem value="B">
                          <span className="font-semibold">{t('priorityOptions.B.label')}</span> - {t('priorityOptions.B.description')}
                        </SelectItem>
                        <SelectItem value="C">
                          <span className="font-semibold">{t('priorityOptions.C.label')}</span> - {t('priorityOptions.C.description')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>{t('autoClassification.title')}</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>{t('priorityOptions.A.label')}</strong> {t('autoClassification.raceA')}</li>
                        <li><strong>{t('priorityOptions.B.label')}</strong> {t('autoClassification.raceB')}</li>
                        <li><strong>{t('priorityOptions.C.label')}</strong> {t('autoClassification.raceC')}</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddRace}
                      disabled={isAddingRace || !formData.raceName || !formData.raceDate}
                      className="flex-1"
                    >
                      {isAddingRace ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('adding')}
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          {t('addRaceButton')}
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setShowAddDialog(false)} variant="outline">
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('editRaceTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('editRaceDesc')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editRaceName">{t('raceName')}</Label>
                    <Input
                      id="editRaceName"
                      value={formData.raceName}
                      onChange={(e) => setFormData({...formData, raceName: e.target.value})}
                      placeholder={t('raceNamePlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editDistance">{t('distance')}</Label>
                      <Select
                        value={formData.distance}
                        onValueChange={(value) => setFormData({...formData, distance: value})}
                      >
                        <SelectTrigger id="editDistance">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k">{t('distances.5k')}</SelectItem>
                          <SelectItem value="10k">{t('distances.10k')}</SelectItem>
                          <SelectItem value="15k">{t('distances.15k')}</SelectItem>
                          <SelectItem value="10mile">{t('distances.10mile')}</SelectItem>
                          <SelectItem value="half_marathon">{t('distances.half_marathon')}</SelectItem>
                          <SelectItem value="30k">{t('distances.30k')}</SelectItem>
                          <SelectItem value="marathon">{t('distances.marathon')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editRaceDate">{t('raceDate')}</Label>
                      <Input
                        id="editRaceDate"
                        type="date"
                        value={formData.raceDate}
                        onChange={(e) => setFormData({...formData, raceDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editTargetTime">{t('targetTime')}</Label>
                      <Input
                        id="editTargetTime"
                        value={formData.targetTime}
                        onChange={(e) => setFormData({...formData, targetTime: e.target.value})}
                        placeholder={t('targetTimePlaceholder')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editLocation">{t('location')}</Label>
                      <Input
                        id="editLocation"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder={t('locationPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editPriority">{t('classification')}</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'A' | 'B' | 'C') => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger id="editPriority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">
                          <span className="font-semibold">{t('priorityOptions.A.label')}</span> - {t('priorityOptions.A.description')}
                        </SelectItem>
                        <SelectItem value="B">
                          <span className="font-semibold">{t('priorityOptions.B.label')}</span> - {t('priorityOptions.B.description')}
                        </SelectItem>
                        <SelectItem value="C">
                          <span className="font-semibold">{t('priorityOptions.C.label')}</span> - {t('priorityOptions.C.description')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdateRace}
                      disabled={isAddingRace || !formData.raceName || !formData.raceDate}
                      className="flex-1"
                    >
                      {isAddingRace ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('updating')}
                        </>
                      ) : (
                        <>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('updateRaceButton')}
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setShowEditDialog(false)} variant="outline">
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {races.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noRaces')}</p>
            <p className="text-sm mt-2">{t('noRacesDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {races.map(race => (
              <div
                key={race.id}
                className="p-4 border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(race.priority)}>
                      {race.priority}
                    </Badge>
                    <span className="font-semibold">{race.raceName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(race.raceDate).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRace(race)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title={t('editTooltip')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRace(race.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title={t('deleteTooltip')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 text-sm mb-2 text-slate-700">
                  <span className="flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-brand-primary" />
                    {race.distance}
                  </span>
                  {race.targetTime && (
                    <span className="flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-emerald-600" />
                      {t('goal')}: {race.targetTime}
                    </span>
                  )}
                  {race.weeksBeforeA !== null && race.priority !== 'A' && (
                    <span className="text-slate-500">
                      • {t('weeksBeforeA', { weeks: race.weeksBeforeA })}
                    </span>
                  )}
                </div>

                {race.trainingSuggest && (
                  <div className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-200">
                    <Info className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{race.trainingSuggest}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
