/**
 * API ROUTE: Sync All Strava Data
 * POST /api/strava/sync-all - Importar todos os dados avançados do Strava
 * 
 * Importa: Stats, PRs, Gear
 * PREMIUM ONLY
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importStravaStats } from '@/lib/strava-stats';
import { importStravaPRs } from '@/lib/strava-prs';
import { importStravaGear } from '@/lib/strava-gear';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPremium: true,
        athleteProfile: {
          select: {
            id: true,
            stravaConnected: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: 'Recurso disponível apenas para usuários premium' },
        { status: 403 }
      );
    }

    if (!user.athleteProfile?.stravaConnected) {
      return NextResponse.json(
        { error: 'Strava não conectado' },
        { status: 400 }
      );
    }

    const results = {
      stats: { success: false, error: null as string | null },
      prs: { success: false, error: null as string | null },
      gear: { success: false, error: null as string | null }
    };

    // Importar Stats
    try {
      await importStravaStats(user.id, user.athleteProfile.id);
      results.stats.success = true;
    } catch (error: any) {
      console.error('Erro ao importar stats:', error);
      results.stats.error = error.message;
    }

    // Importar PRs
    try {
      await importStravaPRs(user.id, user.athleteProfile.id);
      results.prs.success = true;
    } catch (error: any) {
      console.error('Erro ao importar PRs:', error);
      results.prs.error = error.message;
    }

    // Importar Gear
    try {
      await importStravaGear(user.id, user.athleteProfile.id);
      results.gear.success = true;
    } catch (error: any) {
      console.error('Erro ao importar gear:', error);
      results.gear.error = error.message;
    }

    const allSuccess = results.stats.success && results.prs.success && results.gear.success;

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? 'Todos os dados importados com sucesso' 
        : 'Alguns dados não puderam ser importados',
      results
    });

  } catch (error: any) {
    console.error('Erro ao sincronizar dados:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar dados' },
      { status: 500 }
    );
  }
}
