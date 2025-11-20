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

async function checkUser() {
  try {
    console.log('🔍 Checking user mmaurillio2@gmail.com...\n')
    
    const user = await prisma.user.findUnique({
      where: { email: 'mmaurillio2@gmail.com' },
      include: {
        subscription: true,
        accounts: true,
        athleteProfile: true
      }
    })
    
    if (!user) {
      console.log('❌ User NOT FOUND in database\n')
      
      console.log('📋 All users in database:')
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
      console.log(JSON.stringify(allUsers, null, 2))
      return
    }
    
    console.log('✅ User found!')
    console.log('─────────────────────────────────────')
    console.log(`ID: ${user.id}`)
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Created: ${user.createdAt}`)
    console.log(`Premium: ${user.isPremium}`)
    console.log(`Admin: ${user.isAdmin}`)
    
    console.log('\n📧 OAuth Accounts:')
    if (user.accounts.length > 0) {
      user.accounts.forEach(acc => {
        console.log(`  - ${acc.provider} (${acc.type})`)
      })
    } else {
      console.log('  ❌ No OAuth accounts')
    }
    
    console.log('\n👤 Athlete Profile:')
    if (user.athleteProfile) {
      console.log(`  ✅ EXISTS`)
      console.log(`  - Race Date: ${user.athleteProfile.raceDate}`)
      console.log(`  - Current Pace: ${user.athleteProfile.currentPace}`)
      console.log(`  - Target Pace: ${user.athleteProfile.targetPace}`)
    } else {
      console.log('  ❌ NO ATHLETE PROFILE - This is the problem!')
    }
    
    console.log('\n💳 Subscription:')
    if (user.subscription) {
      console.log(`  ✅ EXISTS`)
      console.log(`  - Status: ${user.subscription.status}`)
      console.log(`  - Plan: ${user.subscription.plan}`)
    } else {
      console.log('  ❌ NO SUBSCRIPTION - This causes errors!')
    }
    
    console.log('\n🔍 DIAGNOSIS:')
    const issues = []
    if (!user.athleteProfile) {
      issues.push('❌ Missing AthleteProfile - training plan page will fail')
    }
    if (!user.subscription) {
      issues.push('❌ Missing Subscription - subscription checks will fail')
    }
    
    if (issues.length > 0) {
      console.log('Problems found:')
      issues.forEach(issue => console.log(`  ${issue}`))
      console.log('\n💡 SOLUTION: Need to create missing records for this user')
    } else {
      console.log('✅ No issues found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
