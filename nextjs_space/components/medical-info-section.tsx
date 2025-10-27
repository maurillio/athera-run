
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, Plus, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Injury {
  type: string;
  location: string;
  date: string;
  status: 'recovered' | 'recovering' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export default function MedicalInfoSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    injuries: [] as Injury[],
    medicalConditions: '',
    medications: '',
    physicalRestrictions: '',
    weeklyAvailability: 5
  });

  const [newInjury, setNewInjury] = useState({
    type: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: 'recovering' as const,
    severity: 'moderate' as const,
    notes: ''
  });

  const [showAddInjury, setShowAddInjury] = useState(false);

  useEffect(() => {
    fetchMedicalInfo();
  }, []);

  const fetchMedicalInfo = async () => {
    try {
      const response = await fetch('/api/profile/medical');
      if (response.ok) {
        const { medical } = await response.json();
        setData({
          injuries: medical.injuries || [],
          medicalConditions: medical.medicalConditions || '',
          medications: medical.medications || '',
          physicalRestrictions: medical.physicalRestrictions || '',
          weeklyAvailability: medical.weeklyAvailability || 5
        });
      }
    } catch (error) {
      console.error('Error fetching medical info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/medical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Informações médicas atualizadas!');
      } else {
        toast.error('Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddInjury = () => {
    if (!newInjury.type || !newInjury.location) {
      toast.error('Preencha tipo e localização da lesão');
      return;
    }

    setData(prev => ({
      ...prev,
      injuries: [...prev.injuries, newInjury]
    }));

    setNewInjury({
      type: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      status: 'recovering',
      severity: 'moderate',
      notes: ''
    });

    setShowAddInjury(false);
    toast.success('Lesão adicionada. Não esqueça de salvar!');
  };

  const handleRemoveInjury = (index: number) => {
    setData(prev => ({
      ...prev,
      injuries: prev.injuries.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recovered': return 'bg-green-100 text-green-800 border-green-300';
      case 'recovering': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'chronic': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Informações Médicas
        </CardTitle>
        <CardDescription>
          Histórico de lesões e condições que podem afetar seu treinamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Histórico de Lesões */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Histórico de Lesões
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddInjury(!showAddInjury)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Lesão
            </Button>
          </div>

          {showAddInjury && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tipo de Lesão</Label>
                  <Input
                    placeholder="Ex: Tendinite"
                    value={newInjury.type}
                    onChange={(e) => setNewInjury(prev => ({ ...prev, type: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Localização</Label>
                  <Input
                    placeholder="Ex: Joelho direito"
                    value={newInjury.location}
                    onChange={(e) => setNewInjury(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Data</Label>
                  <Input
                    type="date"
                    value={newInjury.date}
                    onChange={(e) => setNewInjury(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Gravidade</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={newInjury.severity}
                    onChange={(e) => setNewInjury(prev => ({ ...prev, severity: e.target.value as any }))}
                  >
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="severe">Grave</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={newInjury.status}
                  onChange={(e) => setNewInjury(prev => ({ ...prev, status: e.target.value as any }))}
                >
                  <option value="recovered">Recuperado</option>
                  <option value="recovering">Em Recuperação</option>
                  <option value="chronic">Crônica</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Notas</Label>
                <Textarea
                  rows={2}
                  placeholder="Detalhes adicionais..."
                  value={newInjury.notes}
                  onChange={(e) => setNewInjury(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddInjury}>Adicionar</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddInjury(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {data.injuries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma lesão registrada
            </p>
          ) : (
            <div className="space-y-2">
              {data.injuries.map((injury, index) => (
                <div key={index} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{injury.type}</h4>
                      <p className="text-xs text-muted-foreground">{injury.location}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveInjury(index)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className={getSeverityColor(injury.severity)}>
                      {injury.severity === 'mild' ? 'Leve' : injury.severity === 'moderate' ? 'Moderada' : 'Grave'}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(injury.status)}>
                      {injury.status === 'recovered' ? 'Recuperado' : injury.status === 'recovering' ? 'Em Recuperação' : 'Crônica'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(injury.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {injury.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{injury.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Condições Médicas */}
        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Condições Médicas</Label>
          <Textarea
            id="medicalConditions"
            rows={3}
            placeholder="Ex: Asma, hipertensão, diabetes..."
            value={data.medicalConditions}
            onChange={(e) => setData(prev => ({ ...prev, medicalConditions: e.target.value }))}
          />
        </div>

        {/* Medicamentos */}
        <div className="space-y-2">
          <Label htmlFor="medications">Medicamentos em Uso</Label>
          <Textarea
            id="medications"
            rows={3}
            placeholder="Ex: Losartana 50mg, etc..."
            value={data.medications}
            onChange={(e) => setData(prev => ({ ...prev, medications: e.target.value }))}
          />
        </div>

        {/* Restrições Físicas */}
        <div className="space-y-2">
          <Label htmlFor="physicalRestrictions">Restrições Físicas</Label>
          <Textarea
            id="physicalRestrictions"
            rows={3}
            placeholder="Ex: Não posso correr em subidas muito íngremes devido ao joelho..."
            value={data.physicalRestrictions}
            onChange={(e) => setData(prev => ({ ...prev, physicalRestrictions: e.target.value }))}
          />
        </div>

        {/* Disponibilidade Semanal */}
        <div className="space-y-2">
          <Label htmlFor="weeklyAvailability">
            Dias Disponíveis por Semana: {data.weeklyAvailability} dia(s)
          </Label>
          <input
            id="weeklyAvailability"
            type="range"
            min="1"
            max="7"
            value={data.weeklyAvailability}
            onChange={(e) => setData(prev => ({ ...prev, weeklyAvailability: parseInt(e.target.value) }))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Quantos dias por semana você consegue treinar?
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Salvar Informações
        </Button>
      </CardContent>
    </Card>
  );
}
