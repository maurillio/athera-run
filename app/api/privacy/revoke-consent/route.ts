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

    const { consentType } = await req.json();
    
    if (!consentType) {
      return NextResponse.json({ error: 'consentType é obrigatório' }, { status: 400 });
    }

    // Validar tipos que podem ser revogados
    const revocableTypes = ['health_data', 'strava', 'marketing'];
    if (!revocableTypes.includes(consentType)) {
      return NextResponse.json({ 
        error: 'Este tipo de consentimento não pode ser revogado (obrigatório para o serviço)' 
      }, { status: 400 });
    }

    console.log(`[REVOKE] Revogando ${consentType} para usuário ${session.user.id}`);

    // Marcar como revogado
    await prisma.$executeRaw`
      UPDATE user_consents 
      SET revoked_at = NOW() 
      WHERE user_id = ${session.user.id} 
        AND consent_type = ${consentType}
        AND revoked_at IS NULL
    `;

    // Se for dados de saúde, apagar campos sensíveis
    if (consentType === 'health_data') {
      const profile = await prisma.athleteProfile.findUnique({
        where: { userId: session.user.id }
      });

      if (profile) {
        await prisma.athleteProfile.update({
          where: { id: profile.id },
          data: {
            injuries: null,
            medicalConditions: null,
            medications: null,
            injuryDetails: null,
            tracksMenstrualCycle: false,
            lastPeriodDate: null,
            avgCycleLength: null,
            currentlyInjured: false,
            restingHeartRate: null,
            sleepQuality: null,
            stressLevel: null
          }
        });
        
        console.log('[REVOKE] Dados de saúde apagados com sucesso');
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Consentimento ${consentType} revogado com sucesso`,
      dataDeleted: consentType === 'health_data'
    });
  } catch (error) {
    console.error('[REVOKE] Erro:', error);
    return NextResponse.json({ error: 'Erro ao revogar consentimento' }, { status: 500 });
  }
}
