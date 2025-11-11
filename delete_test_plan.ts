import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deletePlan() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teste9393933@teste.com' },
      include: {
        athleteProfile: {
          include: {
            customPlan: true
          }
        }
      }
    });

    if (!user?.athleteProfile) {
      console.log('❌ Usuário ou perfil não encontrado');
      return;
    }

    if (!user.athleteProfile.customPlan) {
      console.log('ℹ️  Usuário não tem plano para deletar');
      return;
    }

    const planId = user.athleteProfile.customPlan.id;
    console.log(`🗑️  Deletando plano ID: ${planId}...`);

    // Delete plan (cascade deletes weeks and workouts)
    await prisma.customPlan.delete({
      where: { id: planId }
    });

    console.log('✅ Plano deletado com sucesso!');
    console.log('\n📝 Próximo passo:');
    console.log('   Faça login em https://atherarun.com');
    console.log('   Vá em "Gerar Novo Plano" e complete o onboarding');
    console.log('   Verifique logs em Vercel para ver o enhancement');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deletePlan();
