
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Atualizar status de premium/admin do usuário
export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId } = params;
    const body = await req.json();
    const { isPremium, isAdmin, subscriptionEndDate } = body;

    // Não permitir remover admin de si mesmo
    if (userId === currentUser.id && isAdmin === false) {
      return NextResponse.json(
        { error: 'Você não pode remover seu próprio acesso de admin' },
        { status: 400 }
      );
    }

    // Atualizar o usuário
    const updateData: any = {};
    
    if (typeof isPremium === 'boolean') {
      updateData.isPremium = isPremium;
      updateData.subscriptionStatus = isPremium ? 'active' : null;
    }
    
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin;
    }
    
    if (subscriptionEndDate) {
      updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      }
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE: Deletar usuário
export async function DELETE(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se o usuário é admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { userId } = params;

    // Não permitir deletar a si mesmo
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta' },
        { status: 400 }
      );
    }

    // Deletar o usuário (cascade deleta profile, workouts, etc)
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 }
    );
  }
}
