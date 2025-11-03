
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

    // v1.3.0 - Novos campos
    if (body.restingHeartRate !== undefined) updateData.restingHeartRate = body.restingHeartRate ? parseInt(body.restingHeartRate) : null;
    if (body.sleepQuality !== undefined) updateData.sleepQuality = body.sleepQuality ? parseInt(body.sleepQuality) : null;
    if (body.stressLevel !== undefined) updateData.stressLevel = body.stressLevel ? parseInt(body.stressLevel) : null;
    if (body.otherSportsExperience !== undefined) updateData.otherSportsExperience = body.otherSportsExperience;
    if (body.otherSportsYears !== undefined) updateData.otherSportsYears = body.otherSportsYears ? parseInt(body.otherSportsYears) : null;
    if (body.injuryDetails !== undefined) updateData.injuryDetails = body.injuryDetails;
    if (body.injuryRecoveryStatus !== undefined) updateData.injuryRecoveryStatus = body.injuryRecoveryStatus;
    if (body.lastInjuryDate !== undefined) updateData.lastInjuryDate = body.lastInjuryDate ? new Date(body.lastInjuryDate) : null;
    if (body.bestTimes !== undefined) {
      updateData.bestTimes = body.bestTimes;
      updateData.lastVDOTUpdate = new Date(); // Auto-update quando muda tempos
    }
    if (body.hasTrackAccess !== undefined) updateData.hasTrackAccess = body.hasTrackAccess;
    if (body.trainingPreferences !== undefined) updateData.trainingPreferences = body.trainingPreferences;
    if (body.motivationFactors !== undefined) updateData.motivationFactors = body.motivationFactors;
    if (body.runningYears !== undefined) updateData.runningYears = body.runningYears ? parseInt(body.runningYears) : null;
    if (body.maxHeartRate !== undefined) updateData.maxHeartRate = body.maxHeartRate ? parseInt(body.maxHeartRate) : null;

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
