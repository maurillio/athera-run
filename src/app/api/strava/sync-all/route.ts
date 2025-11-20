import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const results: any = {
      stats: { success: false, error: null },
      gear: { success: false, error: null },
      prs: { success: false, error: null },
      zones: { success: false, error: null },
    };

    // Importar estatísticas
    try {
      const statsResponse = await fetch(`${baseUrl}/api/strava/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
      });
      const statsData = await statsResponse.json();
      results.stats = { success: statsResponse.ok, data: statsData };
    } catch (error: any) {
      results.stats.error = error.message;
    }

    // Importar equipamentos
    try {
      const gearResponse = await fetch(`${baseUrl}/api/strava/gear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
      });
      const gearData = await gearResponse.json();
      results.gear = { success: gearResponse.ok, data: gearData };
    } catch (error: any) {
      results.gear.error = error.message;
    }

    // Importar PRs
    try {
      const prsResponse = await fetch(`${baseUrl}/api/strava/prs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
      });
      const prsData = await prsResponse.json();
      results.prs = { success: prsResponse.ok, data: prsData };
    } catch (error: any) {
      results.prs.error = error.message;
    }

    // Zonas - não implementado ainda
    results.zones = { success: true, data: { message: 'Zonas não implementadas ainda' } };

    const allSuccess = Object.values(results).every((r: any) => r.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess
        ? 'Todos os dados do Strava foram sincronizados com sucesso'
        : 'Alguns dados não puderam ser sincronizados',
      results,
    });
  } catch (error: any) {
    console.error('[STRAVA SYNC ALL] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na sincronização' },
      { status: 500 }
    );
  }
}
