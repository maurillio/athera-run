
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

export default function UserDropdown() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);
  const { isPremium, status: subscriptionStatus } = usePremium();

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
          Entrar
        </Button>
        <Button size="sm" onClick={() => router.push('/signup')}>
          Cadastrar
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
          aria-label="Menu do usuário"
          aria-haspopup="true"
          aria-expanded={open}
          title="Menu do usuário"
          role="button"
        >
          <Avatar className="h-10 w-10 border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-blue-600 text-white font-semibold">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              {subscriptionStatus && <PremiumBadge status={subscriptionStatus as 'FREE' | 'TRIAL' | 'ACTIVE'} />}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isPremium && (
          <>
            <DropdownMenuItem onClick={() => router.push('/pricing')} className="cursor-pointer text-orange-600 font-medium">
              <Crown className="mr-2 h-4 w-4" />
              <span>Fazer Upgrade</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/perfil')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Editar Perfil</span>
        </DropdownMenuItem>
        {session.user.isAdmin && (
          <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>Painel Administrativo</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saindo...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
