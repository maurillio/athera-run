/**
 * ATHERA FLEX v3.4.0 - Flex Coach Chat
 * Chat conversacional com IA coach personalizado
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Send, 
  Loader2,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FlexCoachChatProps {
  userId: string;
  userName?: string;
  className?: string;
  maxHeight?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FlexCoachChat({
  userId,
  userName = 'Atleta',
  className,
  maxHeight = '600px',
}: FlexCoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá ${userName}! 👋 Sou seu coach virtual do Athera Flex. Posso te ajudar a entender seus ajustes, esclarecer dúvidas sobre treinos e dar dicas personalizadas. Como posso ajudar?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/athera-flex/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={cn('border-purple-200', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Coach Virtual</CardTitle>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Bot className="h-3 w-3 mr-1" />
            IA Ativa
          </Badge>
        </div>
        <CardDescription>
          Converse com seu coach pessoal sobre treinos e ajustes
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Messages Container */}
        <div 
          className="space-y-4 overflow-y-auto px-1 mb-4"
          style={{ maxHeight }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
              )}

              <div
                className={cn(
                  'rounded-lg px-4 py-3 max-w-[80%]',
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p 
                  className={cn(
                    'text-xs mt-2',
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                  )}
                >
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Coach está digitando...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Questions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-xs text-gray-500 w-full mb-1">Perguntas rápidas:</p>
          {[
            'Por que este ajuste?',
            'Como melhorar meu treino?',
            'Estou treinando demais?',
          ].map((question) => (
            <Button
              key={question}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setInput(question)}
              disabled={loading}
            >
              {question}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
