
'use client';
export const dynamic = 'force-dynamic';


import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/header';
import TrainingChat from '@/components/training-chat';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🤖 Chat com Treinador IA
            </h1>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas sobre treinamento, nutrição, recuperação e preparação para provas
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-muted-foreground mb-4">
              Clique no botão flutuante no canto inferior direito para iniciar o chat 👇
            </p>
          </div>
        </div>
      </main>
      <TrainingChat />
    </div>
  );
}
