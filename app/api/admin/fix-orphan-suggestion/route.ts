import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const workouts = await prisma.customWorkout.findMany({
      where: {
        userId: session.user.email,
        date: {
          gte: new Date('2025-11-27'),
          lte: new Date('2025-12-01'),
        },
      },
      select: {
        id: true,
        type: true,
        date: true,
        isCompleted: true,
        executedWorkoutId: true,
      },
      orderBy: { date: 'asc' },
    })

    const domingo30 = workouts.find(w => 
      w.date.toISOString().startsWith('2025-11-30') && 
      w.type === 'running'
    )

    if (!domingo30) {
      return NextResponse.json({ error: 'Domingo 30 não encontrado' }, { status: 404 })
    }

    if (!domingo30.isCompleted || domingo30.executedWorkoutId) {
      return NextResponse.json({
        message: 'Domingo 30 já está correto',
        workout: domingo30,
      })
    }

    await prisma.customWorkout.update({
      where: { id: domingo30.id },
      data: { isCompleted: false },
    })

    return NextResponse.json({
      status: 'success',
      message: 'Domingo 30 corrigido: isCompleted = false',
      workoutId: domingo30.id,
    })
  } catch (error: any) {
    console.error('[Fix Orphan] Error:', error)
    return NextResponse.json(
      { error: 'Internal error', details: error.message },
      { status: 500 }
    )
  }
}
