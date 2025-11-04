'use client';

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
  const t = useTranslations();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth?.signup?.passwordMismatch || 'Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t.auth?.signup?.passwordTooShort || 'Password must be at least 6 characters');
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
        setError(data.error || t.errors?.default || 'Error creating account');
        setIsLoading(false);
        return;
      }

      // Auto-login após cadastro
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.auth?.signup?.accountCreatedError || 'Account created but login failed');
        setIsLoading(false);
      } else {
        router.push(`/${locale}/onboarding`);
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
      await signIn('google', { 
        callbackUrl: `/${locale}/onboarding`,
        redirect: true,
      });
    } catch (error) {
      setError(t.auth?.signup?.googleError || 'Google sign up error');
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
            {t.auth?.signup?.title || 'Create your account'}
          </CardTitle>
          <CardDescription className="text-center">
            {t.auth?.signup?.subtitle || 'Start your marathon journey'}
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
              className="w-full max-w-xs"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  {t.auth?.signup?.googleSignUp || 'Google'}
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t.auth?.signup?.orSignUpWith || 'or sign up with email'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.auth?.signup?.name || 'Full Name'}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t.auth?.signup?.namePlaceholder || 'John Doe'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth?.signup?.email || 'Email'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth?.signup?.emailPlaceholder || 'your@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth?.signup?.password || 'Password'}</Label>
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
              <Label htmlFor="confirmPassword">{t.auth?.signup?.confirmPassword || 'Confirm Password'}</Label>
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.auth?.signup?.creatingAccount || 'Creating account...'}
                </>
              ) : (
                t.auth?.signup?.signUp || 'Create account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            {t.auth?.signup?.hasAccount || 'Already have an account?'}{' '}
            <Link href={`/${locale}/login`} className="text-orange-600 hover:text-orange-700 font-medium">
              {t.auth?.signup?.signInLink || 'Sign in'}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
