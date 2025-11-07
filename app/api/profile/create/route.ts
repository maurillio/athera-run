
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        customPlan: true
      }
    });

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
  } catch (error) {
    console.error('❌ [PROFILE CREATE GET] Erro completo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar perfil',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await getServerSession(authOptions);
    
    console.log('🔐 [PROFILE CREATE] Session:', {
      userId: session?.user?.id,
      email: session?.user?.email
    });

    if (!session?.user?.id) {
      console.log('❌ [PROFILE CREATE] Não autenticado');
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

    console.log('📦 [PROFILE CREATE] Body recebido:', {
      keys: Object.keys(body),
      trainingActivities: body.trainingActivities,
      availableDays: body.availableDays,
      weight: body.weight,
      age: body.age,
      onboardingComplete: body.onboardingComplete
    });

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
      // v1.3.0 - Fisiologia
      runningYears,
      maxHeartRate,
      restingHeartRate, // v1.3.0
      sleepQuality,
      stressLevel,
      otherSportsExperience,
      otherSportsYears, // v1.3.0
      // v1.3.0 - Lesões detalhadas
      injuryDetails,
      injuryRecoveryStatus,
      lastInjuryDate,
      // v1.3.0 - Performance
      bestTimes,
      // v1.3.0 - Infraestrutura
      hasGymAccess,
      hasPoolAccess,
      hasTrackAccess,
      // v1.3.0 - Preferências
      trainingPreferences,
      motivationFactors,
    } = body;

    // Validar campos obrigatórios
    if (!goalDistance) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Distância da corrida é obrigatória',
          field: 'goalDistance',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    if (!targetRaceDate) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Data da prova é obrigatória',
          field: 'targetRaceDate',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Helper para limpar strings vazias
    const cleanString = (value: any) => {
      if (value === '' || value === undefined || value === null) return null;
      if (typeof value === 'string') return value.trim() || null;
      return value;
    };

    console.log('🧹 [PROFILE CREATE] Cleaning strings - Before:', {
      gender, runningLevel, experienceDescription
    });

    const profileData = {
      weight: parseFloat(weight) || 70, // Default 70kg
      height: parseFloat(height) || 170, // Default 170cm
      age: age ? parseInt(age) : null,
      gender: cleanString(gender),
      runningLevel: cleanString(runningLevel) || 'beginner',
      currentWeeklyKm: currentWeeklyKm ? parseFloat(currentWeeklyKm) : null,
      longestRun: longestRun ? parseFloat(longestRun) : null,
      experienceDescription: cleanString(experienceDescription),
      // v1.5.4 - Critical fields (REQUIRED)
      goalDistance: cleanString(goalDistance) || 'unknown',
      targetRaceDate: new Date(targetRaceDate),
      targetTime: cleanString(targetTime),
      // Sistema flexível de atividades de treino
      trainingActivities: trainingActivities || [],
      // Dia preferido para treino longo
      longRunDay: longRunDay !== null && longRunDay !== undefined ? parseInt(longRunDay) : null,
      // Paces habituais (salvar apenas os paces, sem wrapper)
      ...(usualPaces && { usualPaces: usualPaces }),
      // Campos de experiência
      runningYears: runningYears ? parseInt(runningYears) : null,
      maxHeartRate: maxHeartRate ? parseInt(maxHeartRate) : null,
      recentLongRunPace: null, // Será preenchido com dados do Strava/logs
      // v1.3.0 - Novos campos
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : null,
      sleepQuality: sleepQuality ? parseInt(sleepQuality) : null,
      stressLevel: stressLevel ? parseInt(stressLevel) : null,
      otherSportsExperience: cleanString(otherSportsExperience),
      otherSportsYears: otherSportsYears ? parseInt(otherSportsYears) : null,
      injuryDetails: injuryDetails || null,
      injuryRecoveryStatus: cleanString(injuryRecoveryStatus),
      lastInjuryDate: lastInjuryDate ? new Date(lastInjuryDate) : null,
      bestTimes: bestTimes || null,
      lastVDOTUpdate: bestTimes ? new Date() : null,
      hasGymAccess: hasGymAccess === true || hasGymAccess === 'true',
      hasPoolAccess: hasPoolAccess === true || hasPoolAccess === 'true',
      hasTrackAccess: hasTrackAccess === true || hasTrackAccess === 'true',
      trainingPreferences: trainingPreferences || null,
      motivationFactors: motivationFactors || null,
      // v1.5.4 - Mark as ready for plan generation
      hasCustomPlan: true, // Always true if we got here (validated above)
    };

    console.log('🔍 [PROFILE CREATE] Profile data to save:', {
      goalDistance: profileData.goalDistance,
      targetRaceDate: profileData.targetRaceDate,
      hasCustomPlan: profileData.hasCustomPlan,
      trainingActivities: profileData.trainingActivities,
      gender: profileData.gender,
      runningLevel: profileData.runningLevel
    });

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

    // Criar race goal automaticamente se goalDistance e targetRaceDate foram fornecidos
    if (goalDistance && targetRaceDate) {
      try {
        // Verificar se já existe uma race goal para essa data
        const existingRaceGoal = await prisma.raceGoal.findFirst({
          where: {
            athleteId: profile.id,
            raceDate: new Date(targetRaceDate)
          }
        });

        if (!existingRaceGoal) {
          // Criar nome padrão baseado na distância
          const distanceNames: Record<string, string> = {
            '5k': 'Corrida 5km',
            '10k': 'Corrida 10km',
            '21k': 'Meia Maratona',
            '42k': 'Maratona',
          };

          await prisma.raceGoal.create({
            data: {
              athleteId: profile.id,
              raceName: distanceNames[goalDistance] || `Corrida ${goalDistance}`,
              distance: goalDistance,
              raceDate: new Date(targetRaceDate),
              targetTime: targetTime || null,
              priority: 'A', // Corrida principal é sempre A
              status: 'upcoming',
              isPrimary: true,
            }
          });

          console.log('[PROFILE CREATE] Race goal criada automaticamente:', distanceNames[goalDistance] || goalDistance);
        }
      } catch (error) {
        // Não falhar a criação do perfil se a race goal falhar
        console.error('[PROFILE CREATE] Erro ao criar race goal automática:', error);
      }
    }

    console.log('✅ [PROFILE CREATE] Perfil criado/atualizado com sucesso:', profile.id);

    return NextResponse.json({ 
      success: true,
      profile 
    }, { status: existingProfile ? 200 : 201 });

  } catch (error) {
    console.error('❌ [PROFILE CREATE] Erro completo:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao criar perfil',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
