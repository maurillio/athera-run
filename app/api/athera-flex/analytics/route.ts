import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/athera-flex/analytics
 * 
 * Retorna analytics reais do Athera Flex baseado em dados do banco
 * 
 * Query params:
 * - period: '7d' | '30d' | '90d' (default: '7d')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    
    // Calcular data de início baseado no período
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '7d':
      default:
        startDate.setDate(now.getDate() - 7)
        break
    }

    const userId = session.user.id

    // 1. Buscar configurações do usuário
    const flexSettings = await prisma.userFlexSettings.findUnique({
      where: { userId }
    })

    const status = flexSettings?.autoAdjustEnabled ? 'active' : 'paused'

    // 2. Buscar ajustes no período
    const adjustments = await prisma.workoutAdjustment.findMany({
      where: {
        workout: {
          planId: {
            not: null
          }
        },
        createdAt: {
          gte: startDate
        }
      },
      include: {
        workout: {
          include: {
            plan: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    })

    // Filtrar apenas ajustes do usuário atual
    const userAdjustments = adjustments.filter(
      adj => adj.workout.plan?.userId === userId
    )

    // 3. Ajustes hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const adjustmentsToday = userAdjustments.filter(
      adj => adj.createdAt >= today
    ).length

    // 4. Total de ajustes no período
    const adjustmentsWeek = userAdjustments.length

    // 5. Taxa de aceitação
    const approvedCount = userAdjustments.filter(adj => adj.approved).length
    const acceptanceRate = adjustmentsWeek > 0 
      ? Math.round((approvedCount / adjustmentsWeek) * 100)
      : 0

    // 6. Confiança ML média
    const confidenceScores = userAdjustments
      .filter(adj => adj.confidence !== null)
      .map(adj => adj.confidence || 0)
    
    const mlConfidence = confidenceScores.length > 0
      ? Math.round(
          confidenceScores.reduce((sum, score) => sum + score, 0) / 
          confidenceScores.length
        )
      : 0

    // 7. Sugestões ativas (ajustes não aprovados/rejeitados)
    const activeSuggestions = userAdjustments.filter(
      adj => !adj.approved && !adj.rejectedAt && !adj.undoneAt
    ).length

    // 8. Buscar decisões de match para calcular tempo economizado
    const matchDecisions = await prisma.workoutMatchDecision.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        },
        action: 'accepted'
      }
    })

    // Estimar tempo economizado (5 min por match aceito)
    const timeSaved = matchDecisions.length * 5

    // 9. Padrões detectados (baseado em match decisions com alta confiança)
    const patternsDetected = matchDecisions.filter(
      decision => decision.confidence >= 85
    ).length

    // 10. Montar resposta
    const analytics = {
      adjustmentsToday,
      adjustmentsWeek,
      acceptanceRate,
      mlConfidence,
      activeSuggestions,
      timeSaved,
      patternsDetected,
      status,
      period
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('❌ Error fetching Athera Flex analytics:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
