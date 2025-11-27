
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile || !profile.experienceDescription) {
      return NextResponse.json(
        { error: 'Descrição de experiência não encontrada' },
        { status: 404 }
      );
    }

    // Simular análise de IA (em produção, usar API de IA real)
    const analysis = `
## Análise da Sua Experiência

Com base na sua descrição, identificamos os seguintes pontos:

### Pontos Fortes
- Você demonstra consistência no treinamento
- Tem experiência com diferentes distâncias
- Conhece seus limites e capacidades

### Áreas de Atenção
- Continue progredindo gradualmente
- Mantenha foco na prevenção de lesões
- Considere trabalhar aspectos específicos identificados

### Recomendações
- Plano personalizado baseado no seu histórico
- Foco em desenvolvimento progressivo
- Monitoramento contínuo de performance

*Esta análise foi gerada automaticamente com base nas suas informações.*
    `.trim();

    // Salvar análise no perfil
    await prisma.athleteProfile.update({
      where: { id: profile.id },
      data: { experienceAnalysis: analysis }
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing experience:', error);
    return NextResponse.json({ error: 'Erro ao analisar experiência' }, { status: 500 });
  }
}
