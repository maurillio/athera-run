'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function SignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('signupError'));
        setIsLoading(false);
        return;
      }

      // Auto-login after signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('loginError'));
        setIsLoading(false);
      } else {
        router.push(locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`);
        router.refresh();
      }
    } catch (error) {
      setError(t('signupError'));
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signIn('google', {
        callbackUrl: locale === 'pt-BR' ? '/onboarding' : `/${locale}/onboarding`,
        redirect: true,
      });
    } catch (error) {
      setError(t('signupError'));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-2">{t('createAccount')}</h2>
        <p className="text-center text-gray-600 mb-6">{t('signup')}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              {locale === 'pt-BR' ? 'Nome' : locale === 'en-US' ? 'Name' : 'Nombre'}
            </label>
            <input
              id="name"
              type="text"
              placeholder={locale === 'pt-BR' ? 'Seu nome' : locale === 'en-US' ? 'Your name' : 'Tu nombre'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">{t('email')}</label>
            <input
              id="email"
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">{t('password')}</label>
            <input
              id="password"
              type="password"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {locale === 'pt-BR' ? 'Mínimo 6 caracteres' : locale === 'en-US' ? 'Minimum 6 characters' : 'Mínimo 6 caracteres'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : t('signup')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {isGoogleLoading ? 'Loading...' : t('signupWithGoogle')}
        </button>

        <p className="text-sm text-center text-gray-600 mt-6">
          {t('hasAccount')}{' '}
          <Link href={locale === 'pt-BR' ? '/login' : `/${locale}/login`} className="text-blue-600 hover:underline font-medium">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
