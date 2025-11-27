
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Atualizar corrida
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raceGoalId = parseInt(params.id);
    const body = await req.json();

    const raceGoal = await prisma.raceGoal.findUnique({
      where: { id: raceGoalId },
      include: { athlete: true }
    });

    if (!raceGoal || raceGoal.athlete.userId !== session.user.id) {
      return NextResponse.json({ error: 'Corrida não encontrada' }, { status: 404 });
    }

    // Se for marcar como priority A, remover A de outras
    if (body.priority === 'A') {
      await prisma.raceGoal.updateMany({
        where: {
          athleteId: raceGoal.athleteId,
          id: { not: raceGoalId },
          priority: 'A'
        },
        data: {
          priority: 'B', // Downgrade para B
          isPrimary: false
        }
      });
    }

    const updated = await prisma.raceGoal.update({
      where: { id: raceGoalId },
      data: {
        raceName: body.raceName,
        distance: body.distance,
        raceDate: body.raceDate ? new Date(body.raceDate) : undefined,
        targetTime: body.targetTime,
        location: body.location,
        status: body.status,
        priority: body.priority,
        autoClassified: body.priority ? false : undefined, // Se usuário escolheu, não é auto
        isPrimary: body.priority === 'A', // Manter sincronizado (DEPRECATED)
        actualTime: body.actualTime,
        placement: body.placement,
        notes: body.notes
      }
    });

    return NextResponse.json({ raceGoal: updated });
  } catch (error) {
    console.error('Error updating race goal:', error);
    return NextResponse.json({ error: 'Erro ao atualizar corrida' }, { status: 500 });
  }
}

// DELETE - Excluir corrida
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const raceGoalId = parseInt(params.id);

    const raceGoal = await prisma.raceGoal.findUnique({
      where: { id: raceGoalId },
      include: { athlete: true }
    });

    if (!raceGoal || raceGoal.athlete.userId !== session.user.id) {
      return NextResponse.json({ error: 'Corrida não encontrada' }, { status: 404 });
    }

    await prisma.raceGoal.delete({
      where: { id: raceGoalId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting race goal:', error);
    return NextResponse.json({ error: 'Erro ao excluir corrida' }, { status: 500 });
  }
}
