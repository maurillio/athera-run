import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso | Athera Run',
  description: 'Termos e Condições de Uso do Serviço',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Termos de Uso</h1>
          <p className="text-sm text-gray-600 mb-8"><strong>Última atualização:</strong> 17/Nov/2025</p>
          
          <div className="space-y-8 prose max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p>Ao criar uma conta, você concorda com estes Termos e nossa Política de Privacidade.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
              <p>Plataforma de geração de planos de treino personalizados com IA.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Suas Responsabilidades</h2>
              <ul className="list-disc pl-6">
                <li>Consultar médico antes de treinar</li>
                <li>Fornecer dados verdadeiros</li>
                <li>Não usar para fins ilegais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Nossas Responsabilidades</h2>
              <ul className="list-disc pl-6">
                <li>Não somos médicos ou personal trainers</li>
                <li>Planos são orientativos</li>
                <li>Não garantimos resultados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Contato</h2>
              <p><strong>Email:</strong> suporte@atherarun.com</p>
              <p><strong>DPO:</strong> dpo@atherarun.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
