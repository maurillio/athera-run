'use client';

import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PremiumBadgeProps {
  status?: 'ACTIVE' | 'TRIAL' | 'FREE';
  plan?: string;
  className?: string;
}

export default function PremiumBadge({ status = 'FREE', plan, className = '' }: PremiumBadgeProps) {
  if (status === 'FREE') return null;

  const isActive = status === 'ACTIVE';
  const isTrial = status === 'TRIAL';

  return (
    <Badge 
      className={`${
        isActive 
          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
      } text-white border-0 ${className}`}
    >
      {isActive ? (
        <>
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </>
      ) : (
        <>
          <Sparkles className="w-3 h-3 mr-1" />
          Trial Premium
        </>
      )}
    </Badge>
  );
}
