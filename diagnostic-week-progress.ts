import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticWeekProgress() {
  try {
    console.log('🔍 DIAGNÓSTICO: Progresso Semanal\n');

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  include: {
                    workouts: {
                      orderBy: { date: 'asc' }
                    }
                  },
                  orderBy: { weekNumber: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.athleteProfile || !user.athleteProfile.customPlan) {
      console.log('❌ Usuário ou plano não encontrado');
      return;
    }

    const plan = user.athleteProfile.customPlan;
    console.log(`✅ Plano encontrado: ID ${plan.id}`);
    console.log(`📅 Semana atual: ${plan.currentWeek}/${plan.totalWeeks}`);
    console.log(`📊 Taxa conclusão: ${plan.completionRate.toFixed(1)}%\n`);

    // Analisar cada semana
    plan.weeks.forEach((week) => {
      const completedCount = week.workouts.filter(w => w.isCompleted).length;
      const totalCount = week.workouts.length;

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📅 SEMANA ${week.weekNumber}`);
      console.log(`   Data: ${week.startDate.toLocaleDateString('pt-BR')} - ${week.endDate.toLocaleDateString('pt-BR')}`);
      console.log(`   Fase: ${week.phase}`);
      console.log(`   Foco: ${week.focus}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      console.log(`\n   📊 ESTATÍSTICAS:`);
      console.log(`   • Total de treinos: ${week.totalWorkouts}`);
      console.log(`   • Campo completedWorkouts no banco: ${week.completedWorkouts}`);
      console.log(`   • Treinos marcados isCompleted=true: ${completedCount}`);
      console.log(`   • Total real de workouts: ${totalCount}`);
      
      if (week.completedWorkouts !== completedCount) {
        console.log(`\n   ⚠️  INCONSISTÊNCIA DETECTADA!`);
        console.log(`   • Campo no banco: ${week.completedWorkouts}`);
        console.log(`   • Contagem real: ${completedCount}`);
      }

      console.log(`\n   📋 TREINOS:`);
      week.workouts.forEach((workout, idx) => {
        const status = workout.isCompleted ? '✅' : '❌';
        const date = new Date(workout.date).toLocaleDateString('pt-BR', { 
          weekday: 'short', 
          day: '2-digit', 
          month: '2-digit' 
        });
        console.log(`   ${idx + 1}. ${status} ${date} - ${workout.title} (${workout.type})`);
      });
    });

    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📈 RESUMO GERAL`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const totalWorkouts = plan.weeks.reduce((sum, w) => sum + w.workouts.length, 0);
    const completedWorkouts = plan.weeks.reduce((sum, w) => sum + w.workouts.filter(wo => wo.isCompleted).length, 0);
    
    console.log(`   Total de treinos no plano: ${totalWorkouts}`);
    console.log(`   Treinos completados: ${completedWorkouts}`);
    console.log(`   Taxa real: ${((completedWorkouts / totalWorkouts) * 100).toFixed(1)}%`);
    console.log(`   Taxa no banco: ${plan.completionRate.toFixed(1)}%`);
    
    if (Math.abs(plan.completionRate - (completedWorkouts / totalWorkouts) * 100) > 0.1) {
      console.log(`\n   ⚠️  INCONSISTÊNCIA GLOBAL DETECTADA!`);
    } else {
      console.log(`\n   ✅ Dados consistentes no nível do plano`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticWeekProgress();
