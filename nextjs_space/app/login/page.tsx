
'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Chrome } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Check for OAuth errors in URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        'OAuthSignin': 'Erro ao iniciar autenticação com o provedor',
        'OAuthCallback': 'Erro ao processar resposta do provedor',
        'OAuthCreateAccount': 'Erro ao criar conta com o provedor',
        'EmailCreateAccount': 'Erro ao criar conta com email',
        'Callback': 'Erro no callback de autenticação',
        'OAuthAccountNotLinked': 'Este email já está associado a outro método de login',
        'EmailSignin': 'Erro ao enviar email de verificação',
        'CredentialsSignin': 'Credenciais inválidas',
        'SessionRequired': 'Você precisa estar logado para acessar esta página',
        'Default': 'Erro ao fazer login. Tente novamente.'
      };
      setError(errorMessages[errorParam] || errorMessages['Default']);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha incorretos');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true,
      });

      if (result?.error) {
        console.error('Google sign in error:', result.error);
        setError('Erro ao fazer login com Google. Verifique suas credenciais.');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign in exception:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
      setIsGoogleLoading(false);
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
          <CardTitle className="text-2xl text-center font-bold">Bem-vindo de volta!</CardTitle>
          <CardDescription className="text-center">
            Entre para continuar seu treinamento
          </CardDescription>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou continue com
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
