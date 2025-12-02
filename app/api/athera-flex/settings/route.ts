/**
 * ATHERA FLEX v3.3.0 - Settings API
 * GET/PUT para configurações de flexibilidade do usuário
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET - Buscar configurações
// ============================================================================

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Buscar ou criar settings
    let settings = await prisma.userFlexSettings.findUnique({
      where: { userId: user.id },
    });

    // Se não existe, criar com defaults
    if (!settings) {
      settings = await prisma.userFlexSettings.create({
        data: {
          userId: user.id,
          autoAdjustEnabled: false,
          autoAdjustThreshold: 90,
          notifyBeforeAdjust: true,
          emailOnAutoAdjust: true,
          emailOnSuggestion: true,
          inAppNotifications: true,
          flexibilityWindow: 3,
          allowVolumeIncrease: true,
          allowVolumeDecrease: true,
          maxVolumeVariance: 50,
          preferSameDay: false,
          autoAcceptHighConf: false,
          learningMode: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        userId: settings.userId,
        
        // Automação
        autoAdjustEnabled: settings.autoAdjustEnabled,
        autoAdjustThreshold: settings.autoAdjustThreshold,
        notifyBeforeAdjust: settings.notifyBeforeAdjust,
        
        // Notificações
        emailOnAutoAdjust: settings.emailOnAutoAdjust,
        emailOnSuggestion: settings.emailOnSuggestion,
        inAppNotifications: settings.inAppNotifications,
        
        // Flexibilidade
        flexibilityWindow: settings.flexibilityWindow,
        allowVolumeIncrease: settings.allowVolumeIncrease,
        allowVolumeDecrease: settings.allowVolumeDecrease,
        maxVolumeVariance: settings.maxVolumeVariance,
        
        // Avançado
        preferSameDay: settings.preferSameDay,
        autoAcceptHighConf: settings.autoAcceptHighConf,
        learningMode: settings.learningMode,
        
        // Meta
        isPremium: user.isPremium,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Flex Settings GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Atualizar configurações
// ============================================================================

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Buscar user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verificar Premium para features avançadas
    if (!user.isPremium) {
      // Free users: apenas configurações básicas
      if (
        body.autoAdjustEnabled ||
        body.autoAcceptHighConf ||
        body.emailOnAutoAdjust
      ) {
        return NextResponse.json(
          {
            error: 'Premium required',
            message: 'Essas configurações requerem assinatura Premium',
            premiumFeatures: [
              'autoAdjustEnabled',
              'autoAcceptHighConf',
              'emailOnAutoAdjust',
            ],
          },
          { status: 403 }
        );
      }
    }

    // Validar valores
    const errors = validateSettings(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', errors },
        { status: 400 }
      );
    }

    // Atualizar settings
    const settings = await prisma.userFlexSettings.upsert({
      where: { userId: user.id },
      update: {
        // Automação (Premium)
        ...(body.autoAdjustEnabled !== undefined && {
          autoAdjustEnabled: user.isPremium ? body.autoAdjustEnabled : false,
        }),
        ...(body.autoAdjustThreshold !== undefined && {
          autoAdjustThreshold: body.autoAdjustThreshold,
        }),
        ...(body.notifyBeforeAdjust !== undefined && {
          notifyBeforeAdjust: body.notifyBeforeAdjust,
        }),
        
        // Notificações
        ...(body.emailOnAutoAdjust !== undefined && {
          emailOnAutoAdjust: user.isPremium ? body.emailOnAutoAdjust : false,
        }),
        ...(body.emailOnSuggestion !== undefined && {
          emailOnSuggestion: body.emailOnSuggestion,
        }),
        ...(body.inAppNotifications !== undefined && {
          inAppNotifications: body.inAppNotifications,
        }),
        
        // Flexibilidade
        ...(body.flexibilityWindow !== undefined && {
          flexibilityWindow: body.flexibilityWindow,
        }),
        ...(body.allowVolumeIncrease !== undefined && {
          allowVolumeIncrease: body.allowVolumeIncrease,
        }),
        ...(body.allowVolumeDecrease !== undefined && {
          allowVolumeDecrease: body.allowVolumeDecrease,
        }),
        ...(body.maxVolumeVariance !== undefined && {
          maxVolumeVariance: body.maxVolumeVariance,
        }),
        
        // Avançado
        ...(body.preferSameDay !== undefined && {
          preferSameDay: body.preferSameDay,
        }),
        ...(body.autoAcceptHighConf !== undefined && {
          autoAcceptHighConf: user.isPremium ? body.autoAcceptHighConf : false,
        }),
        ...(body.learningMode !== undefined && {
          learningMode: body.learningMode,
        }),
      },
      create: {
        userId: user.id,
        autoAdjustEnabled: user.isPremium ? (body.autoAdjustEnabled || false) : false,
        autoAdjustThreshold: body.autoAdjustThreshold || 90,
        notifyBeforeAdjust: body.notifyBeforeAdjust ?? true,
        emailOnAutoAdjust: user.isPremium ? (body.emailOnAutoAdjust ?? true) : false,
        emailOnSuggestion: body.emailOnSuggestion ?? true,
        inAppNotifications: body.inAppNotifications ?? true,
        flexibilityWindow: body.flexibilityWindow || 3,
        allowVolumeIncrease: body.allowVolumeIncrease ?? true,
        allowVolumeDecrease: body.allowVolumeDecrease ?? true,
        maxVolumeVariance: body.maxVolumeVariance || 50,
        preferSameDay: body.preferSameDay || false,
        autoAcceptHighConf: user.isPremium ? (body.autoAcceptHighConf || false) : false,
        learningMode: body.learningMode ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      settings: {
        id: settings.id,
        userId: settings.userId,
        autoAdjustEnabled: settings.autoAdjustEnabled,
        autoAdjustThreshold: settings.autoAdjustThreshold,
        notifyBeforeAdjust: settings.notifyBeforeAdjust,
        emailOnAutoAdjust: settings.emailOnAutoAdjust,
        emailOnSuggestion: settings.emailOnSuggestion,
        inAppNotifications: settings.inAppNotifications,
        flexibilityWindow: settings.flexibilityWindow,
        allowVolumeIncrease: settings.allowVolumeIncrease,
        allowVolumeDecrease: settings.allowVolumeDecrease,
        maxVolumeVariance: settings.maxVolumeVariance,
        preferSameDay: settings.preferSameDay,
        autoAcceptHighConf: settings.autoAcceptHighConf,
        learningMode: settings.learningMode,
        isPremium: user.isPremium,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Flex Settings PUT] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function validateSettings(body: any): string[] {
  const errors: string[] = [];

  // Threshold deve estar entre 60-100
  if (
    body.autoAdjustThreshold !== undefined &&
    (body.autoAdjustThreshold < 60 || body.autoAdjustThreshold > 100)
  ) {
    errors.push('autoAdjustThreshold deve estar entre 60 e 100');
  }

  // Flexibility window deve estar entre 1-7
  if (
    body.flexibilityWindow !== undefined &&
    (body.flexibilityWindow < 1 || body.flexibilityWindow > 7)
  ) {
    errors.push('flexibilityWindow deve estar entre 1 e 7 dias');
  }

  // Max volume variance deve estar entre 20-100
  if (
    body.maxVolumeVariance !== undefined &&
    (body.maxVolumeVariance < 20 || body.maxVolumeVariance > 100)
  ) {
    errors.push('maxVolumeVariance deve estar entre 20% e 100%');
  }

  return errors;
}
