import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/user/preferences
 * Atualiza preferências do usuário (idioma, unidades, etc)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { locale, preferredUnits } = body;

    // Atualizar User
    const updateData: any = {};
    if (locale) updateData.locale = locale;
    if (preferredUnits) updateData.preferredUnits = preferredUnits;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        locale: true,
        preferredUnits: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('[API] Error updating user preferences:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao atualizar preferências',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
