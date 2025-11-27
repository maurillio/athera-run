import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { consentType, version = '1.0' } = await req.json();
    
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await prisma.$executeRaw`
      INSERT INTO user_consents (user_id, consent_type, version, ip_address, user_agent)
      VALUES (${session.user.id}, ${consentType}, ${version}, ${ipAddress}, ${userAgent})
      ON CONFLICT (user_id, consent_type, version) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONSENT] Erro:', error);
    return NextResponse.json({ error: 'Erro ao registrar consentimento' }, { status: 500 });
  }
}
