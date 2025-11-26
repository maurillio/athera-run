'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Activity, Target } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/hooks';
import UserDropdown from './user-dropdown';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import Logo from './ui/logo';

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations('header');
  
  // Extract locale from pathname (e.g., /pt-BR/dashboard -> pt-BR)
  const locale = pathname.split('/')[1] || 'pt-BR';
  
  const navigation = [
    { name: t('navigation.dashboard'), href: `/${locale}/dashboard`, icon: Activity },
    { name: t('navigation.plano'), href: `/${locale}/plano`, icon: Calendar },
    { name: t('navigation.treinos'), href: `/${locale}/tracking`, icon: Target },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-elevation-1">
      <div className="container mx-auto max-w-6xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}/dashboard`} className="group">
            <Logo size="md" showText />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-orange-50 text-brand-primary shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Navigation Select */}
            <div className="flex lg:hidden">
              <select 
                className="px-3 py-2 text-sm border-2 border-slate-300 rounded-lg bg-background focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
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
