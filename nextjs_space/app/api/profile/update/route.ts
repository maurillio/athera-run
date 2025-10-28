
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

    // Preparar dados para update (apenas campos que foram enviados)
    const updateData: any = {};

    // Dados básicos
    if (body.weight !== undefined) updateData.weight = parseFloat(body.weight);
    if (body.height !== undefined) updateData.height = parseFloat(body.height);
    if (body.age !== undefined) updateData.age = parseInt(body.age);
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.runningLevel !== undefined) updateData.runningLevel = body.runningLevel;
    if (body.currentWeeklyKm !== undefined) updateData.currentWeeklyKm = parseFloat(body.currentWeeklyKm);
    if (body.longestRun !== undefined) updateData.longestRun = parseFloat(body.longestRun);
    if (body.experienceDescription !== undefined) updateData.experienceDescription = body.experienceDescription;
    if (body.goalDistance !== undefined) updateData.goalDistance = body.goalDistance;
    if (body.targetRaceDate !== undefined) updateData.targetRaceDate = new Date(body.targetRaceDate);
    if (body.targetTime !== undefined) updateData.targetTime = body.targetTime;

    // Disponibilidade e preferências
    if (body.trainingActivities !== undefined) updateData.trainingActivities = body.trainingActivities;
    if (body.longRunDay !== undefined) updateData.longRunDay = body.longRunDay;
    if (body.usualPaces !== undefined) updateData.usualPaces = body.usualPaces;

    // Informações médicas
    if (body.injuries !== undefined) updateData.injuries = body.injuries;
    if (body.medicalConditions !== undefined) updateData.medicalConditions = body.medicalConditions;
    if (body.limitations !== undefined) updateData.limitations = body.limitations;

    // Equipamentos
    if (body.hasGymAccess !== undefined) updateData.hasGymAccess = body.hasGymAccess;
    if (body.hasPoolAccess !== undefined) updateData.hasPoolAccess = body.hasPoolAccess;

    const updated = await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: updateData
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
