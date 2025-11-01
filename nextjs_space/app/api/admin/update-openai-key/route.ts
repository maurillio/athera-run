
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { exec } from 'child_process';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Autenticação e Autorização (apenas admins)
    if (!session?.user?.email || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Não autorizado', message: 'Você não tem permissão para realizar esta ação.' }, { status: 403 });
    }

    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da API ausente', message: 'Por favor, forneça uma chave da API.' }, { status: 400 });
    }

    // 2. Atualizar variável de ambiente PM2
    // Usamos pm2 set para atualizar a variável de ambiente para o processo 'athera-run'
    // e pm2 restart para aplicar a mudança.
    const pm2SetCommand = `pm2 set athera-run:OPENAI_API_KEY "${apiKey}"`;
    const pm2RestartCommand = `pm2 restart athera-run`;

    console.log('[ADMIN API] Executando comando PM2 para atualizar API Key...');
    
    await new Promise<void>((resolve, reject) => {
      exec(pm2SetCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ADMIN API] Erro ao executar pm2 set: ${error.message}`);
          console.error(`[ADMIN API] pm2 set stdout: ${stdout}`);
          console.error(`[ADMIN API] pm2 set stderr: ${stderr}`);
          return reject(new Error(`Falha ao definir a chave da API: ${stderr || error.message}`));
        }
        console.log(`[ADMIN API] pm2 set stdout: ${stdout}`);
        console.log(`[ADMIN API] pm2 set stderr: ${stderr}`);
        resolve();
      });
    });

    console.log('[ADMIN API] Chave da API definida. Reiniciando aplicação PM2...');

    await new Promise<void>((resolve, reject) => {
      exec(pm2RestartCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`[ADMIN API] Erro ao executar pm2 restart: ${error.message}`);
          console.error(`[ADMIN API] pm2 restart stdout: ${stdout}`);
          console.error(`[ADMIN API] pm2 restart stderr: ${stderr}`);
          return reject(new Error(`Falha ao reiniciar a aplicação: ${stderr || error.message}`));
        }
        console.log(`[ADMIN API] pm2 restart stdout: ${stdout}`);
        console.log(`[ADMIN API] pm2 restart stderr: ${stderr}`);
        resolve();
      });
    });

    console.log('[ADMIN API] Aplicação PM2 reiniciada com sucesso.');

    return NextResponse.json({ success: true, message: 'Chave da API OpenAI atualizada e aplicação reiniciada com sucesso!' });

  } catch (error) {
    console.error('[ADMIN API] Erro na rota de atualização da API Key:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor', 
      message: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao atualizar a chave da API.'
    }, { status: 500 });
  }
}
