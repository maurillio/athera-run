import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * API: PUT /api/profile/location
 * 
 * Salva localização do usuário no perfil.
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { city, latitude, longitude } = await request.json();

    if (!city || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Dados inválidos. Forneça city, latitude e longitude' },
        { status: 400 }
      );
    }

    // Atualizar perfil
    const profile = await prisma.athleteProfile.update({
      where: { userId: session.user.id },
      data: {
        city,
        latitude,
        longitude,
        lastLocationUpdate: new Date(),
      },
      select: {
        city: true,
        latitude: true,
        longitude: true,
        lastLocationUpdate: true,
      },
    });

    console.log('[Location] Saved:', { userId: session.user.id, city, latitude, longitude });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[Location] Save error:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar localização' },
      { status: 500 }
    );
  }
}
