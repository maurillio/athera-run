import { generateAIPlan, AIUserProfile } from './lib/ai-plan-generator';

async function test() {
  const profile: AIUserProfile = {
    runningLevel: 'intermediate',
    goalDistance: 'marathon',
    targetRaceDate: new Date('2026-08-30'),
    currentWeeklyKm: 20,
    longestRun: 18,
    weight: 88,
    trainingActivities: [
      {
        id: 'running',
        name: 'Corrida',
        availableDays: [0, 2, 4],
        preferredTime: 'early_morning'
      },
      {
        id: 'strength',
        name: 'Musculação',
        availableDays: [1, 2, 3, 4, 5],
        preferredTime: 'afternoon'
      },
      {
        id: 'swimming',
        name: 'Natação',
        availableDays: [3, 5],
        preferredTime: 'evening'
      }
    ],
    longRunDay: 0,
    usualPaces: {
      '5k': '5:30-6:00',
      '10k': '5:30-6:00',
      '21k': 'never',
      '42k': 'never'
    },
    hasGymAccess: true,
    hasPoolAccess: true
  };

  try {
    console.log('🚀 Iniciando teste de geração de plano com IA...\n');
    console.log('Perfil:', JSON.stringify(profile, null, 2));
    console.log('\n⏳ Gerando plano...\n');
    
    const plan = await generateAIPlan(profile);
    
    console.log('✅ Plano gerado com sucesso!');
    console.log('Total de semanas:', plan.totalWeeks);
    console.log('VDOT:', plan.vdot);
    console.log('Paces:', plan.paces);
    console.log('\nPrimeira semana:', JSON.stringify(plan.weeks[0], null, 2));
  } catch (error) {
    console.error('❌ Erro ao gerar plano:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

test();
