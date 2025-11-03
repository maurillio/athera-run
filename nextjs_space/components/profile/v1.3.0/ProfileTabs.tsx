'use client';
import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'basic', label: '👤 Dados Básicos', component: BasicDataTab },
    { id: 'performance', label: '⚡ Performance', component: PerformanceTab },
    { id: 'health', label: '🏥 Saúde', component: HealthTab },
    { id: 'goals', label: '🎯 Objetivos', component: GoalsTab },
    { id: 'availability', label: '📅 Disponibilidade', component: AvailabilityTab },
    { id: 'preferences', label: '⚙️ Preferências', component: PreferencesTab },
  ];

  const handleUpdate = async (data: any) => {
    setIsSaving(true);
    try {
      await onUpdate(data);
    } finally {
      setIsSaving(false);
    }
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || BasicDataTab;

  return (
    <div className="space-y-6">
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
            <div className="text-blue-600 font-medium">Salvando...</div>
          </div>
        )}
        <ActiveComponent userData={userData} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
