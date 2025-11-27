
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as corridas do atleta
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        raceGoals: {
          orderBy: [
            { isPrimary: 'desc' },
            { raceDate: 'asc' }
          ]
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ raceGoals: profile.raceGoals });
  } catch (error) {
    console.error('Error fetching race goals:', error);
    return NextResponse.json({ error: 'Erro ao buscar corridas' }, { status: 500 });
  }
}

// POST - Criar nova corrida
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
    const { raceName, distance, raceDate, targetTime, location, priority } = body;

    // Se for priority A, remover A de outras corridas
    if (priority === 'A') {
      await prisma.raceGoal.updateMany({
        where: {
          athleteId: profile.id,
          priority: 'A'
        },
        data: {
          priority: 'B', // Downgrade para B
          autoClassified: true
        }
      });
    }

    const raceGoal = await prisma.raceGoal.create({
      data: {
        athleteId: profile.id,
        raceName,
        distance,
        raceDate: new Date(raceDate),
        targetTime: targetTime || null,
        location: location || null,
        priority: priority || 'B', // Default B se não informado
        autoClassified: priority ? false : true, // Se usuário escolheu, não é auto
        isPrimary: priority === 'A' // Manter sincronizado (DEPRECATED)
      }
    });

    return NextResponse.json({ raceGoal }, { status: 201 });
  } catch (error) {
    console.error('Error creating race goal:', error);
    return NextResponse.json({ error: 'Erro ao criar corrida' }, { status: 500 });
  }
}
