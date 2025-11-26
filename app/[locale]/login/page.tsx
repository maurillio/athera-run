'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useLocale, useTranslations } from '@/lib/i18n/hooks';
import Logo from '@/components/ui/logo';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('errors');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for OAuth errors in URL
  useEffect(() => {
    if (!mounted) return;
    
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        'OAuthSignin': tErrors('oauthSignin'),
        'OAuthCallback': tErrors('oauthCallback'),
        'OAuthCreateAccount': tErrors('oauthCreateAccount'),
        'EmailCreateAccount': tErrors('emailCreateAccount'),
        'Callback': tErrors('callback'),
        'OAuthAccountNotLinked': tErrors('accountLinked'),
        'EmailSignin': tErrors('emailSignin'),
        'CredentialsSignin': tErrors('invalidCredentials'),
        'SessionRequired': tErrors('sessionRequired'),
        'Default': tErrors('default')
      };
      setError(errorMessages[errorParam] || errorMessages['Default']);
    }
  }, [searchParams, mounted, t]);

  if (!mounted) {
    return null;
  }

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
        setError(t('invalidCredentials'));
        setIsLoading(false);
      } else {
        router.push(`/${locale}/dashboard`);
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
      const result = await signIn('google', {
        callbackUrl: `/${locale}/dashboard`,
        redirect: true,
      });

      if (result?.error) {
        console.error('Google sign in error:', result.error);
        setError(t('googleError'));
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign in exception:', error);
      setError(t('googleError'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-50 p-4">
      <Card className="w-full max-w-md shadow-elevation-3 border-slate-200">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <Logo size="lg" showText={false} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {t('subtitle')}
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
              <Label htmlFor="email" className="text-slate-700 font-medium">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
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
              <Label htmlFor="password" className="text-slate-700 font-medium">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
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
              className="w-full shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signIn')
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full border-2"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" />
                {t('googleSignIn')}
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-slate-100 pt-6">
          <div className="text-sm text-center text-slate-600">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/signup`} className="text-brand-primary hover:text-brand-primary-dark font-semibold">
              {t('signUpLink')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('errors');
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <p className="text-sm text-slate-600">{t('loading', 'common.loading')}</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
