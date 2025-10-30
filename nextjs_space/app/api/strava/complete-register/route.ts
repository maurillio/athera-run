import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password, stravaAthleteId } = await request.json();

    if (!email || !password || !stravaAthleteId) {
      return NextResponse.json(
        { error: 'Email, senha e Strava Athlete ID são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('[STRAVA-COMPLETE-REGISTER] Completando registro:', { email, stravaAthleteId });

    // Encontrar o usuário criado pelo Strava (com email fake)
    const athleteEmail = `${stravaAthleteId}@strava.user`;
    let user = await prisma.user.findUnique({
      where: { email: athleteEmail }
    });

    if (!user) {
      console.log('[STRAVA-COMPLETE-REGISTER] Usuário Strava não encontrado:', athleteEmail);
      return NextResponse.json(
        { error: 'Usuário Strava não encontrado. Tente fazer login novamente.' },
        { status: 404 }
      );
    }

    console.log('[STRAVA-COMPLETE-REGISTER] Usuário Strava encontrado:', user.id);

    // Verificar se o email já está em uso por outro usuário
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.id !== user.id) {
      console.log('[STRAVA-COMPLETE-REGISTER] Email já está em uso por outro usuário');
      console.log('[STRAVA-COMPLETE-REGISTER] Usuário temporário ID:', user.id);
      console.log('[STRAVA-COMPLETE-REGISTER] Usuário existente ID:', existingUser.id);

      // Obter os perfis
      const stravaProfile = await prisma.athleteProfile.findUnique({
        where: { userId: user.id }
      });

      let existingProfile = await prisma.athleteProfile.findUnique({
        where: { userId: existingUser.id }
      });

      console.log('[STRAVA-COMPLETE-REGISTER] Perfil temporário ID:', stravaProfile?.id);
      console.log('[STRAVA-COMPLETE-REGISTER] Perfil existente ID:', existingProfile?.id);
      console.log('[STRAVA-COMPLETE-REGISTER] Strava conectado no perfil existente?:', existingProfile?.stravaConnected);
      console.log('[STRAVA-COMPLETE-REGISTER] StravaAthleteId no perfil existente:', existingProfile?.stravaAthleteId);

      // Limpar o usuário temporário e seus dados
      if (stravaProfile) {
        console.log('[STRAVA-COMPLETE-REGISTER] Deletando dados associados ao perfil temporário');

        // Remover todas as referências
        await prisma.completedWorkout.deleteMany({
          where: { athleteId: stravaProfile.id }
        });
        await prisma.aIAnalysis.deleteMany({
          where: { athleteId: stravaProfile.id }
        });
        await prisma.trainingLog.deleteMany({
          where: { athleteId: stravaProfile.id }
        });

        // Deletar o perfil temporário (sem o stravaAthleteId para evitar conflito de única)
        await prisma.athleteProfile.delete({
          where: { id: stravaProfile.id }
        });
        console.log('[STRAVA-COMPLETE-REGISTER] Perfil temporário deletado');
      }

      // Deletar o usuário temporário (agora sem foreign keys)
      await prisma.user.delete({
        where: { id: user.id }
      });
      console.log('[STRAVA-COMPLETE-REGISTER] Usuário temporário deletado');

      // Usar o usuário existente e atualizar a senha se fornecida
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword
        }
      });
      console.log('[STRAVA-COMPLETE-REGISTER] Usuário existente atualizado com nova senha');

      // Se o usuário existente ainda não tem Strava vinculado, vincular
      if (existingProfile) {
        console.log('[STRAVA-COMPLETE-REGISTER] Verificando se precisa vincular Strava...');

        // Só atualizar se não tem Strava vinculado OU se tem um stravaAthleteId diferente
        if (!existingProfile.stravaConnected || existingProfile.stravaAthleteId !== stravaAthleteId) {
          console.log('[STRAVA-COMPLETE-REGISTER] Vinculando/Atualizando Strava ao perfil existente');

          const updateData: any = {
            stravaConnected: true,
            stravaAthleteId: stravaAthleteId
          };

          // Só adicionar tokens se tivermos acesso a eles
          // Por enquanto usamos placeholder pois os tokens foram deletados com o perfil temporário
          if (!existingProfile.stravaAccessToken) {
            updateData.stravaAccessToken = null;
          }
          if (!existingProfile.stravaRefreshToken) {
            updateData.stravaRefreshToken = null;
          }

          await prisma.athleteProfile.update({
            where: { id: existingProfile.id },
            data: updateData
          });
          console.log('[STRAVA-COMPLETE-REGISTER] Strava vinculado ao perfil existente');
        } else {
          console.log('[STRAVA-COMPLETE-REGISTER] Strava já estava vinculado com o mesmo athleteId');
        }
      } else {
        // Usuário existente não tem perfil de atleta - criar um novo
        console.log('[STRAVA-COMPLETE-REGISTER] Criando novo perfil de atleta para usuário existente');
        existingProfile = await prisma.athleteProfile.create({
          data: {
            userId: existingUser.id,
            weight: 70,
            height: 170,
            currentVDOT: 35,
            targetTime: "4:00:00",
            goalDistance: "marathon",
            runningLevel: "intermediate",
            stravaConnected: true,
            stravaAthleteId: stravaAthleteId,
            stravaAccessToken: null,
            stravaRefreshToken: null,
            stravaTokenExpiry: null
          }
        });
        console.log('[STRAVA-COMPLETE-REGISTER] Novo perfil de atleta criado:', existingProfile.id);
      }
    } else {
      // Novo cadastro ou atualização do mesmo usuário
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          password: hashedPassword
        }
      });

      console.log('[STRAVA-COMPLETE-REGISTER] Usuário atualizado com email real:', user.email);
    }

    // Verificar e garantir que o perfil de atleta está vinculado e pronto para treinos
    let profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      console.log('[STRAVA-COMPLETE-REGISTER] ERRO: Perfil de atleta não encontrado após registro!');
      return NextResponse.json(
        { error: 'Erro ao vincular perfil de atleta' },
        { status: 500 }
      );
    }

    console.log('[STRAVA-COMPLETE-REGISTER] Perfil de atleta confirmado e vinculado:', profile.id);
    console.log('[STRAVA-COMPLETE-REGISTER] Strava conectado:', profile.stravaConnected);
    console.log('[STRAVA-COMPLETE-REGISTER] Strava Athlete ID:', profile.stravaAthleteId);

    // Determinar para onde redirecionar
    // Se tem VDOT definido (não apenas o padrão), pode ir direto para dashboard
    // Caso contrário, ir para onboarding para completar o perfil
    const redirectTo = profile && profile.currentVDOT && profile.currentVDOT > 0 ? '/dashboard' : '/onboarding';

    console.log('[STRAVA-COMPLETE-REGISTER] Cadastro completado, redirecionando para:', redirectTo);

    return NextResponse.json({
      success: true,
      message: 'Cadastro completado com sucesso!',
      redirectTo
    });
  } catch (error) {
    console.error('[STRAVA-COMPLETE-REGISTER] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao completar cadastro' },
      { status: 500 }
    );
  }
}
