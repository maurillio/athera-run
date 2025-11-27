import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar TODOS os dados para exportação
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        athleteProfile: {
          include: {
            raceGoals: true,
            completedWorkouts: {
              orderBy: { date: 'desc' }
            }
          }
        },
        subscription: true,
        accounts: {
          select: {
            provider: true,
            type: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar consentimentos
    const consents = await prisma.$queryRaw`
      SELECT * FROM user_consents WHERE user_id = ${session.user.id}
    `;

    // Remover senha do export
    const { password, ...userWithoutPassword } = user as any;

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      lgpd_version: '1.0',
      format: 'JSON',
      data: {
        user: userWithoutPassword,
        consents,
        metadata: {
          export_type: 'full',
          total_records: 1 + (user.athleteProfile?.raceGoals?.length || 0) + (user.athleteProfile?.completedWorkouts?.length || 0)
        }
      }
    };

    const filename = `athera-run-dados-${session.user.id}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-LGPD-Export': 'true'
      }
    });
  } catch (error) {
    console.error('[EXPORT] Erro:', error);
    return NextResponse.json({ error: 'Erro ao exportar dados' }, { status: 500 });
  }
}
