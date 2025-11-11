import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPlan() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teste9393930@teste.com' },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  take: 1,
                  orderBy: { weekNumber: 'asc' },
                  include: {
                    workouts: {
                      take: 3,
                      where: { type: 'running' },
                      orderBy: { date: 'asc' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.athleteProfile?.customPlan) {
      console.log('❌ Nenhum plano encontrado');
      return;
    }

    const plan = user.athleteProfile.customPlan;
    const week = plan.weeks[0];
    const workouts = week?.workouts || [];

    console.log('\n📊 ANÁLISE DO PLANO GERADO\n');
    console.log(`Plano ID: ${plan.id}`);
    console.log(`Criado em: ${plan.createdAt}`);
    console.log(`Total de semanas: ${plan.totalWeeks}`);
    console.log(`\n🏃 Treinos da Semana 1 (primeiros 3 de corrida):\n`);

    workouts.forEach((workout, idx) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TREINO ${idx + 1}: ${workout.title}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Tipo: ${workout.type} / ${workout.subtype || 'N/A'}`);
      console.log(`Data: ${workout.date.toISOString().split('T')[0]}`);
      
      // v2.0.0 fields
      console.log(`\n🆕 CAMPOS v2.0.0:`);
      console.log(`- warmUpStructure: ${workout.warmUpStructure ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- mainWorkoutStruct: ${workout.mainWorkoutStruct ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- coolDownStructure: ${workout.coolDownStructure ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- objective: ${workout.objective ? '✅ ' + workout.objective.substring(0, 80) + '...' : '❌ NÃO'}`);
      console.log(`- scientificBasis: ${workout.scientificBasis ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- tips: ${workout.tips ? `✅ SIM (${(workout.tips as any).length} dicas)` : '❌ NÃO'}`);
      console.log(`- commonMistakes: ${workout.commonMistakes ? `✅ SIM (${(workout.commonMistakes as any).length} erros)` : '❌ NÃO'}`);
      console.log(`- successCriteria: ${workout.successCriteria ? `✅ SIM (${(workout.successCriteria as any).length} critérios)` : '❌ NÃO'}`);
      console.log(`- intensityLevel: ${workout.intensityLevel || 'N/A'}`);
      console.log(`- expectedRPE: ${workout.expectedRPE || 'N/A'}`);

      // Campos antigos (fallback)
      console.log(`\n📜 CAMPOS ANTIGOS (fallback):`);
      console.log(`- warmup: ${workout.warmup || 'N/A'}`);
      console.log(`- mainSet: ${workout.mainSet ? workout.mainSet.substring(0, 80) + '...' : 'N/A'}`);
      console.log(`- cooldown: ${workout.cooldown || 'N/A'}`);
    });

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📊 RESUMO:');
    console.log(`${'='.repeat(60)}`);
    
    const hasNewFields = workouts.some(w => 
      w.warmUpStructure || w.mainWorkoutStruct || w.coolDownStructure || 
      w.objective || w.tips || w.commonMistakes
    );

    if (hasNewFields) {
      console.log('✅ Plano gerado COM estrutura v2.0.0');
    } else {
      console.log('❌ Plano gerado SEM estrutura v2.0.0 (usando fallback antigo)');
      console.log('\n💡 Possíveis causas:');
      console.log('  1. IA não retornou os campos novos no JSON');
      console.log('  2. Enhancer não foi aplicado aos treinos');
      console.log('  3. Plano foi gerado antes da migration v2.0.0');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlan();
