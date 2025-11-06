
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';

interface VdotData {
  vdot: number;
  easy_pace_min: string;
  easy_pace_max: string;
  marathon_pace_min: string;
  marathon_pace_max: string;
  threshold_pace_min: string;
  threshold_pace_max: string;
  interval_pace_min: string;
  interval_pace_max: string;
  repetition_pace_min: string;
  repetition_pace_max: string;
}

interface VdotCalculatorProps {
  vdotData: VdotData[];
}

function timeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

function secondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function calculateVdotFromTime(minutes: number, seconds: number): number {
  const totalSeconds = minutes * 60 + seconds;
  const pacePerKm = totalSeconds / 10; // Para 10km
  
  // Fórmula simplificada baseada no pace de 10km
  // Esta é uma aproximação baseada nos dados fornecidos
  if (pacePerKm <= 340) return 38; // 5:40/km
  if (pacePerKm <= 350) return 37; // 5:50/km
  if (pacePerKm <= 360) return 36; // 6:00/km
  if (pacePerKm <= 370) return 35; // 6:10/km
  return 34;
}

export default function VdotCalculator({ vdotData }: VdotCalculatorProps) {
  const t = useTranslations('calculator');
  const [raceTime, setRaceTime] = useState({ minutes: 57, seconds: 0 });
  const [calculatedVdot, setCalculatedVdot] = useState<number | null>(null);
  const [selectedVdot, setSelectedVdot] = useState<VdotData | null>(null);

  const handleCalculate = () => {
    const vdot = calculateVdotFromTime(raceTime.minutes, raceTime.seconds);
    setCalculatedVdot(vdot);
    
    const vdotInfo = vdotData.find(v => Math.floor(v.vdot) === Math.floor(vdot));
    setSelectedVdot(vdotInfo || vdotData[0]);
  };

  const paceZones = selectedVdot ? [
    {
      name: t('paceZones.easy.name'),
      range: `${selectedVdot.easy_pace_min} - ${selectedVdot.easy_pace_max}`,
      color: 'bg-blue-100 text-blue-800',
      description: t('paceZones.easy.description')
    },
    {
      name: t('paceZones.marathon.name'),
      range: `${selectedVdot.marathon_pace_min} - ${selectedVdot.marathon_pace_max}`,
      color: 'bg-orange-100 text-orange-800',
      description: t('paceZones.marathon.description')
    },
    {
      name: t('paceZones.threshold.name'),
      range: `${selectedVdot.threshold_pace_min} - ${selectedVdot.threshold_pace_max}`,
      color: 'bg-green-100 text-green-800',
      description: t('paceZones.threshold.description')
    },
    {
      name: t('paceZones.interval.name'),
      range: `${selectedVdot.interval_pace_min} - ${selectedVdot.interval_pace_max}`,
      color: 'bg-red-100 text-red-800',
      description: t('paceZones.interval.description')
    },
    {
      name: t('paceZones.repetition.name'),
      range: `${selectedVdot.repetition_pace_min} - ${selectedVdot.repetition_pace_max}`,
      color: 'bg-purple-100 text-purple-800',
      description: t('paceZones.repetition.description')
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t('formTitle')}
          </CardTitle>
          <CardDescription>
            {t('formDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="minutes">{t('minutes')}</Label>
              <Input
                id="minutes"
                type="number"
                value={raceTime.minutes}
                onChange={(e) => setRaceTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                min="30"
                max="90"
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seconds">{t('seconds')}</Label>
              <Input
                id="seconds"
                type="number"
                value={raceTime.seconds}
                onChange={(e) => setRaceTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                min="0"
                max="59"
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleCalculate} className="bg-orange-600 hover:bg-orange-700">
                {t('calculate')}
              </Button>
            </div>
          </div>

          {calculatedVdot && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">{t('result')}</span>
              </div>
              <p className="text-sm">
                {t('time')} <strong>{raceTime.minutes}:{raceTime.seconds.toString().padStart(2, '0')}</strong> |
                {t('vdot')} <strong>{calculatedVdot}</strong> |
                {t('avgPace')} <strong>{secondsToTime((raceTime.minutes * 60 + raceTime.seconds) / 10)}/km</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pace Zones */}
      {selectedVdot && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('yourPacesTitle', { vdot: selectedVdot.vdot })}
            </CardTitle>
            <CardDescription>
              {t('yourPacesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paceZones.map((zone, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{zone.name}</h4>
                    <Badge className={zone.color}>
                      {zone.range}/km
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {zone.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">{t('projectionTitle')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">5km:</span>
                  <div className="text-muted-foreground">~{Math.round((raceTime.minutes * 60 + raceTime.seconds) * 0.48 / 60)}:{String(Math.round((raceTime.minutes * 60 + raceTime.seconds) * 0.48 % 60)).padStart(2, '0')}</div>
                </div>
                <div>
                  <span className="font-medium">21km:</span>
                  <div className="text-muted-foreground">~{Math.floor((raceTime.minutes * 60 + raceTime.seconds) * 2.2 / 3600)}h{String(Math.floor(((raceTime.minutes * 60 + raceTime.seconds) * 2.2 % 3600) / 60)).padStart(2, '0')}</div>
                </div>
                <div>
                  <span className="font-medium">42km:</span>
                  <div className="text-orange-600 font-medium">{t('projectionMeta')}</div>
                </div>
                <div>
                  <span className="font-medium">{t('marathonPace')}</span>
                  <div className="text-orange-600 font-medium">5:41/km</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VDOT Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
          <CardDescription>
            {t('tableDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('tableHeaders.vdot')}</th>
                  <th className="text-left p-2">{t('tableHeaders.easy')}</th>
                  <th className="text-left p-2">{t('tableHeaders.marathon')}</th>
                  <th className="text-left p-2">{t('tableHeaders.threshold')}</th>
                  <th className="text-left p-2">{t('tableHeaders.interval')}</th>
                </tr>
              </thead>
              <tbody>
                {vdotData?.map((row) => (
                  <tr key={row.vdot} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{row.vdot}</td>
                    <td className="p-2 text-blue-600">{row.easy_pace_min}-{row.easy_pace_max}</td>
                    <td className="p-2 text-orange-600">{row.marathon_pace_min}-{row.marathon_pace_max}</td>
                    <td className="p-2 text-green-600">{row.threshold_pace_min}-{row.threshold_pace_max}</td>
                    <td className="p-2 text-red-600">{row.interval_pace_min}-{row.interval_pace_max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
