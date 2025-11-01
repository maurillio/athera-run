
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testLLMConnection } from '@/lib/llm-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Autenticação e Autorização (apenas admins)
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json({ success: false, message: 'Não autorizado', status: 'disconnected' }, { status: 403 });
    }

    console.log('[ADMIN API] Verificando status da conexão OpenAI...');
    const { success, message, provider } = await testLLMConnection();
    console.log(`[ADMIN API] Status da conexão OpenAI: ${success ? 'Sucesso' : 'Falha'} (${provider}) - ${message}`);

    return NextResponse.json({ success, message, provider });

  } catch (error) {
    console.error('[ADMIN API] Erro na rota de status da API OpenAI:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao verificar o status da API.',
      status: 'disconnected'
    }, { status: 500 });
  }
}
