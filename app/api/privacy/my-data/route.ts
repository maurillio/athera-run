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

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        locale: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar perfil
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    // Buscar consentimentos
    const consentsRaw = await prisma.$queryRaw`
      SELECT 
        id,
        consent_type as "consentType",
        consented_at as "consentedAt",
        version,
        revoked_at as "revokedAt"
      FROM user_consents 
      WHERE user_id = ${session.user.id}
      ORDER BY consented_at DESC
    ` as any[];

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
        consents: consentsRaw,
        stats: {
          accountAge: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          hasProfile: !!profile
        }
      }
    });
  } catch (error) {
    console.error('[MY DATA] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
