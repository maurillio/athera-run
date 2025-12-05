import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fix() {
  const result = await prisma.customWorkout.updateMany({
    where: {
      date: {
        gte: new Date('2025-11-30T00:00:00.000Z'),
        lte: new Date('2025-11-30T23:59:59.999Z')
      },
      type: 'running',
      title: {
        contains: 'Longão'
      }
    },
    data: {
      isCompleted: false,
      executedWorkoutId: null,
      wasSubstitution: false
    }
  })
  
  console.log('✅ Domingo 30 resetado:', result)
  await prisma.$disconnect()
}

fix()
