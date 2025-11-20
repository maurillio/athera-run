'use client';

import { useState, useEffect } from 'react';
import { Loader2, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIExplanationPanel, AIChatDialog } from '@/components/ai-transparency';
import { AIPlanAnalysis } from '@/types/ai-transparency';

export default function AITransparencySection() {
  const [analysis, setAnalysis] = useState<AIPlanAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/plan-analysis');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar análise');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-600">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Não foi possível carregar a análise da IA</p>
            <Button onClick={loadAnalysis} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AIExplanationPanel
        analysis={analysis}
        onOpenChat={() => setChatOpen(true)}
      />
      
      <AIChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        userId={analysis.userId}
      />
    </>
  );
}
