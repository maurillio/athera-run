import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: { athleteProfile: true }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Is Admin:', user.isAdmin);
    console.log('  Has Password:', !!user.password);
    console.log('  Has Profile:', !!user.athleteProfile);
    
    // Verificar senha
    if (user.password) {
      const passwordMatch = await bcrypt.compare('123456789', user.password);
      console.log('  Password Match (123456789):', passwordMatch);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
