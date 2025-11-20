'use client';

import { Brain } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FieldImportance } from '@/types/ai-transparency';

interface AIFieldIconProps {
  label: string;
  importance: FieldImportance;
  impact: string;
  howUsed: string;
  className?: string;
}

const importanceColors = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-blue-600',
  low: 'text-gray-600',
};

const importanceLabels = {
  critical: 'Crítico',
  high: 'Importante',
  medium: 'Útil',
  low: 'Opcional',
};

export default function AIFieldIcon({
  label,
  importance,
  impact,
  howUsed,
  className = '',
}: AIFieldIconProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1 ml-2 group ${className}`}
            aria-label={`IA usa ${label}`}
          >
            <Brain 
              className={`h-4 w-4 ${importanceColors[importance]} transition-transform group-hover:scale-110 animate-pulse`}
            />
            <span className="sr-only">Campo usado pela IA</span>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="max-w-xs p-4 space-y-2 bg-white border-2 border-indigo-100 shadow-lg"
        >
          <div className="flex items-start gap-2">
            <Brain className={`h-5 w-5 mt-0.5 ${importanceColors[importance]} flex-shrink-0`} />
            <div className="space-y-1">
              <p className="font-semibold text-sm text-gray-900">
                🤖 A IA usa este campo
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  importance === 'critical' ? 'bg-red-100 text-red-700' :
                  importance === 'high' ? 'bg-orange-100 text-orange-700' :
                  importance === 'medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {importanceLabels[importance]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 space-y-2 border-t pt-2">
            <div>
              <p className="font-medium text-gray-900 mb-1">💡 Impacto:</p>
              <p>{impact}</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900 mb-1">⚙️ Como é usado:</p>
              <p>{howUsed}</p>
            </div>
          </div>
          
          {importance === 'critical' && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-800">
              <strong>⚠️ Campo Crítico:</strong> Essencial para gerar seu plano personalizado
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
