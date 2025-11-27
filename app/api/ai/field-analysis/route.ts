/**
 * AI Field Analysis API - v2.8.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  getFieldUsageForPlan, 
  calculateCompletenessScore,
} from '@/lib/ai-field-tracking';
import { AI_FIELD_CONFIGS } from '@/types/ai-transparency';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        athleteProfile: {
          include: {
            customPlan: true
          }
        }
      },
    });

    if (!user || !user.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    const profile = user.athleteProfile;
    const activePlans = profile.customPlan?.filter(p => p.isActive).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    const activePlan = activePlans?.[0];

    if (!activePlan) {
      return NextResponse.json({
        success: true,
        completenessScore: 0,
        fieldsUsed: [],
        fieldsMissing: [],
        fieldsConflicting: [],
        recommendations: ['Gere seu primeiro plano de treino'],
      });
    }

    const trackedFields = await getFieldUsageForPlan(user.id, activePlan.id);
    const fieldsUsed = trackedFields.filter(f => f.wasUsed).map(f => ({
      fieldName: f.fieldName,
      label: AI_FIELD_CONFIGS.find(c => c.field === f.fieldName)?.label || f.fieldName,
      value: f.fieldValue,
      importance: f.importance,
      impact: f.impact,
      howUsed: f.howUsed,
    }));

    const fieldsMissing = trackedFields.filter(f => !f.wasUsed).map(f => ({
      fieldName: f.fieldName,
      label: AI_FIELD_CONFIGS.find(c => c.field === f.fieldName)?.label || f.fieldName,
      importance: f.importance,
      impact: f.impact,
      howUsed: f.howUsed,
    }));

    const completenessScore = calculateCompletenessScore(trackedFields);

    return NextResponse.json({
      success: true,
      completenessScore,
      fieldsUsed,
      fieldsMissing,
      fieldsConflicting: [],
      recommendations: completenessScore >= 70 
        ? ['👍 Perfil completo! IA pode gerar planos personalizados.']
        : ['⚠️ Complete seu perfil para melhor personalização.'],
    });

  } catch (error) {
    console.error('[FIELD ANALYSIS] Error:', error);
    return NextResponse.json({ error: 'Erro ao analisar campos' }, { status: 500 });
  }
}
