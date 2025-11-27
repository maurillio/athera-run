
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { refreshStravaToken, fetchStravaActivities, importStravaActivity } from '@/lib/strava';
import { triggerAutoAdjustIfEnabled } from '@/lib/auto-adjust-service';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { profileId, daysBack = 90 } = await request.json();

    const profile = await prisma.athleteProfile.findUnique({
      where: { id: profileId }
    });

    if (!profile || !profile.stravaConnected) {
      return NextResponse.json(
        { error: 'Perfil não conectado ao Strava' },
        { status: 400 }
      );
    }

    // Renovar token se necessário
    const accessToken = await refreshStravaToken(profileId);

    // Buscar atividades (últimos X dias)
    const after = Math.floor(Date.now() / 1000) - (daysBack * 24 * 60 * 60);
    const activities = await fetchStravaActivities(accessToken, 1, 200);

    // Filtrar por data e importar
    const recentActivities = activities.filter((activity: any) => {
      const activityDate = new Date(activity.start_date).getTime() / 1000;
      return activityDate >= after;
    });

    let imported = 0;
    let skipped = 0;

    for (const activity of recentActivities) {
      try {
        const result = await importStravaActivity(activity, profileId);
        if (result) imported++;
      } catch (error) {
        skipped++;
        console.error('Erro ao importar atividade:', error);
      }
    }

    // Se importou pelo menos uma atividade, acionar o auto-ajuste
    if (imported > 0) {
      console.log(`✅ ${imported} atividades importadas. Verificando ajuste automático...`);
      await triggerAutoAdjustIfEnabled(profileId);
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: recentActivities.length
    });

  } catch (error) {
    console.error('Erro ao importar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao importar histórico' },
      { status: 500 }
    );
  }
}
