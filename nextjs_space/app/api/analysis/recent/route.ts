
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true },
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ analyses: [] }, { status: 200 });
    }

    // Buscar últimas 10 análises
    const analyses = await prisma.aIAnalysis.findMany({
      where: {
        athleteId: user.athleteProfile.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      analyses: analyses,
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json({ error: 'Erro ao buscar análises' }, { status: 500 });
  }
}
