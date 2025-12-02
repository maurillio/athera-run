/**
 * ATHERA FLEX v3.3.0 - Suggestion Badge
 * Badge que aparece no calendário indicando matches disponíveis
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface SuggestionBadgeProps {
  count: number;
  confidence?: number;
  onClick: () => void;
  variant?: 'compact' | 'full';
  animated?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SuggestionBadge({
  count,
  confidence,
  onClick,
  variant = 'compact',
  animated = true,
  className,
}: SuggestionBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (count === 0) return null;

  // Determinar cor baseado no confidence
  const getBadgeColor = () => {
    if (!confidence) return 'bg-blue-500 hover:bg-blue-600';
    if (confidence >= 90) return 'bg-green-500 hover:bg-green-600';
    if (confidence >= 75) return 'bg-blue-500 hover:bg-blue-600';
    if (confidence >= 60) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };

  const getTooltipText = () => {
    if (count === 1) {
      return confidence 
        ? `1 match disponível (${confidence}% confiança)`
        : '1 match disponível';
    }
    return `${count} matches disponíveis`;
  };

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                'relative inline-flex items-center justify-center',
                'rounded-full transition-all',
                getBadgeColor(),
                'text-white font-semibold',
                'w-6 h-6 text-xs',
                animated && 'animate-pulse hover:animate-none',
                className
              )}
            >
              {count}
              
              {/* Ripple effect */}
              {animated && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="font-medium">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              {getTooltipText()}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant (para usar em outros lugares)
  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="default"
      className={cn(
        getBadgeColor(),
        'text-white',
        animated && 'animate-pulse hover:animate-none',
        className
      )}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      {count} {count === 1 ? 'Match' : 'Matches'} Disponível{count > 1 && 's'}
      {confidence && (
        <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">
          {confidence}%
        </Badge>
      )}
    </Button>
  );
}

// ============================================================================
// NOTIFICATION DOT (alternativa minimalista)
// ============================================================================

interface NotificationDotProps {
  active: boolean;
  animated?: boolean;
  className?: string;
}

export function NotificationDot({ 
  active, 
  animated = true, 
  className 
}: NotificationDotProps) {
  if (!active) return null;

  return (
    <span 
      className={cn(
        'relative flex h-3 w-3',
        className
      )}
    >
      {animated && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
      )}
      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
    </span>
  );
}
