'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OpenAISettings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ status: 'unknown' | 'connected' | 'disconnected'; message: string }>(
    { status: 'unknown', message: 'Verificando status...' }
  );

  useEffect(() => {
    // Fetch initial status when component mounts
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/openai-status');
      const data = await response.json();
      if (response.ok) {
        setConnectionStatus({ status: data.success ? 'connected' : 'disconnected', message: data.message });
      } else {
        setConnectionStatus({ status: 'disconnected', message: data.message || 'Erro ao verificar status.' });
      }
    } catch (error) {
      console.error('Error checking OpenAI status:', error);
      setConnectionStatus({ status: 'disconnected', message: 'Não foi possível conectar ao servidor para verificar o status.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/update-openai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: data.message,
          variant: 'default',
        });
        setApiKey(''); // Clear input after saving
        checkConnectionStatus(); // Re-check status after saving
      } else {
        toast({
          title: 'Erro ao salvar!',
          description: data.message || 'Ocorreu um erro ao salvar a chave.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: 'Erro!',
        description: 'Não foi possível conectar ao servidor para salvar a chave.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-6 w-6" />
          Configurações da API OpenAI
        </CardTitle>
        <CardDescription>
          Gerencie a chave da API para o serviço de Inteligência Artificial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="openai-api-key">Chave da API OpenAI</Label>
          <Input
            id="openai-api-key"
            type="password" // Use type password for masking
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-**************************************"
            disabled={isSaving}
          />
          <p className="text-sm text-muted-foreground">
            A chave completa não será exibida após ser salva. Insira a chave novamente para atualizar.
          </p>
        </div>

        <Button onClick={handleSaveApiKey} disabled={isSaving || apiKey.length === 0}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar Chave da API'}
        </Button>

        <div className="space-y-2">
          <Label>Status da Conexão</Label>
          <Alert variant={connectionStatus.status === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus.status === 'connected' && <CheckCircle className="h-4 w-4" />}
            {connectionStatus.status === 'disconnected' && <XCircle className="h-4 w-4" />}
            {connectionStatus.status === 'unknown' && <AlertCircle className="h-4 w-4" />}
            <AlertTitle>
              {connectionStatus.status === 'connected' && 'Conectado!'}
              {connectionStatus.status === 'disconnected' && 'Desconectado!'}
              {connectionStatus.status === 'unknown' && 'Status Desconhecido'}
            </AlertTitle>
            <AlertDescription>{connectionStatus.message}</AlertDescription>
          </Alert>
          <Button onClick={checkConnectionStatus} disabled={isTesting} variant="outline">
            {isTesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="mr-2 h-4 w-4" />
            )}
            {isTesting ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
