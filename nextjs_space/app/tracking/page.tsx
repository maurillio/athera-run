
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import WorkoutLogFormImproved from '@/components/workout-log-form-improved';
import WorkoutStats from '@/components/workout-stats';
import WeeklyProgressChart from '@/components/weekly-progress-chart';
import WorkoutHistory from '@/components/workout-history';
import StravaConnect from '@/components/strava-connect';
import { Loader2 } from 'lucide-react';

export default function TrackingPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchAthleteProfile();
    }
  }, [session]);

  const fetchAthleteProfile = async () => {
    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setAthleteProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching athlete profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutSuccess = () => {
    // Refresh stats and history
    setRefreshKey(prev => prev + 1);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!session || !athleteProfile) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Meus Treinos</h1>
            <p className="text-muted-foreground text-lg">
              Registre seus treinos e acompanhe sua evolução
            </p>
          </div>

          {/* Integração Strava */}
          <StravaConnect profile={athleteProfile} />

          {/* Stats */}
          <WorkoutStats key={refreshKey} athleteId={athleteProfile.id} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Formulário de registro */}
            <div>
              <WorkoutLogFormImproved 
                athleteId={athleteProfile.id} 
                onSuccess={handleWorkoutSuccess}
              />
            </div>

            {/* Gráfico de progresso semanal */}
            <div>
              <WeeklyProgressChart key={refreshKey} athleteId={athleteProfile.id} />
            </div>
          </div>

          {/* Histórico de treinos */}
          <WorkoutHistory key={refreshKey} athleteId={athleteProfile.id} />
        </div>
      </div>
    </>
  );
}
