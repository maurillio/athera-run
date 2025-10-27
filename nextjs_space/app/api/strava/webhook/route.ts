
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { refreshStravaToken, importStravaActivity } from '@/lib/strava';
import { triggerAutoAdjustIfEnabled } from '@/lib/auto-adjust-service';

export const dynamic = "force-dynamic";

// GET - Validação do webhook (Strava envia isso para verificar o endpoint)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook validation request:', { mode, token, challenge });

  // Verificar se é uma requisição de validação válida
  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    console.log('Webhook validation successful');
    return NextResponse.json({ 'hub.challenge': challenge });
  }

  console.log('Webhook validation failed');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST - Receber eventos do Strava
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    
    console.log('Webhook event received:', event);
    
    // Eventos possíveis: create, update, delete
    // object_type: activity, athlete
    
    if (event.object_type !== 'activity') {
      return NextResponse.json({ success: true });
    }

    const { aspect_type, object_id, owner_id } = event;

    // Buscar perfil do atleta
    const profile = await prisma.athleteProfile.findFirst({
      where: { stravaAthleteId: owner_id.toString() }
    });

    if (!profile) {
      console.log('Perfil não encontrado para athlete_id:', owner_id);
      return NextResponse.json({ success: true });
    }

    if (aspect_type === 'create') {
      // Renovar token se necessário
      const accessToken = await refreshStravaToken(profile.id);
      
      // Buscar detalhes da atividade do Strava
      const activityResponse = await fetch(
        `https://www.strava.com/api/v3/activities/${object_id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!activityResponse.ok) {
        console.error('Erro ao buscar atividade do Strava');
        return NextResponse.json({ success: true });
      }

      const activity = await activityResponse.json();

      // Importar atividade usando a função helper
      await importStravaActivity(activity, profile.id);

      console.log('Atividade importada do Strava via webhook:', object_id);

      // Disparar ajuste automático em background (não aguarda)
      triggerAutoAdjustIfEnabled(profile.id).catch(err => 
        console.error('Auto-adjust error:', err)
      );
    } else if (aspect_type === 'delete') {
      // Deletar treino se existir
      await prisma.completedWorkout.deleteMany({
        where: {
          athleteId: profile.id,
          stravaActivityId: object_id.toString()
        }
      });

      console.log('Atividade deletada via webhook:', object_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ success: true }); // Sempre retornar 200 para o Strava
  }
}
