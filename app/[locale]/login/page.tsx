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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  
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
        'OAuthSignin': t.errors?.oauthSignin || 'OAuth signin error',
        'OAuthCallback': t.errors?.oauthCallback || 'OAuth callback error',
        'OAuthCreateAccount': t.errors?.oauthCreateAccount || 'OAuth create account error',
        'EmailCreateAccount': t.errors?.emailCreateAccount || 'Email create account error',
        'Callback': t.errors?.callback || 'Callback error',
        'OAuthAccountNotLinked': t.errors?.accountLinked || 'Account already linked',
        'EmailSignin': t.errors?.emailSignin || 'Email signin error',
        'CredentialsSignin': t.errors?.invalidCredentials || 'Invalid credentials',
        'SessionRequired': t.errors?.sessionRequired || 'Session required',
        'Default': t.errors?.default || 'An error occurred'
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
        setError(t.auth?.login?.invalidCredentials || 'Invalid credentials');
        setIsLoading(false);
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (error) {
      setError(t.errors?.default || 'An error occurred');
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
        setError(t.auth?.login?.googleError || 'Google sign in error');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign in exception:', error);
      setError(t.auth?.login?.googleError || 'Google sign in error');
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
          <CardTitle className="text-2xl text-center font-bold">
            {t.auth?.login?.title || 'Welcome back!'}
          </CardTitle>
          <CardDescription className="text-center">
            {t.auth?.login?.subtitle || 'Sign in to continue your training'}
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
              <Label htmlFor="email">{t.auth?.login?.email || 'Email'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth?.login?.emailPlaceholder || 'your@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth?.login?.password || 'Password'}</Label>
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
                  {t.auth?.login?.signingIn || 'Signing in...'}
                </>
              ) : (
                t.auth?.login?.signIn || 'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.auth?.login?.orContinueWith || 'or continue with'}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full max-w-xs"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  {t.auth?.login?.googleSignIn || 'Google'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            {t.auth?.login?.noAccount || "Don't have an account?"}{' '}
            <Link href={`/${locale}/signup`} className="text-orange-600 hover:text-orange-700 font-medium">
              {t.auth?.login?.signUpLink || 'Sign up'}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-sm text-muted-foreground">{t.loading?.generic || 'Loading...'}</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
