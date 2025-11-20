'use client';

import { CheckCircle2, AlertCircle, XCircle, Circle } from 'lucide-react';
import { FieldStatus, FieldImportance } from '@/types/ai-transparency';

interface AIFieldStatusProps {
  status: FieldStatus;
  importance: FieldImportance;
  label: string;
  value?: any;
  reason?: string;
  suggestion?: string;
  conflictsWith?: string;
  className?: string;
}

const statusConfig = {
  used: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Usado pela IA',
    emoji: '✓',
  },
  'not-used': {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Não usado',
    emoji: '⚠',
  },
  missing: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Não fornecido',
    emoji: '✗',
  },
  conflicting: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Conflito detectado',
    emoji: '⚠',
  },
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
}: AIFieldStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border-2 ${config.borderColor} ${config.bgColor} p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{label}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}>
              {config.label}
            </span>
          </div>

          {value !== undefined && value !== null && value !== '' && (
            <p className="text-sm text-gray-700">
              <strong>Valor:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
            </p>
          )}

          {status === 'used' && (
            <p className="text-sm text-gray-600">
              {config.emoji} Seus dados estão sendo usados para personalizar seu treino
            </p>
          )}

          {status === 'not-used' && reason && (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-yellow-800">{config.emoji} Por que não foi usado:</p>
              <p className="mt-1">{reason}</p>
            </div>
          )}

          {status === 'missing' && (
            <div className="text-sm">
              <p className="text-gray-700">{config.emoji} Este campo não foi preenchido</p>
              {importance === 'critical' && (
                <p className="text-red-700 font-medium mt-1">
                  ⚠️ Campo crítico! Complete para melhor personalização
                </p>
              )}
            </div>
          )}

          {status === 'conflicting' && conflictsWith && (
            <div className="text-sm text-gray-700">
              <p className="font-medium text-orange-800">{config.emoji} Conflita com:</p>
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
