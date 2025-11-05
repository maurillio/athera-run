
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const planId = parseInt(params.planId);

    const plan = await prisma.customTrainingPlan.findFirst({
      where: { id: planId },
      include: {
        athleteProfile: true,
        weeks: {
          include: {
            workouts: {
              orderBy: {
                date: 'asc'  // ← CRÍTICO: Ordenar workouts por data!
              }
            }
          },
          orderBy: {
            weekNumber: 'asc'
          }
        }
      }
    });

    if (!plan || !plan.athleteProfile || plan.athleteProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ weeks: plan.weeks });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json({ error: 'Erro ao buscar semanas' }, { status: 500 });
  }
}
