import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.customWorkout.updateMany({
      where: {
        date: {
          gte: new Date('2025-11-30T00:00:00.000Z'),
          lte: new Date('2025-11-30T23:59:59.999Z')
        },
        type: 'running'
      },
      data: {
        isCompleted: false,
        executedWorkoutId: null,
        wasSubstitution: false
      }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Domingo 30 resetado!',
      updated: result.count
    })
  } catch (error) {
    console.error('[Fix Bug] Error:', error)
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
