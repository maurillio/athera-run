/**
 * ATHERA FLEX v3.3.0 - Detect Matches API
 * POST - Detecta matches entre treinos completados e planejados
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SmartWorkoutMatcher, createMatcherFromUserSettings } from '@/lib/athera-flex/smart-workout-matcher';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

// ============================================================================
// POST - Detectar matches
// ============================================================================

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { minConfidence = 60, daysBack = 7 } = body;

    // Buscar user e profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Buscar plano ativo
    const plan = await prisma.customTrainingPlan.findFirst({
      where: { 
        athleteProfile: {
          id: profile.id
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum plano ativo encontrado',
      });
    }

    // Buscar configurações do usuário
    const settings = await prisma.userFlexSettings.findUnique({
      where: { userId: user.id },
    });

    // Criar matcher com configurações do usuário
    const matcher = createMatcherFromUserSettings(settings);

    // Buscar treinos completados nos últimos N dias SEM match ainda
    // APENAS CORRIDAS (running) devem ter sugestões de match
    const startDate = dayjs().subtract(daysBack, 'day').toDate();
    const completedWorkouts = await prisma.completedWorkout.findMany({
      where: {
        athleteId: profile.id,
        date: {
          gte: startDate,
        },
        wasPlanned: false, // Ainda não foi vinculado a um planejado
        type: 'running', // 🏃 APENAS CORRIDAS
      },
      orderBy: {
        date: 'desc',
      },
      take: 20, // Máximo 20 treinos para analisar
    });

    console.log('[detect-matches] ========== DEBUG ==========');
    console.log('[detect-matches] User ID:', user.id);
    console.log('[detect-matches] Profile ID:', profile.id);
    console.log('[detect-matches] Plan ID:', plan.id);
    console.log('[detect-matches] Min Confidence:', minConfidence);
    console.log('[detect-matches] Days Back:', daysBack);
    console.log('[detect-matches] Start Date:', startDate);
    console.log('[detect-matches] Found completed workouts:', completedWorkouts.length);
    
    if (completedWorkouts.length > 0) {
      console.log('[detect-matches] Completed Workouts Details:');
      completedWorkouts.forEach((w, i) => {
        console.log(`  ${i + 1}. ID: ${w.id}`);
        console.log(`     Date: ${dayjs(w.date).format('DD/MM/YYYY HH:mm')}`);
        console.log(`     Type: ${w.type} ${w.subtype ? `(${w.subtype})` : ''}`);
        console.log(`     Distance: ${w.distance || 'N/A'}km`);
        console.log(`     wasPlanned: ${w.wasPlanned}`);
      });
    } else {
      console.log('[detect-matches] ⚠️  No completed workouts found - checking why...');
      
      // Debug: verificar se tem corridas completadas (sem filtro wasPlanned)
      const allCompleted = await prisma.completedWorkout.findMany({
        where: {
          athleteId: profile.id,
          date: { gte: startDate },
          type: 'running',
        },
        take: 5,
      });
      console.log('[detect-matches] Total running workouts (ignoring wasPlanned):', allCompleted.length);
      allCompleted.forEach(w => {
        console.log(`  - ID ${w.id}: date=${dayjs(w.date).format('DD/MM')}, wasPlanned=${w.wasPlanned}`);
      });
    }

    if (completedWorkouts.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum treino completado sem match encontrado',
      });
    }

    // Buscar treinos planejados NÃO completados
    // APENAS CORRIDAS (running) devem ter sugestões de match
    const plannedWorkouts = await prisma.customWorkout.findMany({
      where: {
        week: {
          planId: plan.id,
        },
        isCompleted: false,
        isFlexible: true,
        type: 'running', // 🏃 APENAS CORRIDAS
        date: {
          gte: dayjs().subtract(14, 'day').toDate(), // Últimos 14 dias
          lte: dayjs().add(7, 'day').toDate(), // Próximos 7 dias
        },
      },
      include: {
        week: true,
      },
    });

    console.log('[detect-matches] Found planned workouts:', plannedWorkouts.length);
    
    if (plannedWorkouts.length > 0) {
      console.log('[detect-matches] Planned Workouts Details:');
      plannedWorkouts.forEach((w, i) => {
        console.log(`  ${i + 1}. ID: ${w.id} - Week ${w.week.weekNumber}`);
        console.log(`     Date: ${dayjs(w.date).format('DD/MM/YYYY')}`);
        console.log(`     Title: ${w.title}`);
        console.log(`     Type: ${w.type} ${w.subtype ? `(${w.subtype})` : ''}`);
        console.log(`     Distance: ${w.distance || 'N/A'}km`);
        console.log(`     isCompleted: ${w.isCompleted}`);
        console.log(`     isFlexible: ${w.isFlexible}`);
        console.log(`     flexibilityWindow: ${w.flexibilityWindow || 'N/A'}`);
      });
    } else {
      console.log('[detect-matches] ⚠️  No planned workouts found - checking why...');
      
      // Debug: verificar se tem workouts planejados (sem filtros restritivos)
      const allPlanned = await prisma.customWorkout.findMany({
        where: {
          week: { planId: plan.id },
          type: 'running',
        },
        take: 5,
      });
      console.log('[detect-matches] Total running planned workouts (no filters):', allPlanned.length);
      allPlanned.forEach(w => {
        console.log(`  - ID ${w.id}: date=${dayjs(w.date).format('DD/MM')}, isCompleted=${w.isCompleted}, isFlexible=${w.isFlexible}`);
      });
    }

    if (plannedWorkouts.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'Nenhum treino planejado elegível encontrado',
      });
    }

    // Processar cada treino completado
    const suggestions = [];

    console.log('[detect-matches] ========== MATCHING PROCESS ==========');
    
    for (const completed of completedWorkouts) {
      console.log(`[detect-matches] Processing completed workout ID ${completed.id}...`);
      
      // Buscar matches para este treino
      const matches = await matcher.findBestMatch(
        {
          id: completed.id,
          date: completed.date,
          type: completed.type,
          subtype: completed.subtype,
          distance: completed.distance,
          duration: completed.duration,
          pace: completed.pace,
          avgHeartRate: completed.avgHeartRate,
          perceivedEffort: completed.perceivedEffort,
        },
        plannedWorkouts.map(p => ({
          id: p.id,
          date: p.date,
          type: p.type,
          subtype: p.subtype,
          distance: p.distance,
          duration: p.duration,
          targetPace: p.targetPace,
          targetHeartRate: p.targetHeartRate,
          targetRPE: p.targetRPE,
          isCompleted: p.isCompleted,
          isFlexible: p.isFlexible,
          flexibilityWindow: p.flexibilityWindow,
          canSubstitute: p.canSubstitute,
          minVolumePercent: p.minVolumePercent,
          maxVolumePercent: p.maxVolumePercent,
        }))
      );

      console.log(`[detect-matches] Found ${matches.length} matches for workout ${completed.id}`);
      
      if (matches.length > 0) {
        console.log(`[detect-matches] Best match confidence: ${matches[0].confidence}% (threshold: ${minConfidence}%)`);
        console.log(`[detect-matches] Best match details:`, {
          workoutId: matches[0].workoutId,
          confidence: matches[0].confidence,
          dateScore: matches[0].dateScore,
          typeScore: matches[0].typeScore,
          volumeScore: matches[0].volumeScore,
          intensityScore: matches[0].intensityScore,
        });
      }

      // Se encontrou matches acima do mínimo
      if (matches.length > 0 && matches[0].confidence >= minConfidence) {
        const bestMatch = matches[0];
        const plannedWorkout = plannedWorkouts.find(p => p.id === bestMatch.workoutId);

        console.log(`[detect-matches] ✅ Match accepted! Completed ${completed.id} → Planned ${plannedWorkout?.id}`);

        suggestions.push({
          completedWorkoutId: completed.id,
          completedWorkout: {
            date: completed.date,
            type: completed.type,
            distance: completed.distance,
            duration: completed.duration,
            pace: completed.pace,
          },
          plannedWorkout: {
            id: plannedWorkout?.id,
            title: plannedWorkout?.title,
            date: plannedWorkout?.date,
            type: plannedWorkout?.type,
            distance: plannedWorkout?.distance,
            duration: plannedWorkout?.duration,
          },
          matches: matches.slice(0, 3), // Top 3 matches
          bestMatch,
          shouldAutoApply: bestMatch.canAutoApply && (settings?.autoAdjustEnabled || false),
        });
      } else if (matches.length > 0) {
        console.log(`[detect-matches] ❌ Match rejected (confidence ${matches[0].confidence}% < ${minConfidence}%)`);
      } else {
        console.log(`[detect-matches] ❌ No matches found for workout ${completed.id}`);
      }
    }

    console.log('[detect-matches] ========== FINAL RESULTS ==========');
    console.log(`[detect-matches] Total suggestions: ${suggestions.length}`);
    if (suggestions.length > 0) {
      suggestions.forEach((s, i) => {
        console.log(`  ${i + 1}. Completed ${s.completedWorkoutId} → Planned ${s.plannedWorkout.id}`);
        console.log(`     Confidence: ${s.bestMatch.confidence}%`);
        console.log(`     Auto-apply: ${s.shouldAutoApply}`);
      });
    }

    // Ordenar por confidence (maior primeiro)
    suggestions.sort((a, b) => b.bestMatch.confidence - a.bestMatch.confidence);

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
      message: suggestions.length > 0
        ? `${suggestions.length} match${suggestions.length > 1 ? 'es' : ''} encontrado${suggestions.length > 1 ? 's' : ''}`
        : 'Nenhum match encontrado',
      settings: {
        minConfidence,
        daysBack,
        autoAdjustEnabled: settings?.autoAdjustEnabled || false,
        autoAdjustThreshold: settings?.autoAdjustThreshold || 90,
      },
    });
  } catch (error: any) {
    console.error('[Detect Matches] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
