import prisma from './lib/db';
import { generateAIPlan, type AIUserProfile } from './lib/ai-plan-generator';

async function testUser() {
  try {
    console.log('🔍 Buscando usuário Teste0101019...');
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'teste0101019', mode: 'insensitive' } },
          { email: { contains: '0101019', mode: 'insensitive' } }
        ]
      },
      include: {
        athleteProfile: true
      }
    });

    if (!user) {
      console.error('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    console.log('📊 Perfil:', JSON.stringify(user.athleteProfile, null, 2));

    if (!user.athleteProfile) {
      console.error('❌ Perfil de atleta não encontrado');
      return;
    }

    const profile = user.athleteProfile;

    // Buscar corridas
    const raceGoals = await prisma.raceGoal.findMany({
      where: {
        athleteId: profile.id,
        status: {
          in: ['active', 'upcoming']
        }
      },
      orderBy: {
        raceDate: 'asc'
      }
    });

    console.log('🏁 Corridas encontradas:', raceGoals.length);
    raceGoals.forEach(race => {
      console.log(`  - ${race.priority}: ${race.raceName} em ${race.raceDate.toISOString().split('T')[0]}`);
    });

    // Preparar perfil para IA
    let activities: any[] = [];
    if (profile.trainingActivities) {
      activities = Array.isArray(profile.trainingActivities) 
        ? profile.trainingActivities 
        : (typeof profile.trainingActivities === 'object' 
            ? Object.values(profile.trainingActivities) 
            : []);
    }

    const rawPaces = profile.usualPaces as any;
    let usualPaces: Record<string, string> | undefined = undefined;

    if (rawPaces) {
      if (rawPaces['5k'] || rawPaces['10k']) {
        usualPaces = rawPaces;
      } else if (rawPaces.paces) {
        usualPaces = rawPaces.paces;
      }
    }

    const hasPoolAccess = activities.some((a: any) =>
      a.id === 'swimming' || a.id === 'natação' || a.id === 'natacao'
    );
    const hasGymAccess = activities.some((a: any) =>
      a.id === 'strength' || a.id === 'musculação' || a.id === 'musculacao'
    );

    const aiProfile: AIUserProfile = {
      runningLevel: profile.runningLevel,
      goalDistance: profile.goalDistance,
      targetRaceDate: profile.targetRaceDate || new Date(),
      currentWeeklyKm: profile.currentWeeklyKm || 0,
      longestRun: profile.longestRun || 0,
      currentVDOT: profile.currentVDOT || undefined,
      targetTime: profile.targetTime || undefined,
      weight: profile.weight,
      height: profile.height || undefined,
      age: profile.age || undefined,
      gender: profile.gender || undefined,
      trainingSchedule: profile.trainingSchedule as any,
      customActivities: (profile.customActivities as any) || [],
      longRunDay: profile.longRunDay ?? undefined,
      trainingActivities: activities,
      usualPaces: usualPaces,
      hasGymAccess: hasGymAccess,
      hasPoolAccess: hasPoolAccess,
      bestTimes: profile.bestTimes as any,
      runningYears: profile.runningYears ?? undefined,
      maxHeartRate: profile.maxHeartRate ?? undefined,
      recentLongRunPace: profile.recentLongRunPace ?? undefined,
      restingHeartRate: profile.restingHeartRate ?? undefined,
      otherSportsExperience: profile.otherSportsExperience ?? undefined,
      sleepQuality: profile.sleepQuality ?? undefined,
      stressLevel: profile.stressLevel ?? undefined,
      hasTrackAccess: profile.hasTrackAccess ?? undefined,
      trainingPreferences: profile.trainingPreferences as any,
      motivationFactors: profile.motivationFactors as any,
      raceGoals: raceGoals.map(race => ({
        id: race.id,
        name: race.raceName,
        distance: race.distance,
        date: race.raceDate,
        targetTime: race.targetTime || undefined,
        priority: race.priority as 'A' | 'B' | 'C'
      })),
    };

    console.log('\n🤖 Gerando plano com IA...');
    console.log('📋 Perfil para IA:', JSON.stringify(aiProfile, null, 2));

    const aiPlan = await generateAIPlan(aiProfile, 3);
    
    console.log('\n✅ Plano gerado com sucesso!');
    console.log('📊 Total de semanas:', aiPlan.totalWeeks);
    console.log('📅 Início:', aiPlan.startDate.toISOString().split('T')[0]);
    console.log('🏁 Corrida alvo:', aiPlan.targetRaceDate.toISOString().split('T')[0]);

    // Verificar se a corrida está no plano
    if (raceGoals.length > 0) {
      const raceDateStr = raceGoals[0].raceDate.toISOString().split('T')[0];
      console.log(`\n🔍 Procurando corrida alvo (${raceDateStr}) no plano...`);
      
      let found = false;
      aiPlan.weeks.forEach(week => {
        week.workouts.forEach(w => {
          const wDateStr = w.date.toISOString().split('T')[0];
          if (wDateStr === raceDateStr) {
            console.log(`✅ Encontrado: ${w.type} - ${w.title}`);
            found = true;
          }
        });
      });

      if (!found) {
        console.error(`❌ CRÍTICO: Corrida alvo NÃO encontrada no plano!`);
      }
    }

  } catch (error) {
    console.error('❌ ERRO:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUser();
