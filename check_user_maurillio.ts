import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 Buscando usuário mmaurillio2@gmail.com...')
    
    // Buscar por email
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        profile: true,
        subscription: true
      }
    })
    
    if (!user) {
      console.log('❌ Usuário não encontrado!')
      console.log('\n📋 Listando todos os usuários:')
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })
      console.log(JSON.stringify(allUsers, null, 2))
    } else {
      console.log('✅ Usuário encontrado:')
      console.log(JSON.stringify(user, null, 2))
    }
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
