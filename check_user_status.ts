import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    // Buscar todos usuários com Strava conectado
    const users = await prisma.user.findMany({
      where: {
        athleteProfile: {
          stravaConnected: true
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,
        athleteProfile: {
          select: {
            id: true,
            stravaConnected: true,
            stravaAccessToken: true,
            stravaTokenExpiresAt: true
          }
        }
      }
    });

    console.log('\n=== USUÁRIOS COM STRAVA ===');
    console.log(JSON.stringify(users, null, 2));

    if (users.length > 0) {
      const user = users[0];
      console.log('\n=== STATUS DO TOKEN ===');
      if (user.athleteProfile?.stravaTokenExpiresAt) {
        const expiry = new Date(user.athleteProfile.stravaTokenExpiresAt);
        const now = new Date();
        const isExpired = expiry < now;
        console.log(`Expira em: ${expiry.toISOString()}`);
        console.log(`Agora: ${now.toISOString()}`);
        console.log(`Expirado? ${isExpired ? '⚠️ SIM' : '✅ NÃO'}`);
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
