import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    console.log('🔍 Checking user mmaurillio2@gmail.com...\n')
    
    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        profile: true,
        subscription: true,
        accounts: true,
        trainingPlan: true
      }
    })
    
    if (!user) {
      console.log('❌ User NOT FOUND in database')
      return
    }
    
    console.log('✅ User found:')
    console.log(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, null, 2))
    
    console.log('\n📧 Accounts (OAuth):')
    console.log(JSON.stringify(user.accounts.map(acc => ({
      provider: acc.provider,
      type: acc.type,
      providerAccountId: acc.providerAccountId
    })), null, 2))
    
    console.log('\n👤 Profile:')
    if (user.profile) {
      console.log(JSON.stringify({
        userId: user.profile.userId,
        raceDate: user.profile.raceDate,
        currentPace: user.profile.currentPace,
        createdAt: user.profile.createdAt
      }, null, 2))
    } else {
      console.log('❌ NO PROFILE')
    }
    
    console.log('\n💳 Subscription:')
    if (user.subscription) {
      console.log(JSON.stringify(user.subscription, null, 2))
    } else {
      console.log('❌ NO SUBSCRIPTION')
    }
    
    console.log('\n📋 Training Plan:')
    if (user.trainingPlan) {
      console.log(JSON.stringify({
        id: user.trainingPlan.id,
        userId: user.trainingPlan.userId,
        createdAt: user.trainingPlan.createdAt
      }, null, 2))
    } else {
      console.log('❌ NO TRAINING PLAN')
    }
    
    // Verificar se userId é válido
    console.log('\n🔑 User ID validation:')
    console.log(`Type: ${typeof user.id}`)
    console.log(`Value: ${user.id}`)
    console.log(`Length: ${user.id.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
