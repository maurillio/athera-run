'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';

export default function SignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.signup');
  const tErrors = useTranslations('errors');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // LGPD - Consentimentos
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // LGPD - Validar consentimentos
    if (!acceptedTerms) {
      setError('Você deve aceitar os Termos de Uso e Política de Privacidade para continuar');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || tErrors('default'));
        setIsLoading(false);
        return;
      }

      // Registrar consentimentos LGPD
      try {
        await fetch('/api/consent/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consentType: 'terms', version: '1.0' }),
        });
        
        await fetch('/api/consent/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consentType: 'privacy', version: '1.0' }),
        });
      } catch (consentError) {
        console.error('Erro ao registrar consentimentos:', consentError);
        // Não bloqueia o cadastro se falhar
      }

      // Auto-login após cadastro
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('errors.accountCreatedError'));
        setIsLoading(false);
      } else {
        router.push(`/${locale}/onboarding`);
        router.refresh();
      }
    } catch (error) {
      setError(tErrors('default'));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { 
        callbackUrl: `/${locale}/onboarding`,
        redirect: true,
      });
    } catch (error) {
      setError(t('errors.googleError'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <Card className="transition-all duration-200 hover:shadow-elevation-3 hover:-translate-y-0.5 w-full max-w-md border-slate-200 shadow-elevation-2">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-elevation-2">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-slate-900">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full max-w-xs border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  {t('googleSignUp')}
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                {t('orSignUpWith')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">{t('name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
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
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            {/* LGPD - Consentimentos Obrigatórios */}
            <div className="space-y-3 border-t pt-4 mt-4">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required
                  disabled={isLoading}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Li e aceito os{' '}
                  <a 
                    href={`/${locale}/terms-of-service`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    Termos de Uso
                  </a>
                  {' '}e a{' '}
                  <a 
                    href={`/${locale}/privacy-policy`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    Política de Privacidade
                  </a>
                  {' '}*
                </span>
              </label>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-blue-900">
                <strong>🔒 Seus direitos (LGPD):</strong> Você pode acessar, corrigir, exportar ou excluir 
                seus dados a qualquer momento através do seu perfil.
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('creatingAccount')}
                </>
              ) : (
                t('signUp')
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-orange-600 hover:text-orange-700 font-medium">
              {t('signInLink')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
