'use client';

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export type FieldStatus = 'used' | 'missing' | 'conflicting' | 'not-used';
export type FieldImportance = 'critical' | 'high' | 'medium' | 'low';

interface AIFieldStatusProps {
  status: FieldStatus;
  importance: FieldImportance;
  label: string;
  value?: any;
  reason?: string;
  suggestion?: string;
  conflictsWith?: string;
  className?: string;
  variant?: 'badge' | 'icon' | 'compact';
}

const statusConfig = {
  used: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Usado pela IA',
    emoji: '🟢',
    description: 'Este campo foi utilizado pela IA na geração do seu plano',
  },
  'not-used': {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Não usado',
    emoji: '🟡',
    description: 'Campo disponível mas não utilizado nesta geração',
  },
  missing: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Faltando',
    emoji: '🔴',
    description: 'Campo vazio. Preencha para melhor personalização',
  },
  conflicting: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Atenção',
    emoji: '🟡',
    description: 'Possível conflito detectado. Revise este campo',
  },
};

const importanceLabels = {
  critical: 'Crítico',
  high: 'Importante',
  medium: 'Útil',
  low: 'Opcional',
};

export default function AIFieldStatus({
  status,
  importance,
  label,
  value,
  reason,
  suggestion,
  conflictsWith,
  className = '',
  variant = 'compact',
}: AIFieldStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  // Compact version - just emoji with tooltip
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <span
              className={`inline-flex items-center justify-center cursor-help transition-all hover:scale-125 ${className}`}
              role="img"
              aria-label={config.label}
            >
              {config.emoji}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">{config.label}: {label}</p>
              <p className="text-xs">{config.description}</p>
              <p className="text-xs text-muted-foreground">
                Importância: {importanceLabels[importance]}
              </p>
              {reason && (
                <p className="text-xs text-muted-foreground italic">{reason}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Icon version
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-full p-1 transition-all hover:scale-110 ${config.bgColor} ${className}`}
              aria-label={config.label}
            >
              <Icon className={`h-3 w-3 ${config.color}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">{config.label}: {label}</p>
              <p className="text-xs">{config.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Badge version - full display
  return (
    <div
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.emoji}</span>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
              {config.label}
            </Badge>
          </div>

          {value !== undefined && value !== null && value !== '' && (
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
            </p>
          )}

          <p className="text-sm text-gray-600">{config.description}</p>

          {reason && (
            <div className="text-sm text-gray-700">
              <p className="font-medium">Motivo:</p>
              <p className="mt-1">{reason}</p>
            </div>
          )}

          {conflictsWith && (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-orange-800">Conflita com:</p>
              <p className="mt-1">{conflictsWith}</p>
            </div>
          )}

          {suggestion && (
            <div className="bg-white border border-gray-200 rounded p-2 text-sm">
              <p className="font-medium text-gray-900">💡 Sugestão:</p>
              <p className="text-gray-700 mt-1">{suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
