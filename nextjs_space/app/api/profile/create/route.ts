
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        customPlan: true
      }
    });

    // Try to parse body - if empty, return existing profile or needs creation
    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : null;
    } catch (e) {
      body = null;
    }

    // If no body provided, just check if profile exists
    if (!body || Object.keys(body).length === 0) {
      if (existingProfile) {
        return NextResponse.json({ 
          profile: {
            ...existingProfile,
            hasCustomPlan: existingProfile.hasCustomPlan || false
          } 
        }, { status: 200 });
      }
      return NextResponse.json(
        { hasProfile: false, message: 'Por favor, complete seu perfil' },
        { status: 200 }
      );
    }

    const {
      weight,
      height,
      age,
      gender,
      runningLevel,
      currentWeeklyKm,
      longestRun,
      experienceDescription,
      goalDistance,
      targetRaceDate,
      targetTime,
      trainingActivities, // Novo sistema flexível
      longRunDay, // Dia do treino longo
      hasRunBefore, // Se já correu antes
      usualPaces, // Paces habituais por distância
    } = body;

    const profileData = {
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: age ? parseInt(age) : null,
      gender: gender || null,
      runningLevel,
      currentWeeklyKm: currentWeeklyKm ? parseFloat(currentWeeklyKm) : null,
      longestRun: longestRun ? parseFloat(longestRun) : null,
      experienceDescription: experienceDescription || null,
      goalDistance,
      targetRaceDate: targetRaceDate ? new Date(targetRaceDate) : null,
      targetTime: targetTime || null,
      // Sistema flexível de atividades de treino
      trainingActivities: trainingActivities || [],
      // Dia preferido para treino longo
      longRunDay: longRunDay !== null && longRunDay !== undefined ? parseInt(longRunDay) : null,
      // Paces habituais (salvar apenas os paces, sem wrapper)
      ...(usualPaces && { usualPaces: usualPaces }),
    };

    let profile;

    if (existingProfile) {
      // Update existing profile
      profile = await prisma.athleteProfile.update({
        where: { userId: session.user.id },
        data: profileData
      });
    } else {
      // Create new profile
      profile = await prisma.athleteProfile.create({
        data: {
          userId: session.user.id,
          ...profileData
        }
      });
    }

    return NextResponse.json({ profile }, { status: existingProfile ? 200 : 201 });

  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    );
  }
}
