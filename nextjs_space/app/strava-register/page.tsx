'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react';

function StravaRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stravaAthleteId, setStravaAthleteId] = useState('');

  useEffect(() => {
    const athleteId = searchParams?.get('athleteId');
    const profileId = searchParams?.get('profileId');

    console.log('[STRAVA-REGISTER] Iniciando:');
    console.log('[STRAVA-REGISTER]  - athleteId:', athleteId);
    console.log('[STRAVA-REGISTER]  - profileId:', profileId);

    if (athleteId) {
      setStravaAthleteId(athleteId);
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!email) {
      setError('Email é obrigatório');
      return false;
    }

    if (!password) {
      setError('Senha é obrigatória');
      return false;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('[STRAVA-REGISTER] Salvando cadastro com email:', email);

      const response = await fetch('/api/strava/complete-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          stravaAthleteId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erro ao completar cadastro');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[STRAVA-REGISTER] Cadastro completado com sucesso!');
      console.log('[STRAVA-REGISTER] Perfil de atleta está vinculado para treinos');
      console.log('[STRAVA-REGISTER] Fazendo login automático...');

      // Fazer login automático com as credenciais que acabou de cadastrar
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      console.log('[STRAVA-REGISTER] Resultado do login:', signInResult?.ok);

      if (signInResult?.ok) {
        // Login bem-sucedido, redirecionar para o destino correto
        console.log('[STRAVA-REGISTER] Login bem-sucedido, redirecionando para:', data.redirectTo);
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(data.redirectTo);
      } else {
        // Se o login falhar, ainda redirecionar para o destino
        // (o usuário está com credenciais válidas, pode fazer login manual depois)
        console.error('[STRAVA-REGISTER] Login automático falhou, mas credenciais foram salvas');
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(data.redirectTo);
      }
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      setError('Erro ao completar cadastro. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-blue-600 rounded-xl shadow-lg">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold">Completar Cadastro Strava</CardTitle>
          <div className="text-center space-y-2">
            <CardDescription>Sua conta Strava já está vinculada para seus treinos! 🎉</CardDescription>
            <p className="text-sm text-muted-foreground">Agora crie uma senha para sua conta e faça login com email também</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Completar Cadastro'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center text-muted-foreground w-full">
            Você poderá fazer login com email e senha após este cadastro
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function StravaRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <StravaRegisterContent />
    </Suspense>
  );
}
