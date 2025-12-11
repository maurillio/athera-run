import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  variant?: 'icon' | 'name' | 'complete';
}

const sizeClasses = {
  sm: { 
    icon: 'h-8 w-8',
    name: 'h-8 w-auto',
    complete: 'h-10 w-auto',
    container: 'h-8'
  },
  md: { 
    icon: 'h-12 w-12',
    name: 'h-12 w-auto',
    complete: 'h-14 w-auto',
    container: 'h-12'
  },
  lg: { 
    icon: 'h-16 w-16',
    name: 'h-16 w-auto',
    complete: 'h-20 w-auto',
    container: 'h-16'
  },
  xl: { 
    icon: 'h-24 w-24',
    name: 'h-24 w-auto',
    complete: 'h-32 w-auto',
    container: 'h-24'
  },
};

export default function Logo({ 
  size = 'md', 
  className, 
  showText = true,
  variant 
}: LogoProps) {
  const sizes = sizeClasses[size];
  
  // Auto-determinar variant se não especificado
  const logoVariant = variant || (showText ? 'complete' : 'icon');
  
  // Usar logo completa quando showText = true
  if (logoVariant === 'complete' || (showText && !variant)) {
    return (
      <div className={cn('relative flex items-center', sizes.container, className)}>
        <Image
          src="/logo-complete.png"
          alt="Athera Run"
          width={200}
          height={80}
          className={cn('object-contain', sizes.complete)}
          priority
        />
      </div>
    );
  }
  
  // Logo apenas nome
  if (logoVariant === 'name') {
    return (
      <div className={cn('relative flex items-center', sizes.container, className)}>
        <Image
          src="/logo-name.png"
          alt="Athera Run"
          width={150}
          height={60}
          className={cn('object-contain', sizes.name)}
          priority
        />
      </div>
    );
  }
  
  // Logo apenas ícone (padrão quando showText = false)
  return (
    <div className={cn('relative', sizes.icon, className)}>
      <Image
        src="/logo-icon.png"
        alt="Athera Run"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
