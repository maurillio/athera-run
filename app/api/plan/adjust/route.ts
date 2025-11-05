
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST - Ajustar plano baseado em feedback
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { reason, adjustmentType } = await request.json();
    // adjustmentType: "reduce_volume", "increase_rest", "skip_intensity", "full_rest"

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          include: {
            customPlan: {
              include: {
                weeks: {
                  where: {
                    startDate: {
                      gte: new Date()
                    }
                  },
                  include: {
                    workouts: true
                  },
                  orderBy: {
                    weekNumber: 'asc'
                  },
                  take: 2 // Próximas 2 semanas
                }
              }
            }
          }
        }
      }
    });

    if (!user?.athleteProfile?.customPlan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const plan = user.athleteProfile.customPlan;
    const upcomingWeeks = plan.weeks;

    let adjustmentDescription = '';
    let adjustedWorkouts = 0;

    // Aplicar ajustes baseado no tipo
    for (const week of upcomingWeeks) {
      for (const workout of week.workouts) {
        if (workout.isCompleted) continue; // Não ajustar treinos já completados

        let adjusted = false;

        switch (adjustmentType) {
          case 'reduce_volume':
            // Reduzir distância em 20-30%
            if (workout.distance) {
              await prisma.customWorkout.update({
                where: { id: workout.id },
                data: {
                  distance: workout.distance * 0.75,
                  description: `${workout.description}\n\n⚠️ Ajustado: Volume reduzido para 75% devido a: ${reason}`
                }
              });
              adjusted = true;
            }
            break;

          case 'increase_rest':
            // Transformar treinos leves em descanso ativo
            if (workout.subtype === 'easy' || workout.subtype === 'recovery') {
              await prisma.customWorkout.update({
                where: { id: workout.id },
                data: {
                  type: 'rest',
                  title: 'Descanso Ativo',
                  description: `Descanso ou caminhada leve.\n\n⚠️ Ajustado de ${workout.title} para priorizar recuperação devido a: ${reason}`
                }
              });
              adjusted = true;
            }
            break;

          case 'skip_intensity':
            // Remover treinos intensos
            if (workout.subtype === 'tempo' || workout.subtype === 'intervals' || workout.subtype === 'long') {
              await prisma.customWorkout.update({
                where: { id: workout.id },
                data: {
                  type: 'rest',
                  subtype: 'recovery',
                  title: 'Recuperação Ativa',
                  description: `Descanso ou atividade muito leve.\n\n⚠️ Ajustado de ${workout.title} devido a: ${reason}`
                }
              });
              adjusted = true;
            }
            break;

          case 'full_rest':
            // Transformar todos os treinos da próxima semana em descanso
            if (week === upcomingWeeks[0]) { // Apenas primeira semana
              await prisma.customWorkout.update({
                where: { id: workout.id },
                data: {
                  type: 'rest',
                  title: 'Descanso Completo',
                  description: `Descanso total para recuperação.\n\n⚠️ Ajustado de ${workout.title} devido a: ${reason}`
                }
              });
              adjusted = true;
            }
            break;
        }

        if (adjusted) adjustedWorkouts++;
      }
    }

    // Definir descrição do ajuste
    const adjustmentDescriptions: Record<string, string> = {
      reduce_volume: `Redução de 25% no volume dos treinos`,
      increase_rest: `Aumento de dias de recuperação`,
      skip_intensity: `Remoção de treinos intensos`,
      full_rest: `Semana completa de descanso`
    };

    adjustmentDescription = adjustmentDescriptions[adjustmentType] || 'Ajuste personalizado';

    // Criar registro de análise de IA documentando o ajuste
    await prisma.aIAnalysis.create({
      data: {
        athleteId: user.athleteProfile.id,
        analysisType: 'plan_adjustment',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
        summary: adjustmentDescription,
        insights: `Plano ajustado automaticamente baseado em feedback do atleta.`,
        recommendations: `Motivo: ${reason}\nTipo de ajuste: ${adjustmentDescription}\nTreinos ajustados: ${adjustedWorkouts}`,
        metrics: {
          adjustmentType,
          reason,
          workoutsAdjusted: adjustedWorkouts
        },
        hasAlerts: true,
        alerts: `Plano foi modificado. Monitore a recuperação do atleta.`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Plano ajustado com sucesso! ${adjustedWorkouts} treino(s) modificado(s).`,
      adjustmentDescription,
      workoutsAdjusted: adjustedWorkouts
    });
  } catch (error) {
    console.error('Error adjusting plan:', error);
    return NextResponse.json({ error: 'Erro ao ajustar plano' }, { status: 500 });
  }
}
