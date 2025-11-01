
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { isPremiumUser } from '@/lib/premium-check';

// GET - Obter configuração de ajuste automático
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        athleteProfile: {
          select: {
            autoAdjustEnabled: true,
            lastAutoAdjustDate: true
          }
        }
      }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      autoAdjustEnabled: user.athleteProfile.autoAdjustEnabled,
      lastAutoAdjustDate: user.athleteProfile.lastAutoAdjustDate
    });
  } catch (error) {
    console.error('Error fetching auto-adjust settings:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

// PUT - Atualizar configuração de ajuste automático
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { autoAdjustEnabled } = body;

    if (typeof autoAdjustEnabled !== 'boolean') {
      return NextResponse.json({ error: 'autoAdjustEnabled deve ser boolean' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { athleteProfile: true }
    });

    if (!user?.athleteProfile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    // Check if user is premium before enabling auto-adjust
    if (autoAdjustEnabled) {
      const premium = await isPremiumUser(user.id);
      if (!premium) {
        return NextResponse.json({ 
          error: 'Recurso Premium',
          message: 'Auto-ajuste de treinos é exclusivo para assinantes Premium' 
        }, { status: 403 });
      }
    }

    // Atualizar configuração
    await prisma.athleteProfile.update({
      where: { id: user.athleteProfile.id },
      data: { autoAdjustEnabled }
    });

    return NextResponse.json({ 
      success: true,
      autoAdjustEnabled 
    });
  } catch (error) {
    console.error('Error updating auto-adjust settings:', error);
    return NextResponse.json({ error: 'Erro ao atualizar configurações' }, { status: 500 });
  }
}
