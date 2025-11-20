'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Brain, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profileData?: any;
}

export default function AIChatDialog({
  open,
  onOpenChange,
  userId,
  profileData,
}: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Sou a IA do Athera. Posso te explicar qualquer decisão do seu plano de treino. O que você gostaria de saber?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sugestões de perguntas
  const suggestions = [
    'Por que meu longão é essa distância?',
    'Como foi calculado meu VDOT?',
    'Por que tenho treinos intervalados?',
    'Como funciona a progressão do plano?',
    'Por que preciso de dias de descanso?',
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: input.trim(),
          context: profileData,
          history: messages.slice(-5), // Últimas 5 mensagens para contexto
        }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Erro ao processar pergunta');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '😔 Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Conversar com a IA</DialogTitle>
              <DialogDescription>
                Tire dúvidas sobre seu plano de treino personalizado
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-indigo-600 animate-pulse" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-6 py-2 border-t bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">💡 Sugestões de perguntas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestion(suggestion)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua pergunta..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar • Shift+Enter para nova linha
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
