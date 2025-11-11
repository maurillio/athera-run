import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletePlan() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teste9393933@teste.com' },
      include: {
        athleteProfile: true
      }
    });

    if (!user?.athleteProfile) {
      console.log('❌ Usuário ou perfil não encontrado');
      return;
    }

    console.log(`✅ Perfil encontrado: ID ${user.athleteProfile.id}`);

    // Find custom training plans
    const plans = await prisma.customTrainingPlan.findMany({
      where: { athleteId: user.athleteProfile.id }
    });

    if (plans.length === 0) {
      console.log('ℹ️  Usuário não tem plano para deletar');
      return;
    }

    console.log(`📋 Planos encontrados: ${plans.length}`);
    
    for (const plan of plans) {
      console.log(`🗑️  Deletando plano ID: ${plan.id}...`);
      
      // Delete weeks (cascade should handle workouts)
      const weeks = await prisma.customWeek.deleteMany({
        where: { planId: plan.id }
      });
      console.log(`   ✅ ${weeks.count} semanas deletadas`);
      
      // Delete plan
      await prisma.customTrainingPlan.delete({
        where: { id: plan.id }
      });
      console.log(`   ✅ Plano ${plan.id} deletado`);
    }

    console.log('\n✅ Todos os planos deletados com sucesso!');
    console.log('\n📝 Próximo passo:');
    console.log('   1. Faça login em https://atherarun.com');
    console.log('   2. Use o usuário: teste9393933@teste.com');
    console.log('   3. Vá em "Gerar Novo Plano"');
    console.log('   4. Verifique logs em Vercel: [WORKOUT ENHANCE]');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePlan();
