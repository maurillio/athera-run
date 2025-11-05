
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
        alert(error.error || 'Erro ao adicionar corrida');
      }
    } catch (error) {
      console.error('Error adding race:', error);
      alert('Erro ao adicionar corrida');
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
    if (!confirm('Tem certeza que deseja excluir esta corrida?')) return;

    try {
      const response = await fetch(`/api/race-goals/${raceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onRacesUpdated();
      } else {
        alert('Erro ao excluir corrida');
      }
    } catch (error) {
      console.error('Error deleting race:', error);
      alert('Erro ao excluir corrida');
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
        alert(error.error || 'Erro ao atualizar corrida');
      }
    } catch (error) {
      console.error('Error updating race:', error);
      alert('Erro ao atualizar corrida');
    } finally {
      setIsAddingRace(false);
    }
  };

  const getPriorityColor = (priority: 'A' | 'B' | 'C') => {
    const colors = {
      'A': 'bg-red-500 text-white',
      'B': 'bg-yellow-500 text-black',
      'C': 'bg-blue-500 text-white'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: 'A' | 'B' | 'C') => {
    const labels = {
      'A': 'Objetivo Principal',
      'B': 'Preparatória',
      'C': 'Volume'
    };
    return labels[priority];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Gestão de Corridas
            </CardTitle>
            <CardDescription>
              Adicione e gerencie suas corridas. O sistema classifica automaticamente em A, B ou C.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClassifyRaces}
              disabled={isClassifying || races.length === 0}
              variant="outline"
              size="sm"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-classificar
                </>
              )}
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Corrida
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Corrida</DialogTitle>
                  <DialogDescription>
                    Adicione uma corrida e o sistema classificará automaticamente como A, B ou C
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="raceName">Nome da Corrida *</Label>
                    <Input
                      id="raceName"
                      value={formData.raceName}
                      onChange={(e) => setFormData({...formData, raceName: e.target.value})}
                      placeholder="Ex: Maratona de São Paulo 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distance">Distância *</Label>
                      <Select 
                        value={formData.distance} 
                        onValueChange={(value) => setFormData({...formData, distance: value})}
                      >
                        <SelectTrigger id="distance">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k">5km</SelectItem>
                          <SelectItem value="10k">10km</SelectItem>
                          <SelectItem value="15k">15km</SelectItem>
                          <SelectItem value="10mile">10 Milhas</SelectItem>
                          <SelectItem value="half_marathon">Meia-Maratona</SelectItem>
                          <SelectItem value="30k">30km</SelectItem>
                          <SelectItem value="marathon">Maratona</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="raceDate">Data da Corrida *</Label>
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
                      <Label htmlFor="targetTime">Tempo Alvo (opcional)</Label>
                      <Input
                        id="targetTime"
                        value={formData.targetTime}
                        onChange={(e) => setFormData({...formData, targetTime: e.target.value})}
                        placeholder="Ex: 3:30:00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Local (opcional)</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Ex: São Paulo, SP"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Classificação da Corrida *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'A' | 'B' | 'C') => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">
                          <span className="font-semibold">Corrida A</span> - Objetivo Principal
                        </SelectItem>
                        <SelectItem value="B">
                          <span className="font-semibold">Corrida B</span> - Preparatória/Teste
                        </SelectItem>
                        <SelectItem value="C">
                          <span className="font-semibold">Corrida C</span> - Volume/Experiência
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Sistema de Classificação Automática:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Corrida A:</strong> Seu objetivo principal - todo o plano é estruturado para esta corrida</li>
                        <li><strong>Corrida B:</strong> Preparatórias (2-6 semanas antes da A) - use como teste de ritmo</li>
                        <li><strong>Corrida C:</strong> Volume/experiência - substitui treino longo, sem taper</li>
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
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Corrida
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setShowAddDialog(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dialog de Edição */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Corrida</DialogTitle>
                  <DialogDescription>
                    Altere os dados da corrida e o sistema reclassificará automaticamente
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editRaceName">Nome da Corrida *</Label>
                    <Input
                      id="editRaceName"
                      value={formData.raceName}
                      onChange={(e) => setFormData({...formData, raceName: e.target.value})}
                      placeholder="Ex: Maratona de São Paulo 2026"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editDistance">Distância *</Label>
                      <Select
                        value={formData.distance}
                        onValueChange={(value) => setFormData({...formData, distance: value})}
                      >
                        <SelectTrigger id="editDistance">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5k">5km</SelectItem>
                          <SelectItem value="10k">10km</SelectItem>
                          <SelectItem value="15k">15km</SelectItem>
                          <SelectItem value="10mile">10 Milhas</SelectItem>
                          <SelectItem value="half_marathon">Meia-Maratona</SelectItem>
                          <SelectItem value="30k">30km</SelectItem>
                          <SelectItem value="marathon">Maratona</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="editRaceDate">Data da Corrida *</Label>
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
                      <Label htmlFor="editTargetTime">Tempo Alvo (opcional)</Label>
                      <Input
                        id="editTargetTime"
                        value={formData.targetTime}
                        onChange={(e) => setFormData({...formData, targetTime: e.target.value})}
                        placeholder="Ex: 3:30:00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editLocation">Local (opcional)</Label>
                      <Input
                        id="editLocation"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Ex: São Paulo, SP"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editPriority">Classificação da Corrida *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'A' | 'B' | 'C') => setFormData({...formData, priority: value})}
                    >
                      <SelectTrigger id="editPriority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">
                          <span className="font-semibold">Corrida A</span> - Objetivo Principal
                        </SelectItem>
                        <SelectItem value="B">
                          <span className="font-semibold">Corrida B</span> - Preparatória/Teste
                        </SelectItem>
                        <SelectItem value="C">
                          <span className="font-semibold">Corrida C</span> - Volume/Experiência
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
                          Atualizando...
                        </>
                      ) : (
                        <>
                          <Pencil className="mr-2 h-4 w-4" />
                          Atualizar Corrida
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setShowEditDialog(false)} variant="outline">
                      Cancelar
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
            <p>Nenhuma corrida cadastrada ainda.</p>
            <p className="text-sm mt-2">Adicione suas corridas para começar!</p>
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
                      title="Editar corrida"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRace(race.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir corrida"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 text-sm mb-2">
                  <span>📍 {race.distance}</span>
                  {race.targetTime && <span>🎯 Meta: {race.targetTime}</span>}
                  {race.weeksBeforeA !== null && race.priority !== 'A' && (
                    <span className="text-muted-foreground">
                      • {race.weeksBeforeA} semanas antes da corrida A
                    </span>
                  )}
                </div>

                {race.trainingSuggest && (
                  <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                    💡 {race.trainingSuggest}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
