import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/profile
 * Retorna perfil completo do atleta com race goals
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar perfil com race goals
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      include: {
        raceGoals: {
          where: { status: 'active' },
          orderBy: [
            { priority: 'asc' },
            { raceDate: 'asc' },
          ],
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Atualiza perfil do atleta
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Atualizar perfil
    const updatedProfile = await prisma.athleteProfile.update({
      where: { userId: user.id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        raceGoals: {
          where: { status: 'active' },
          orderBy: [
            { priority: 'asc' },
            { raceDate: 'asc' },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile
 * Deleta perfil do atleta (soft delete - marca como inativo)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - marca race goals como archived
    await prisma.raceGoal.updateMany({
      where: { 
        athlete: { userId: user.id },
        status: 'active',
      },
      data: { status: 'archived' },
    });

    // Limpa dados sensíveis mas mantém histórico
    await prisma.athleteProfile.update({
      where: { userId: user.id },
      data: {
        stravaAccessToken: null,
        stravaRefreshToken: null,
        stravaTokenExpiry: null,
        medicalConditions: null,
        medications: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil arquivado com sucesso',
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar perfil' },
      { status: 500 }
    );
  }
}
