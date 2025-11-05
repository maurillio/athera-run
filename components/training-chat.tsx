
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, User, Bot, MessageCircle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { usePremium } from '@/hooks/use-premium';
import PaywallModal from '@/components/subscription/paywall-modal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "Como devo me alimentar antes de uma prova longa?",
  "O que fazer quando sentir dor no joelho durante o treino?",
  "Qual a diferença entre treino de ritmo e intervalado?",
  "Como melhorar minha velocidade na corrida?",
  "Quantas horas de sono preciso para recuperar bem?"
];

const FREE_MESSAGE_LIMIT = 5;

export default function TrainingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isPremium, loading: premiumLoading } = usePremium();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    // Check message limit for free users
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (!isPremium && userMessageCount >= FREE_MESSAGE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Erro ao enviar mensagem');

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const remainingMessages = isPremium ? Infinity : Math.max(0, FREE_MESSAGE_LIMIT - userMessageCount);

  return (
    <>
      <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <CardTitle className="text-lg">Treinador IA</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
          <CardDescription className="text-white/90 flex items-center justify-between">
            <span>Tire suas dúvidas sobre treinamento</span>
            {!isPremium && (
              <Badge variant="secondary" className="ml-2">
                {remainingMessages} restantes
              </Badge>
            )}
          </CardDescription>
        </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-3 text-orange-500" />
                <p className="font-medium mb-2">👋 Olá! Como posso ajudar?</p>
                <p className="text-sm">
                  Pergunte sobre treinos, nutrição, recuperação e mais!
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Perguntas sugeridas:
                </p>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 whitespace-normal"
                    onClick={() => sendMessage(question)}
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className={`h-8 w-8 flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </Avatar>
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block rounded-lg px-4 py-2 max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                    <Bot className="h-4 w-4 text-white" />
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              className="min-h-[60px] resize-none"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-[60px] w-[60px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      feature="Chat Ilimitado com IA"
      description="Continue tirando suas dúvidas sobre treinamento, nutrição e corrida sem limites"
    />
    </>
  );
}
