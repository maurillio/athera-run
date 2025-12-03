import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate, includeSuggestions, includeAnalytics } = body;

    // Buscar perfil do atleta
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Buscar ajustes no período
    const adjustments = await prisma.workoutAdjustment.findMany({
      where: {
        athleteProfileId: profile.id,
        adjustedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        originalWorkout: true,
        completedWorkout: true
      },
      orderBy: { adjustedAt: 'desc' }
    });

    // Buscar decisões
    const decisions = await prisma.workoutMatchDecision.findMany({
      where: {
        athleteProfileId: profile.id,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Analytics
    const analytics = includeAnalytics ? {
      totalAdjustments: adjustments.length,
      acceptedSuggestions: decisions.filter(d => d.decision === 'accept').length,
      rejectedSuggestions: decisions.filter(d => d.decision === 'reject').length,
      autoApplied: adjustments.filter(a => a.autoApplied).length,
      avgConfidence: adjustments.reduce((acc, a) => acc + (a.confidence || 0), 0) / (adjustments.length || 1)
    } : null;

    // Gerar relatório em formato estruturado
    const report = {
      metadata: {
        athleteId: profile.id,
        athleteName: `${profile.firstName} ${profile.lastName}`,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString()
      },
      summary: {
        totalAdjustments: adjustments.length,
        totalDecisions: decisions.length,
        ...analytics
      },
      adjustments: adjustments.map(adj => ({
        id: adj.id,
        date: adj.adjustedAt.toISOString(),
        reason: adj.reason,
        confidence: adj.confidence,
        autoApplied: adj.autoApplied,
        original: {
          type: adj.originalWorkout?.workoutType,
          subtype: adj.originalWorkout?.workoutSubtype,
          date: adj.originalWorkout?.date
        },
        adjustment: {
          originalDate: adj.originalDate?.toISOString(),
          newDate: adj.newDate?.toISOString(),
          originalType: adj.originalType,
          newType: adj.newType
        }
      })),
      decisions: includeSuggestions ? decisions.map(dec => ({
        id: dec.id,
        date: dec.createdAt.toISOString(),
        decision: dec.decision,
        confidence: dec.confidence,
        mlPrediction: dec.mlPrediction,
        finalDecision: dec.finalDecision
      })) : []
    };

    // Por enquanto, retornar JSON estruturado
    // No futuro, adicionar geração de PDF real com bibliotecas como jsPDF ou puppeteer
    return NextResponse.json({
      success: true,
      report,
      downloadUrl: null, // Implementar PDF real em próxima versão
      format: 'json' // Por enquanto retorna JSON
    });

  } catch (error) {
    console.error('[Export PDF] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
