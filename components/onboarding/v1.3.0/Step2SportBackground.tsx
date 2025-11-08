'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step2SportBackground({ data, onUpdate, onNext, onBack, onPrevious }: any) {
  const t = useTranslations('onboarding.step2');
  const tCommon = useTranslations('common');
  
  // Parse otherSportsExperience se for string separada por vírgula
  const parseInitialSports = () => {
    if (!data.otherSportsExperience) return [];
    if (Array.isArray(data.otherSportsExperience)) return data.otherSportsExperience;
    return data.otherSportsExperience.split(',').map((s: string) => s.trim()).filter(Boolean);
  };
  
  const [formData, setFormData] = useState({
    hasRunBefore: data.hasRunBefore ?? true,
    runningYears: data.runningYears || '',
    currentWeeklyKm: data.currentWeeklyKm || '',
    longestRun: data.longestRun || '',
    selectedSports: parseInitialSports(),
    customSport: '',
    otherSportsYears: data.otherSportsYears || '',
  });
  
  // Lista de esportes comuns
  const commonSports = [
    { key: 'gym', label: 'Musculação', icon: '💪' },
    { key: 'pilates', label: 'Pilates', icon: '🧘' },
    { key: 'martialArts', label: 'Luta/Artes Marciais', icon: '🥋' },
    { key: 'cycling', label: 'Ciclismo', icon: '🚴' },
    { key: 'swimming', label: 'Natação', icon: '🏊' },
    { key: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
    { key: 'crossfit', label: 'CrossFit', icon: '🏋️' },
    { key: 'soccer', label: 'Futebol', icon: '⚽' },
    { key: 'basketball', label: 'Basquete', icon: '🏀' },
    { key: 'tennis', label: 'Tênis', icon: '🎾' },
    { key: 'volleyball', label: 'Vôlei', icon: '🏐' },
    { key: 'dance', label: 'Dança', icon: '💃' },
  ];
  
  // Função para adicionar/remover esporte
  const toggleSport = (sportLabel: string) => {
    const newSports = formData.selectedSports.includes(sportLabel)
      ? formData.selectedSports.filter((s: string) => s !== sportLabel)
      : [...formData.selectedSports, sportLabel];
    setFormData({ ...formData, selectedSports: newSports });
  };
  
  // Adicionar esporte customizado
  const addCustomSport = () => {
    if (formData.customSport.trim() && !formData.selectedSports.includes(formData.customSport.trim())) {
      setFormData({
        ...formData,
        selectedSports: [...formData.selectedSports, formData.customSport.trim()],
        customSport: '',
      });
    }
  };

  // Auto-save com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate({
        hasRunBefore: formData.hasRunBefore,
        runningYears: formData.runningYears ? parseInt(formData.runningYears) : undefined,
        currentWeeklyKm: formData.currentWeeklyKm ? parseFloat(formData.currentWeeklyKm) : undefined,
        longestRun: formData.longestRun ? parseFloat(formData.longestRun) : undefined,
        otherSportsExperience: formData.selectedSports.length > 0 ? formData.selectedSports.join(', ') : undefined,
        otherSportsYears: formData.otherSportsYears ? parseInt(formData.otherSportsYears) : undefined,
      });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData, onUpdate]);

  const handleNext = () => {
    onUpdate({
      hasRunBefore: formData.hasRunBefore,
      runningYears: formData.runningYears ? parseInt(formData.runningYears) : undefined,
      currentWeeklyKm: formData.currentWeeklyKm ? parseFloat(formData.currentWeeklyKm) : undefined,
      longestRun: formData.longestRun ? parseFloat(formData.longestRun) : undefined,
      otherSportsExperience: formData.selectedSports.length > 0 ? formData.selectedSports.join(', ') : undefined,
      otherSportsYears: formData.otherSportsYears ? parseInt(formData.otherSportsYears) : undefined,
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium mb-2">{t('hasRunBefore')}</label>
        <div className="flex gap-4">
          <button onClick={() => setFormData({...formData, hasRunBefore: true})}
            className={`px-6 py-2 rounded-lg ${formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>{tCommon('yes')}</button>
          <button onClick={() => setFormData({...formData, hasRunBefore: false})}
            className={`px-6 py-2 rounded-lg ${!formData.hasRunBefore ? 'bg-blue-600 text-white' : 'border'}`}>{tCommon('no')}</button>
        </div>
      </div>

      {formData.hasRunBefore && (
        <>
          <div><label className="block font-medium mb-2">{t('yearsRunning')}</label>
            <input type="number" value={formData.runningYears}
              onChange={(e) => setFormData({...formData, runningYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder={t('yearsRunningPlaceholder')} /></div>

          <div><label className="block font-medium mb-2">{t('weeklyVolume')}</label>
            <input type="number" value={formData.currentWeeklyKm}
              onChange={(e) => setFormData({...formData, currentWeeklyKm: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder={t('weeklyVolumePlaceholder')} /></div>

          <div><label className="block font-medium mb-2">{t('longestRun')}</label>
            <input type="number" value={formData.longestRun}
              onChange={(e) => setFormData({...formData, longestRun: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder={t('longestRunPlaceholder')} /></div>
        </>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">{t('otherSports.title')} ({tCommon('optional')})</h3>
        
        {/* Grid de esportes comuns */}
        <div className="mb-4">
          <label className="block font-medium mb-3 text-sm text-gray-600">
            Selecione os esportes que você pratica:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {commonSports.map((sport) => (
              <button
                key={sport.key}
                type="button"
                onClick={() => toggleSport(sport.label)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  formData.selectedSports.includes(sport.label)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <span className="mr-2">{sport.icon}</span>
                {sport.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Input para esporte customizado */}
        <div className="mb-4">
          <label className="block font-medium mb-2 text-sm text-gray-600">
            Ou adicione outro esporte:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.customSport}
              onChange={(e) => setFormData({...formData, customSport: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSport())}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder="Digite o nome do esporte..."
            />
            <button
              type="button"
              onClick={addCustomSport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Adicionar
            </button>
          </div>
        </div>
        
        {/* Esportes selecionados */}
        {formData.selectedSports.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium mb-2 text-sm text-gray-600">
              Esportes selecionados:
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.selectedSports.map((sport: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {sport}
                  <button
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className="hover:text-blue-900 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Anos praticando outros esportes */}
        {formData.selectedSports.length > 0 && (
          <div className="mt-4">
            <label className="block font-medium mb-2">{t('otherSports.years')}</label>
            <input
              type="number"
              value={formData.otherSportsYears}
              onChange={(e) => setFormData({...formData, otherSportsYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder={t('otherSports.yearsPlaceholder')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
