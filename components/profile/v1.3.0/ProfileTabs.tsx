'use client';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/hooks';
import BasicDataTab from './BasicDataTab';
import PerformanceTab from './PerformanceTab';
import HealthTab from './HealthTab';
import GoalsTab from './GoalsTab';
import AvailabilityTab from './AvailabilityTab';
import PreferencesTab from './PreferencesTab';

interface ProfileTabsProps {
  userData: any;
  onUpdate: (data: any) => Promise<void>;
}

export default function ProfileTabs({ userData, onUpdate }: ProfileTabsProps) {
  const t = useTranslations('profile');
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'basic', label: t('tabs.basic'), component: BasicDataTab },
    { id: 'performance', label: t('tabs.performance'), component: PerformanceTab },
    { id: 'health', label: t('tabs.health'), component: HealthTab },
    { id: 'goals', label: t('tabs.goals'), component: GoalsTab },
    { id: 'availability', label: t('tabs.availability'), component: AvailabilityTab },
    { id: 'preferences', label: t('tabs.preferences'), component: PreferencesTab },
  ];

  const handleUpdate = async (data: any) => {
    setIsSaving(true);
    setError(null);
    try {
      await onUpdate(data);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(t('errors.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || BasicDataTab;

  // Error boundary check
  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{t('errors.dataUnavailable')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {isSaving && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="text-blue-600 font-medium">{t('saving')}</div>
          </div>
        )}
        <ActiveComponent userData={userData} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
