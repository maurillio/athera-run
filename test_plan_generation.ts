import prisma from './lib/db';
import { generateAIPlan, AIUserProfile } from './lib/ai-plan-generator';

async function testPlanGeneration() {
  try {
    console.log('Buscando usuário mmaurillio2@gmail.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true },
    });

    if (!user || !user.athleteProfile) {
      console.error('Usuário ou perfil não encontrado');
      return;
    }

    console.log('Usuário encontrado:', user.email);
    console.log('Perfil:', JSON.stringify(user.athleteProfile, null, 2));

    const profile = user.athleteProfile;

    // Preparar perfil para a IA
    const rawPaces = profile.usualPaces as any;
    let usualPaces: Record<string, string> | undefined = undefined;
    
    if (rawPaces) {
      if (rawPaces['5k'] || rawPaces['10k']) {
        usualPaces = rawPaces;
      } else if (rawPaces.paces) {
        usualPaces = rawPaces.paces;
      }
    }

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
      trainingActivities: (profile.trainingActivities as any) || [],
      longRunDay: profile.longRunDay ?? undefined,
      usualPaces: usualPaces,
      hasGymAccess: true,
      hasPoolAccess: false,
    };

    console.log('\nGerando plano com IA...');
    const plan = await generateAIPlan(aiProfile);
    
    console.log('\n✅ Plano gerado com sucesso!');
    console.log('Total de semanas:', plan.totalWeeks);
    console.log('VDOT:', plan.vdot);
    console.log('Paces:', plan.paces);
    
  } catch (error) {
    console.error('\n❌ Erro ao gerar plano:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPlanGeneration();
