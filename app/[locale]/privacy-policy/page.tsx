import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Athera Run',
  description: 'Política de Privacidade e Proteção de Dados - LGPD',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Política de Privacidade
          </h1>
          
          <p className="text-sm text-gray-600 mb-8">
            <strong>Última atualização:</strong> 17 de Novembro de 2025<br/>
            <strong>Versão:</strong> 1.0
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-sm text-blue-900">
              <strong>📖 Leia com atenção:</strong> Esta política explica como coletamos, 
              usamos e protegemos seus dados pessoais. Escrevemos em linguagem simples 
              para que você entenda seus direitos.
            </p>
          </div>

          {/* Conteúdo será exibido aqui */}
          <div className="space-y-8 prose prose-lg max-w-none">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Quem é responsável pelos seus dados</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Controlador:</strong> Athera Run</p>
                <p><strong>Email DPO:</strong> dpo@atherarun.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Quais dados coletamos</h2>
              <p className="mb-4">Coletamos apenas dados necessários para funcionar:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Dados de conta (nome, email, senha criptografada)</li>
                <li>Perfil de atleta (peso, altura, idade, gênero)</li>
                <li>Dados de performance (tempos, VDOT, nível)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Seus Direitos (LGPD)</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar todos os seus dados</li>
                <li>Corrigir informações incorretas</li>
                <li>Excluir sua conta e dados</li>
                <li>Baixar seus dados (portabilidade)</li>
                <li>Revogar consentimentos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Como exercer seus direitos</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p><strong>Email:</strong> <a href="mailto:dpo@atherarun.com" className="text-blue-600">dpo@atherarun.com</a></p>
                <p><strong>Portal:</strong> <a href="/privacy/my-data" className="text-blue-600">Meus Dados</a></p>
                <p><strong>Prazo:</strong> 15 dias úteis</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Segurança</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criptografia SSL/TLS</li>
                <li>Senhas hasheadas (bcrypt)</li>
                <li>Banco seguro (Neon PostgreSQL)</li>
                <li>Backups automáticos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Contato</h2>
              <p><strong>DPO:</strong> dpo@atherarun.com</p>
              <p><strong>ANPD:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener" className="text-blue-600">www.gov.br/anpd</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
