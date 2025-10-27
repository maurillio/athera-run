
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    const updated = await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: {
        weight: body.weight ? parseFloat(body.weight) : undefined,
        height: body.height ? parseFloat(body.height) : undefined,
        age: body.age ? parseInt(body.age) : undefined,
        gender: body.gender,
        runningLevel: body.runningLevel,
        currentWeeklyKm: body.currentWeeklyKm ? parseFloat(body.currentWeeklyKm) : undefined,
        longestRun: body.longestRun ? parseFloat(body.longestRun) : undefined,
        experienceDescription: body.experienceDescription,
        goalDistance: body.goalDistance,
        targetRaceDate: body.targetRaceDate ? new Date(body.targetRaceDate) : undefined,
        targetTime: body.targetTime
      }
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
