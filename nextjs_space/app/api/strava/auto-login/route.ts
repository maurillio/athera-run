import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    console.log('[STRAVA-AUTO-LOGIN] Auto-login iniciado:', { userId, email });

    if (!userId || !email) {
      console.error('[STRAVA-AUTO-LOGIN] Parâmetros ausentes');
      return NextResponse.redirect(new URL('/login?error=missing_params', request.nextUrl.origin));
    }

    // Validar que o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.email !== email) {
      console.error('[STRAVA-AUTO-LOGIN] Usuário não encontrado ou email não corresponde');
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.nextUrl.origin));
    }

    console.log('[STRAVA-AUTO-LOGIN] Usuário validado, redirecionando para dashboard');

    // Redirecionar direto para dashboard
    // A sessão será restaurada pelo middleware/layout ao verificar cookies
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const response = NextResponse.redirect(new URL('/dashboard', baseUrl));

    return response;
  } catch (error) {
    console.error('[STRAVA-AUTO-LOGIN] Erro:', error);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    return NextResponse.redirect(new URL('/login?error=auto_login_error', baseUrl));
  }
}
