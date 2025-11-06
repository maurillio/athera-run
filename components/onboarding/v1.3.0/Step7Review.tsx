'use client';
import { useTranslations } from '@/lib/i18n/hooks';

export default function Step7Review({ data, onNext, onBack }: any) {
  const t = useTranslations('onboarding.step7');
  const tCommon = useTranslations('common');
  const getSummary = () => {
    const items = [];
    
    if (data.age) items.push(`${data.age} ${t('years')}`);
    if (data.gender) items.push(data.gender === 'male' ? t('male') : t('female'));
    if (data.hasRunBefore !== undefined) {
      items.push(data.hasRunBefore ? t('yearsRunning', { years: data.runningYears || '?' }) : t('beginner'));
    }
    if (data.currentWeeklyKm) items.push(t('kmPerWeek', { km: data.currentWeeklyKm }));
    if (data.primaryGoal) {
      const goalLabels: any = {
        finish_first_race: t('goalLabels.finish_first_race'),
        improve_time: t('goalLabels.improve_time'),
        health_fitness: t('goalLabels.health_fitness'),
        weight_loss: t('goalLabels.weight_loss'),
        challenge: t('goalLabels.challenge'),
        consistency: t('goalLabels.consistency')
      };
      items.push(goalLabels[data.primaryGoal] || data.primaryGoal);
    }
    if (data.availableDays?.running) {
      items.push(t('daysPerWeek', { days: data.availableDays.running.length }));
    }
    
    return items;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-blue-900">{t('profileTitle')}</h3>
        <div className="space-y-2">
          {getSummary().map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        {data.bestTimes && Object.keys(data.bestTimes).length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">{t('bestTimesTitle')}</p>
            {Object.entries(data.bestTimes).map(([dist, t]: any) => (
              <p key={dist} className="text-sm text-gray-700">
                {dist.toUpperCase()}: {t.time} (VDOT {t.vdot})
              </p>
            ))}
          </div>
        )}

        {data.injuryHistory && data.injuryHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="font-semibold text-orange-700 mb-2">{t('injuryHistoryTitle')}</p>
            <p className="text-sm text-gray-700">{data.injuryHistory.join(', ')}</p>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="font-semibold text-green-900 mb-2">{t('nextStepTitle')}</p>
        <p className="text-sm text-gray-700">
          {t('nextStepDescription')}
        </p>
      </div>
    </div>
  );
}
