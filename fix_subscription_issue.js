const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const envFile = fs.readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    process.env[key] = value
  }
})

const prisma = new PrismaClient()

async function fix() {
  try {
    console.log('🔍 Investigating mmaurillio2@gmail.com subscription issue...\n')
    
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        subscription: true,
        athleteProfile: true
      }
    })
    
    if (!user) {
      console.log('❌ User NOT found!')
      return
    }
    
    console.log('✅ User found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Has Subscription: ${!!user.subscription}`)
    console.log(`   Has Profile: ${!!user.athleteProfile}\n`)
    
    // 2. Check if subscription exists
    if (user.subscription) {
      console.log('✅ Subscription EXISTS:')
      console.log(`   Status: ${user.subscription.status}`)
      console.log(`   Plan: ${user.subscription.plan}\n`)
      
      console.log('💡 The subscription exists, so the issue might be with session.user.id')
      console.log('   The user ID in the session might be different from the database ID.')
      console.log('   This can happen after OAuth re-authentication.\n')
    } else {
      console.log('❌ No subscription found - creating one...\n')
      
      try {
        const newSub = await prisma.subscription.create({
          data: {
            userId: user.id,
            status: 'ACTIVE',
            plan: 'PREMIUM_MONTHLY'
          }
        })
        console.log('✅ Subscription created successfully!')
        console.log(`   ID: ${newSub.id}`)
        console.log(`   Status: ${newSub.status}`)
        console.log(`   Plan: ${newSub.plan}\n`)
      } catch (createError) {
        console.log('❌ Failed to create subscription:', createError.message)
      }
    }
    
    // 3. Check athleteProfile
    if (!user.athleteProfile) {
      console.log('⚠️  No AthleteProfile - creating one...\n')
      
      try {
        const profile = await prisma.athleteProfile.create({
          data: {
            userId: user.id,
            hasCustomPlan: false
          }
        })
        console.log('✅ AthleteProfile created!')
      } catch (profileError) {
        console.log('❌ Failed to create profile:', profileError.message)
      }
    }
    
    console.log('\n✅ All checks complete!')
    console.log('\n💡 SOLUTION:')
    console.log('   The user should clear cookies and log out/in again.')
    console.log('   This will refresh the session with the correct user ID.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

fix()
