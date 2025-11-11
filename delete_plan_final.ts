import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletePlan() {
  try {
    const profile = await prisma.athleteProfile.findFirst({
      where: { 
        user: { email: 'teste9393933@teste.com' }
      },
      include: {
        customPlan: {
          include: {
            weeks: {
              include: {
                workouts: true
              }
            }
          }
        }
      }
    });

    if (!profile) {
      console.log('❌ Perfil não encontrado');
      return;
    }

    console.log(`✅ Perfil encontrado: ID ${profile.id}`);

    if (!profile.customPlan) {
      console.log('ℹ️  Usuário não tem plano para deletar');
      return;
    }

    const plan = profile.customPlan;
    console.log(`📋 Plano encontrado: ID ${plan.id}, ${plan.totalWeeks} semanas`);
    console.log(`   Semanas: ${plan.weeks.length}`);
    console.log(`   Treinos total: ${plan.weeks.reduce((sum, w) => sum + w.workouts.length, 0)}`);
    
    console.log(`\n🗑️  Deletando plano ID: ${plan.id}...`);
    
    // Delete all workouts
    let totalWorkouts = 0;
    for (const week of plan.weeks) {
      const deleted = await prisma.customWorkout.deleteMany({
        where: { weekId: week.id }
      });
      totalWorkouts += deleted.count;
    }
    console.log(`   ✅ ${totalWorkouts} treinos deletados`);
    
    // Delete weeks
    const weeks = await prisma.customWeek.deleteMany({
      where: { planId: plan.id }
    });
    console.log(`   ✅ ${weeks.count} semanas deletadas`);
    
    // Delete plan
    await prisma.customTrainingPlan.delete({
      where: { id: plan.id }
    });
    console.log(`   ✅ Plano ${plan.id} deletado`);

    console.log('\n✅ Plano deletado com sucesso!');
    console.log('\n📝 Próximo passo:');
    console.log('   1. Faça login em https://atherarun.com');
    console.log('   2. Use: teste9393933@teste.com');
    console.log('   3. Clique em "Gerar Novo Plano"');
    console.log('   4. Após gerar, rode: npx tsx check_plan_structure.ts');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePlan();
