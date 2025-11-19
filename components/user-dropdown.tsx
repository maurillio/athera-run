
'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, Shield, LogOut, Loader2, Crown } from 'lucide-react';
import { useState } from 'react';
import { usePremium } from '@/hooks/use-premium';
import PremiumBadge from '@/components/subscription/premium-badge';
import { useTranslations } from '@/lib/i18n/hooks';

export default function UserDropdown() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
  const { isPremium, status: subscriptionStatus } = usePremium();
  const t = useTranslations('header.userMenu');

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
          {t('login')}
        </Button>
        <Button size="sm" onClick={() => router.push('/signup')}>
          {t('signup')}
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button 
          type="button"
          onClick={() => setOpen(!open)}
          className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          aria-label={t('label')}
          aria-haspopup="true"
          aria-expanded={open}
          title={t('label')}
          role="button"
        >
          <Avatar className="h-10 w-10 border-2 border-brand-primary/20 hover:border-brand-primary/40 transition-all shadow-sm">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
            <AvatarFallback className="bg-gradient-to-br from-brand-primary to-orange-600 text-white font-semibold text-sm">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 shadow-elevation-3 border-slate-200" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none text-slate-900">{session.user.name}</p>
              {subscriptionStatus && <PremiumBadge status={subscriptionStatus as 'FREE' | 'TRIAL' | 'ACTIVE'} />}
            </div>
            <p className="text-xs leading-none text-slate-500">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200" />
        {!isPremium && (
          <>
            <DropdownMenuItem onClick={() => router.push('/pricing')} className="cursor-pointer text-brand-primary font-semibold hover:bg-orange-50 focus:bg-orange-50">
              <Crown className="mr-2 h-4 w-4" />
              <span>{t('upgrade')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200" />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/perfil')} className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
          <Settings className="mr-2 h-4 w-4 text-slate-600" />
          <span className="text-slate-700">{t('editProfile')}</span>
        </DropdownMenuItem>
        {session.user.isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
            <Shield className="mr-2 h-4 w-4 text-slate-600" />
            <span className="text-slate-700">{t('adminPanel')}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-slate-200" />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{t('loggingOut')}</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
