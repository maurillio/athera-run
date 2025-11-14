'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Trophy, Target } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';
import UserDropdown from './user-dropdown';
import LanguageSwitcher from './i18n/LanguageSwitcher';

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations('header');
  
  // Extract locale from pathname (e.g., /pt-BR/dashboard -> pt-BR)
  const locale = pathname.split('/')[1] || 'pt-BR';
  
  const navigation = [
    { name: t('navigation.dashboard'), href: `/${locale}/dashboard`, icon: Trophy },
    { name: t('navigation.plano'), href: `/${locale}/plano`, icon: Calendar },
    { name: t('navigation.treinos'), href: `/${locale}/tracking`, icon: Target },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}/dashboard`} className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg shadow-lg">
              <span className="text-white font-bold text-base">AR</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                {t('brand')}
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">{t('tagline')}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent",
                    isActive 
                      ? "bg-orange-50 text-orange-700 font-medium" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex lg:hidden">
              <select 
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
                value={pathname}
                onChange={(e) => window.location.href = e.target.value}
                aria-label={t('mobileSelect')}
              >
                {navigation.map((item) => (
                  <option key={item.name} value={item.href}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <LanguageSwitcher />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
