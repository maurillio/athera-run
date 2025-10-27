
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Calculator,
  Apple,
  Shield,
  BookOpen,
  Activity,
  Trophy,
  Target,
  MessageCircle
} from 'lucide-react';
import UserDropdown from './user-dropdown';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Trophy },
  { name: 'Plano', href: '/plano', icon: Calendar },
  { name: 'Treinos', href: '/tracking', icon: Target },
  { name: 'Chat IA', href: '/chat', icon: MessageCircle },
  { name: 'Calculadora', href: '/calculator', icon: Calculator },
  { name: 'Nutrição', href: '/nutrition', icon: Apple },
  { name: 'Prevenção', href: '/prevention', icon: Shield },
  { name: 'Glossário', href: '/glossary', icon: BookOpen },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-600 rounded-lg shadow-lg">
              <span className="text-white font-bold text-base">AR</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                Athera Run
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Treinamento Inteligente</p>
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

          <div className="flex items-center space-x-4">
            <div className="flex lg:hidden">
              <select 
                className="px-3 py-1.5 text-sm border rounded-md bg-background"
                value={pathname}
                onChange={(e) => window.location.href = e.target.value}
              >
                {navigation.map((item) => (
                  <option key={item.name} value={item.href}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
