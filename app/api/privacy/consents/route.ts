import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const consents = await prisma.$queryRaw`
      SELECT 
        id,
        consent_type as "consentType",
        version,
        consented_at as "consentedAt",
        revoked_at as "revokedAt",
        ip_address as "ipAddress",
        user_agent as "userAgent"
      FROM user_consents 
      WHERE user_id = ${session.user.id}
      ORDER BY consented_at DESC
    ` as any[];

    const formattedConsents = consents.map(c => ({
      id: c.id,
      type: c.consentType,
      version: c.version,
      consentedAt: c.consentedAt,
      isActive: !c.revokedAt,
      revokedAt: c.revokedAt,
      canRevoke: ['health_data', 'strava', 'marketing'].includes(c.consentType),
      metadata: {
        ipAddress: c.ipAddress,
        userAgent: c.userAgent ? c.userAgent.substring(0, 50) : null
      }
    }));

    return NextResponse.json({ 
      success: true,
      consents: formattedConsents,
      total: formattedConsents.length,
      active: formattedConsents.filter(c => c.isActive).length
    });
  } catch (error) {
    console.error('[CONSENTS] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar consentimentos' }, { status: 500 });
  }
}
