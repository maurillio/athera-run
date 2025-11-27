
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Obter informações médicas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        athleteProfile: {
          select: {
            injuries: true,
            medicalConditions: true,
            medications: true,
            physicalRestrictions: true,
            weeklyAvailability: true,
          }
        }
      }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ medical: user.athleteProfile });
  } catch (error) {
    console.error('Error fetching medical info:', error);
    return NextResponse.json({ error: 'Erro ao buscar informações' }, { status: 500 });
  }
}

// PUT - Atualizar informações médicas
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { injuries, medicalConditions, medications, physicalRestrictions, weeklyAvailability } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const updated = await prisma.athleteProfile.update({
      where: { id: user.athleteProfile.id },
      data: {
        injuries,
        medicalConditions,
        medications,
        physicalRestrictions,
        weeklyAvailability: weeklyAvailability ? parseInt(weeklyAvailability) : undefined,
      }
    });

    return NextResponse.json({ medical: updated });
  } catch (error) {
    console.error('Error updating medical info:', error);
    return NextResponse.json({ error: 'Erro ao atualizar informações' }, { status: 500 });
  }
}
