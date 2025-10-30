const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('🧹 Limpando dados órfãos do Strava...\n');

    // Procurar usuário com email gerado automaticamente (não é um usuário real)
    const orphanUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@strava.user'
        }
      },
      include: {
        athleteProfile: true,
        accounts: true
      }
    });

    console.log(`📊 Usuários órfãos encontrados: ${orphanUsers.length}\n`);

    for (const user of orphanUsers) {
      console.log(`👤 Usuário: ${user.email}`);
      console.log(`   ID: ${user.id}`);

      if (user.athleteProfile) {
        const profileId = user.athleteProfile.id;
        console.log(`   AthleteProfile: ${profileId}`);

        // Deletar todos os workouts desse perfil
        console.log(`   Deletando workouts...`);
        await prisma.completedWorkout.deleteMany({
          where: { athleteId: profileId }
        });
        console.log(`   ✅ Workouts deletados`);

        // Deletar training logs
        console.log(`   Deletando training logs...`);
        try {
          await prisma.trainingLog.deleteMany({
            where: { athleteId: profileId }
          });
          console.log(`   ✅ Training logs deletados`);
        } catch (e) {
          console.log(`   ⚠️ Sem training logs`);
        }

        // Deletar race goals
        console.log(`   Deletando race goals...`);
        try {
          await prisma.raceGoal.deleteMany({
            where: { athleteId: profileId }
          });
          console.log(`   ✅ Race goals deletados`);
        } catch (e) {
          console.log(`   ⚠️ Sem race goals`);
        }

        // Deletar AthleteProfile
        console.log(`   Deletando AthleteProfile...`);
        await prisma.athleteProfile.delete({
          where: { id: profileId }
        });
        console.log(`   ✅ AthleteProfile deletado`);
      }

      if (user.accounts.length > 0) {
        console.log(`   Deletando ${user.accounts.length} contas...`);
        await prisma.account.deleteMany({
          where: { userId: user.id }
        });
        console.log(`   ✅ Contas deletadas`);
      }

      console.log(`   Deletando usuário...`);
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log(`   ✅ Usuário deletado\n`);
    }

    console.log('✅ Limpeza concluída!');

    // Verificar estado final
    console.log('\n📊 Estado final:');
    const profiles = await prisma.athleteProfile.findMany({
      where: {
        stravaAthleteId: {
          not: null
        }
      },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    console.log(`\nPerfis com stravaAthleteId: ${profiles.length}`);
    profiles.forEach(p => {
      console.log(`  - ${p.user.email}: stravaAthleteId = ${p.stravaAthleteId}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
