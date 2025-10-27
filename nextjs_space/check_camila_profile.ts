import prisma from './lib/db';

async function checkProfile() {
  const user = await prisma.user.findUnique({
    where: { email: 'camilafelixsb@gmail.com' },
    include: { athleteProfile: true }
  });
  
  console.log('=== USUÁRIO ===');
  console.log(JSON.stringify(user, null, 2));
  
  if (user?.athleteProfile) {
    console.log('\n=== PERFIL DO ATLETA ===');
    console.log(JSON.stringify(user.athleteProfile, null, 2));
  }
}

checkProfile()
  .catch(console.error)
  .finally(() => process.exit(0));
