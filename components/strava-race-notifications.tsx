/**
 * STRAVA RACE NOTIFICATIONS COMPONENT - v3.2.0
 * FASE 2: Notificações de provas detectadas
 * 
 * Exibe notificações quando o sistema detecta que uma atividade
 * do Strava parece ser uma prova oficial
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, X, CheckCircle, Info } from 'lucide-react';

interface RaceNotification {
  activityId: string;
  name: string;
  date: string;
  distance: number;
  pace: string | null;
  time: number;
  location: string | null;
  suggestedDistance: string;
  suggestedClassification: 'A' | 'B' | 'C';
}

export function StravaRaceNotifications() {
  const [notifications, setNotifications] = useState<RaceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/strava/race-notifications');
      const data = await response.json();
      
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (activityId: string) => {
    setDismissed([...dismissed, activityId]);
  };

  const handleAddAsRace = async (notification: RaceNotification) => {
    // TODO: Implementar criação de RaceGoal
    console.log('Adicionar como prova:', notification);
    handleDismiss(notification.activityId);
  };

  const formatDistance = (km: number) => {
    return km.toFixed(2) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const visibleNotifications = notifications.filter(
    n => !dismissed.includes(n.activityId)
  );

  if (loading) {
    return null;
  }

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Trophy className="h-4 w-4 text-yellow-600" />
        <span>Provas Detectadas</span>
        <Badge variant="secondary">{visibleNotifications.length}</Badge>
      </div>

      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.activityId} 
          className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Título */}
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">{notification.name}</h4>
              </div>

              {/* Detalhes */}
              <div className="space-y-1 text-sm text-gray-600 mb-3">
                <p>
                  📅 {formatDate(notification.date)} 
                  {notification.location && ` • 📍 ${notification.location}`}
                </p>
                <p>
                  🏃 {formatDistance(notification.distance)} em {formatDuration(notification.time)}
                  {notification.pace && ` • ⚡ ${notification.pace}`}
                </p>
              </div>

              {/* Sugestões */}
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-white">
                  Sugestão: {notification.suggestedDistance}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`bg-white ${
                    notification.suggestedClassification === 'A' 
                      ? 'border-yellow-500 text-yellow-700'
                      : notification.suggestedClassification === 'B'
                      ? 'border-blue-500 text-blue-700'
                      : 'border-gray-500 text-gray-700'
                  }`}
                >
                  Prova {notification.suggestedClassification}
                </Badge>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/50 p-2 rounded">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Detectamos que esta atividade pode ser uma prova oficial. 
                  Adicione-a como meta de corrida para análises mais precisas.
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => handleAddAsRace(notification)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(notification.activityId)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
