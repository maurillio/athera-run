const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUser(email) {
  try {
    console.log(`[DELETE-USER] Iniciando deleção do usuário: ${email}`);

    // Encontrar o usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: { athleteProfile: true }
    });

    if (!user) {
      console.log(`[DELETE-USER] Usuário não encontrado: ${email}`);
      return;
    }

    console.log(`[DELETE-USER] Usuário encontrado: ${user.id}`);

    // Se tiver perfil de atleta, deletar seus dados primeiro
    if (user.athleteProfile) {
      const profileId = user.athleteProfile.id;
      console.log(`[DELETE-USER] Deletando dados do perfil de atleta: ${profileId}`);

      // Deletar completedWorkouts
      await prisma.completedWorkout.deleteMany({
        where: { athleteId: profileId }
      });
      console.log('[DELETE-USER] Deletados completedWorkouts');

      // Deletar AIAnalysis
      await prisma.aIAnalysis.deleteMany({
        where: { athleteId: profileId }
      });
      console.log('[DELETE-USER] Deletados AIAnalysis');

      // Deletar trainingLog
      await prisma.trainingLog.deleteMany({
        where: { athleteId: profileId }
      });
      console.log('[DELETE-USER] Deletados trainingLog');

      // Deletar athleteProfile
      await prisma.athleteProfile.delete({
        where: { id: profileId }
      });
      console.log('[DELETE-USER] Deletado athleteProfile');
    }

    // Deletar accounts (para Google/OAuth)
    await prisma.account.deleteMany({
      where: { userId: user.id }
    });
    console.log('[DELETE-USER] Deletadas contas OAuth');

    // Deletar sessions
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });
    console.log('[DELETE-USER] Deletadas sessões');

    // Deletar usuário
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`[DELETE-USER] ✅ Usuário ${email} deletado com sucesso!`);

  } catch (error) {
    console.error('[DELETE-USER] Erro ao deletar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Pegar email da linha de comando
const email = process.argv[2];
if (!email) {
  console.log('Uso: node delete-user.js <email>');
  process.exit(1);
}

deleteUser(email);
