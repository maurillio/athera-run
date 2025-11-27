/**
 * API ROUTE: Strava Personal Records
 * GET /api/strava/prs - Obter PRs salvos
 * POST /api/strava/prs - Importar PRs do Strava
 * 
 * PREMIUM ONLY
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importStravaPRs, getStravaPRs } from '@/lib/strava-prs';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
          select: { stravaConnected: true }
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

    const prs = await getStravaPRs(user.id);

    return NextResponse.json({
      success: true,
      prs
    });

  } catch (error: any) {
    console.error('Erro ao buscar PRs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar recordes pessoais' },
      { status: 500 }
    );
  }
}

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

    // Importar PRs (pode demorar)
    await importStravaPRs(user.id, user.athleteProfile.id);

    const prs = await getStravaPRs(user.id);

    return NextResponse.json({
      success: true,
      message: 'Recordes pessoais importados com sucesso',
      prs
    });

  } catch (error: any) {
    console.error('Erro ao importar PRs:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar recordes pessoais' },
      { status: 500 }
    );
  }
}
