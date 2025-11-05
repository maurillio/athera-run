'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step2SportBackground({ data, onUpdate, onNext, onBack, onPrevious }: any) {
  const t = useTranslations('onboarding.step2');
  const tCommon = useTranslations('common');
  const [formData, setFormData] = useState({
    hasRunBefore: data.hasRunBefore ?? true,
    runningYears: data.runningYears || '',
    currentWeeklyKm: data.currentWeeklyKm || '',
    longestRun: data.longestRun || '',
    otherSportsExperience: data.otherSportsExperience || '',
    otherSportsYears: data.otherSportsYears || '',
  });

  const handleNext = () => {
    onUpdate({
      hasRunBefore: formData.hasRunBefore,
      runningYears: formData.runningYears ? parseInt(formData.runningYears) : undefined,
      currentWeeklyKm: formData.currentWeeklyKm ? parseFloat(formData.currentWeeklyKm) : undefined,
      longestRun: formData.longestRun ? parseFloat(formData.longestRun) : undefined,
      otherSportsExperience: formData.otherSportsExperience || undefined,
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
        <div><label className="block font-medium mb-2">{t('otherSports.sports')}</label>
          <input type="text" value={formData.otherSportsExperience}
            onChange={(e) => setFormData({...formData, otherSportsExperience: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg" placeholder={t('otherSports.sportsPlaceholder')} /></div>
        {formData.otherSportsExperience && (
          <div className="mt-4"><label className="block font-medium mb-2">{t('otherSports.years')}</label>
            <input type="number" value={formData.otherSportsYears}
              onChange={(e) => setFormData({...formData, otherSportsYears: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg" placeholder={t('otherSports.yearsPlaceholder')} /></div>
        )}
      </div>
    </div>
  );
}
