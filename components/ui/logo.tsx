import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: { image: 'h-6 w-6', text: 'text-base' },
  md: { image: 'h-10 w-10', text: 'text-xl' },
  lg: { image: 'h-16 w-16', text: 'text-2xl' },
  xl: { image: 'h-24 w-24', text: 'text-4xl' },
};

export default function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const { image, text } = sizeClasses[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', image)}>
        <Image
          src="/logo.png"
          alt="Athera Run"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-brand-primary via-orange-600 to-blue-600 bg-clip-text text-transparent',
            text
          )}
        >
          Athera Run
        </span>
      )}
    </div>
  );
}
