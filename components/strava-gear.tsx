'use client';

/**
 * Strava Gear Component
 * Exibe equipamentos (tênis, bikes) do atleta
 * PREMIUM ONLY
 */

import { useState, useEffect } from 'react';
import { Shirt, Bike, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Gear {
  id: number;
  gearId: string;
  name: string;
  brand?: string;
  model?: string;
  type: 'shoe' | 'bike';
  primary: boolean;
  distance: number;
  activityCount: number;
  lastUsedAt?: string;
}

export function StravaGearCard() {
  const [gear, setGear] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadGear();
  }, []);

  const loadGear = async () => {
    try {
      const res = await fetch('/api/strava/gear');
      if (res.ok) {
        const data = await res.json();
        setGear(data.gear || []);
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGear = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/strava/gear', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGear(data.gear || []);
      }
    } catch (error) {
      console.error('Erro ao sincronizar equipamentos:', error);
    } finally {
      setSyncing(false);
    }
  };

  const shoes = gear.filter(g => g.type === 'shoe');
  const bikes = gear.filter(g => g.type === 'bike');

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-neutral-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-neutral-800 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  const GearList = ({ items, type }: { items: Gear[], type: 'shoe' | 'bike' }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-400">
          <p>Nenhum equipamento encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <Card
            key={item.gearId}
            className="p-4 border-neutral-800 bg-neutral-900 hover:border-orange-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {item.primary && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <h4 className="font-semibold">{item.name}</h4>
                </div>
                
                {(item.brand || item.model) && (
                  <div className="text-sm text-neutral-400 mb-2">
                    {item.brand} {item.model}
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Distância: </span>
                    <span className="font-semibold">{item.distance.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-neutral-400">Uso: </span>
                    <span className="font-semibold">{item.activityCount}x</span>
                  </div>
                </div>

                {item.lastUsedAt && (
                  <div className="text-xs text-neutral-500 mt-2">
                    Último uso: {new Date(item.lastUsedAt).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              <div className="ml-4">
                {type === 'shoe' ? (
                  <Shirt className="w-6 h-6 text-orange-500" />
                ) : (
                  <Bike className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>

            {/* Barra de progresso de desgaste (estimado para tênis) */}
            {type === 'shoe' && item.distance > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-400">Desgaste estimado</span>
                  <span className="text-neutral-400">
                    {Math.min(100, Math.round((item.distance / 800) * 100))}%
                  </span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.distance > 800
                        ? 'bg-red-500'
                        : item.distance > 600
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (item.distance / 800) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  {item.distance > 800
                    ? '⚠️ Considere trocar o tênis'
                    : item.distance > 600
                    ? '⚠️ Próximo da vida útil'
                    : '✓ Em bom estado'}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  if (gear.length === 0) {
    return (
      <Card className="p-6 border-neutral-800 bg-neutral-900">
        <div className="text-center py-8">
          <Shirt className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
          <h3 className="text-lg font-semibold mb-2">Nenhum equipamento encontrado</h3>
          <p className="text-sm text-neutral-400 mb-4">
            Sincronize seus dados para ver seus tênis e equipamentos
          </p>
          <Button
            onClick={syncGear}
            disabled={syncing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Equipamentos'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shirt className="w-5 h-5 text-orange-500" />
          Equipamentos
        </h2>
        <Button
          onClick={syncGear}
          disabled={syncing}
          size="sm"
          variant="outline"
          className="border-neutral-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shoes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
          <TabsTrigger value="shoes" className="data-[state=active]:bg-orange-600">
            <Shirt className="w-4 h-4 mr-2" />
            Tênis ({shoes.length})
          </TabsTrigger>
          <TabsTrigger value="bikes" className="data-[state=active]:bg-blue-600">
            <Bike className="w-4 h-4 mr-2" />
            Bikes ({bikes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shoes" className="mt-4">
          <GearList items={shoes} type="shoe" />
        </TabsContent>

        <TabsContent value="bikes" className="mt-4">
          <GearList items={bikes} type="bike" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
