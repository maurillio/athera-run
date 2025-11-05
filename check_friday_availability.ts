import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFridayAvailability() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });

    if (!user) {
      console.log('Usuário não encontrado');
      return;
    }

    console.log('=== PERFIL DO USUÁRIO ===');
    console.log('Email:', user.email);
    console.log('\n=== DISPONIBILIDADE COMPLETA ===');
    console.log(JSON.stringify(user.athleteProfile?.trainingActivities, null, 2));
    console.log('\n=== LONG RUN DAY ===');
    console.log('Long Run Day:', user.athleteProfile?.longRunDay);

    // Analisar musculação especificamente
    const activities = user.athleteProfile?.trainingActivities as any[];
    if (activities) {
      console.log('\n=== ANÁLISE POR ATIVIDADE ===');
      activities.forEach((activity: any) => {
        console.log(`\n${activity.name}:`);
        console.log('  Dias disponíveis:', activity.availableDays);
        console.log('  Inclui sexta-feira (5)?', activity.availableDays?.includes(5));
        
        const days = activity.availableDays?.map((d: number) => 
          ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d]
        ).join(', ');
        console.log('  Dias em texto:', days);
      });
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFridayAvailability();
