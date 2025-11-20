'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, MessageSquare, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AIFieldStatus from './AIFieldStatus';
import { AIPlanAnalysis } from '@/types/ai-transparency';

interface AIExplanationPanelProps {
  analysis: AIPlanAnalysis;
  onOpenChat?: () => void;
  className?: string;
}

export default function AIExplanationPanel({
  analysis,
  onOpenChat,
  className = '',
}: AIExplanationPanelProps) {
  const [showAllUsed, setShowAllUsed] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const totalFields = 
    analysis.fieldsUsed.length +
    analysis.fieldsNotUsed.length +
    analysis.fieldsMissing.length +
    analysis.fieldsConflicting.length;

  const usedCount = analysis.fieldsUsed.length;
  const missingCount = analysis.fieldsMissing.length;
  const conflictingCount = analysis.fieldsConflicting.length;

  return (
    <Card className={`border-2 border-indigo-100 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">O que a IA considerou no seu plano</CardTitle>
            <CardDescription>
              Transparência total sobre como seus dados foram usados
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Score de Completude */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Completude do Perfil</h3>
            <Badge variant={analysis.completenessScore >= 80 ? 'default' : 'secondary'} className="text-lg">
              {Math.round(analysis.completenessScore)}%
            </Badge>
          </div>
          <Progress value={analysis.completenessScore} className="h-3" />
          <p className="text-sm text-gray-600">
            {analysis.completenessScore >= 90 && '🎉 Excelente! Perfil muito completo'}
            {analysis.completenessScore >= 70 && analysis.completenessScore < 90 && '👍 Bom! Alguns campos adicionais podem ajudar'}
            {analysis.completenessScore >= 50 && analysis.completenessScore < 70 && '⚠️ Razoável. Complete mais campos para melhor personalização'}
            {analysis.completenessScore < 50 && '❌ Incompleto. Preencha mais campos para plano ideal'}
          </p>
        </div>

        {/* Resumo Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{usedCount}</p>
              <p className="text-sm text-gray-600">Dados Utilizados</p>
            </div>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{missingCount}</p>
              <p className="text-sm text-gray-600">Campos Faltando</p>
            </div>
          </div>
          
          {conflictingCount > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{conflictingCount}</p>
                <p className="text-sm text-gray-600">Conflitos</p>
              </div>
            </div>
          )}
        </div>

        {/* Dados Utilizados */}
        {analysis.fieldsUsed.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-700">
                ✅ Dados Utilizados ({usedCount}/{totalFields})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllUsed(!showAllUsed)}
              >
                {showAllUsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="space-y-2">
              {analysis.fieldsUsed.slice(0, showAllUsed ? undefined : 3).map((field, idx) => (
                <AIFieldStatus
                  key={idx}
                  status="used"
                  importance={field.importance}
                  label={field.label}
                  value={field.value}
                />
              ))}
              
              {!showAllUsed && analysis.fieldsUsed.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllUsed(true)}
                  className="w-full"
                >
                  Ver todos os {analysis.fieldsUsed.length} campos utilizados
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dados Faltando */}
        {analysis.fieldsMissing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-700">
                🔴 Dados Não Fornecidos ({missingCount})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllMissing(!showAllMissing)}
              >
                {showAllMissing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="space-y-2">
              {analysis.fieldsMissing.slice(0, showAllMissing ? undefined : 3).map((field, idx) => (
                <AIFieldStatus
                  key={idx}
                  status="missing"
                  importance={field.importance}
                  label={field.label}
                  suggestion={field.suggestion}
                />
              ))}
              
              {!showAllMissing && analysis.fieldsMissing.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllMissing(true)}
                  className="w-full"
                >
                  Ver todos os {analysis.fieldsMissing.length} campos faltando
                </Button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Recomendação:</strong> Complete os campos faltando para um plano ainda mais personalizado!
              </p>
            </div>
          </div>
        )}

        {/* Conflitos */}
        {analysis.fieldsConflicting.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-orange-700">
              🟡 Conflitos Detectados ({conflictingCount})
            </h3>
            
            <div className="space-y-2">
              {analysis.fieldsConflicting.map((field, idx) => (
                <AIFieldStatus
                  key={idx}
                  status="conflicting"
                  importance={field.importance}
                  label={field.label}
                  value={field.value}
                  conflictsWith={field.conflictsWith}
                  suggestion={field.suggestion}
                />
              ))}
            </div>
          </div>
        )}

        {/* Raciocínio da IA */}
        {Object.keys(analysis.aiReasoning).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">🧠 Raciocínio da IA</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReasoning(!showReasoning)}
              >
                {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {showReasoning && (
              <div className="space-y-3 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                {analysis.aiReasoning.vdotCalculation && (
                  <div>
                    <p className="font-medium text-indigo-900">📊 Cálculo VDOT:</p>
                    <p className="text-sm text-gray-700 mt-1">{analysis.aiReasoning.vdotCalculation}</p>
                  </div>
                )}
                
                {analysis.aiReasoning.volumeDecision && (
                  <div>
                    <p className="font-medium text-indigo-900">📏 Decisão de Volume:</p>
                    <p className="text-sm text-gray-700 mt-1">{analysis.aiReasoning.volumeDecision}</p>
                  </div>
                )}
                
                {analysis.aiReasoning.progressionStrategy && (
                  <div>
                    <p className="font-medium text-indigo-900">📈 Estratégia de Progressão:</p>
                    <p className="text-sm text-gray-700 mt-1">{analysis.aiReasoning.progressionStrategy}</p>
                  </div>
                )}
                
                {analysis.aiReasoning.experience && (
                  <div>
                    <p className="font-medium text-indigo-900">🏃 Análise de Experiência:</p>
                    <p className="text-sm text-gray-700 mt-1">{analysis.aiReasoning.experience}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recomendações */}
        {analysis.recommendations.length > 0 && (
          <div className="space-y-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Recomendações para Melhorar seu Plano
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onOpenChat && (
            <Button
              onClick={onOpenChat}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Conversar com a IA
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/pt-BR/profile'}
            className="flex-1"
          >
            Completar Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
