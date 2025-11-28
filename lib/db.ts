import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    },
  },
})

// Optimize connection pool for Vercel serverless
if (process.env.NODE_ENV === 'production') {
  // Set connection pool timeout to avoid hanging requests
  prisma.$connect().catch((err) => {
    console.error('Failed to connect to database:', err);
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
