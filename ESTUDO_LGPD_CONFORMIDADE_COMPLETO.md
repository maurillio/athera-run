# 🔒 ESTUDO MASSIVO - CONFORMIDADE LGPD ATHERA RUN

**Data:** 17/Novembro/2025  
**Versão Sistema:** v3.0.2  
**Documento:** Análise Completa de Conformidade LGPD

---

## 📋 SUMÁRIO EXECUTIVO

Este documento apresenta uma análise massiva e detalhada da conformidade do **Athera Run** com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**, incluindo:

1. ✅ **O que já temos implementado**
2. ❌ **Gaps críticos identificados**
3. 🎯 **Recomendações prioritárias**
4. 📊 **Roadmap de implementação**
5. 💰 **Estimativa de esforço e riscos**

---

## 🎯 CONTEXTO DO ATHERA RUN

### O que é o Athera Run?
Plataforma SaaS de treinamento de corrida com IA que coleta e processa:
- **Dados pessoais básicos**: nome, email, idade, peso, altura, gênero
- **Dados de saúde**: lesões, condições médicas, medicamentos, restrições físicas, FC repouso, qualidade sono, nível stress
- **Dados sensíveis**: ciclo menstrual (mulheres), histórico de lesões detalhado
- **Dados de performance**: tempos de corrida, VDOT, ritmos, volume semanal
- **Dados comportamentais**: disponibilidade, preferências, motivação
- **Integrações**: Strava (OAuth + tokens), Stripe (pagamentos)

### Volume de Dados
- **Usuários ativos**: 50+
- **Assinantes Premium**: 10+
- **Planos gerados**: 100+
- **Base de dados**: PostgreSQL (Neon - US East)
- **Backups**: Automáticos e contínuos

---

## 📜 LGPD - PRINCIPAIS REQUISITOS (2025)

### Artigo 7º - Bases Legais para Tratamento

O tratamento de dados pessoais só pode ocorrer mediante uma das seguintes bases legais:

1. **Consentimento** - Autorização livre, informada, inequívoca e para finalidade específica
2. **Obrigação legal** - Cumprimento de lei ou regulação
3. **Execução de contrato** - Necessário para prestação do serviço
4. **Exercício regular de direitos** - Processos judiciais, administrativos
5. **Proteção da vida** - Proteção da integridade física
6. **Tutela da saúde** - Procedimentos de saúde
7. **Interesse legítimo** - Desde que não prejudique direitos do titular
8. **Proteção do crédito** - Consultas a bureaus de crédito
9. **Estudo/pesquisa** - Com anonimização quando possível
10. **Políticas públicas** - Execução por órgãos públicos

### Artigos 17-18 - Direitos do Titular

1. ✅ **Confirmação de tratamento** - Resposta em até 15 dias
2. ✅ **Acesso aos dados** - Cópia completa dos dados
3. ✅ **Correção** - Atualização de dados incorretos
4. ✅ **Anonimização/Bloqueio/Eliminação** - Direito de apagar dados
5. ✅ **Portabilidade** - Transferir dados para outro serviço
6. ✅ **Eliminação** - Excluir dados tratados com consentimento
7. ✅ **Informação sobre compartilhamento** - Saber com quem foi compartilhado
8. ✅ **Informação sobre negar consentimento** - Consequências
9. ✅ **Revogação do consentimento** - A qualquer momento
10. ✅ **Revisão de decisões automatizadas** - Especialmente IA

### Sanções (2025)

- **Multas**: Até R$ 50 milhões OU 5% do faturamento anual (o que for maior)
- **ANPD**: Maior poder de fiscalização e aplicação rápida de penalidades
- **Reputacional**: Dano à imagem e perda de confiança dos usuários

---

## ✅ O QUE JÁ TEMOS IMPLEMENTADO

### 1. Autenticação e Segurança Básica ✅

**Implementado:**
```typescript
// lib/auth.ts
- NextAuth.js 4.24 com JWT
- Senhas hasheadas com bcrypt
- Tokens seguros com refresh automático
- Google OAuth com allowDangerousEmailAccountLinking
- Sessões com maxAge de 30 dias
- HTTPS obrigatório (Vercel)
```

**Status:** ✅ **BOM** - Autenticação robusta implementada

---

### 2. Armazenamento de Dados ✅

**Implementado:**
```yaml
Database: Neon PostgreSQL 16.9 (US East)
Features:
  - Backups automáticos e contínuos
  - Point-in-time recovery
  - SSL obrigatório
  - Connection pooling
  - 99.95% SLA
  - Dados criptografados em repouso e trânsito
```

**Status:** ✅ **BOM** - Infraestrutura segura e profissional

---

### 3. Exclusão de Dados ✅

**Implementado:**
```typescript
// app/api/profile/delete/route.ts
DELETE /api/profile/delete

Funcionalidade:
- Exclusão COMPLETA do perfil do atleta
- Cascade delete: planos, treinos, corridas, feedbacks
- Transação atômica (tudo ou nada)
- Logs detalhados da exclusão
- Redireciona para onboarding após exclusão
```

**Status:** ✅ **EXCELENTE** - Direito de eliminação implementado corretamente

---

### 4. Atualização de Dados ✅

**Implementado:**
```typescript
// app/api/profile/update/route.ts
POST /api/profile/update

Funcionalidade:
- Atualização parcial ou completa do perfil
- Validação de tipos
- Sanitização de inputs
- Suporte a todos os campos (47 campos no schema)
```

**Status:** ✅ **BOM** - Direito de correção implementado

---

### 5. Integração Strava (Tokens Seguros) ✅

**Implementado:**
```typescript
// lib/auth.ts - Callback JWT
- Tokens OAuth armazenados criptografados
- Refresh token automático
- Expiry tracking
- Revogação ao desconectar
```

**Status:** ✅ **BOM** - Tokens de terceiros tratados corretamente

---

### 6. Dados de Saúde (Dados Sensíveis) ⚠️

**Implementado:**
```prisma
// prisma/schema.prisma
AthleteProfile {
  injuries                 Json?
  medicalConditions        String?
  medications              String?
  physicalRestrictions     String?
  injuryDetails            Json?
  currentlyInjured         Boolean
  tracksMenstrualCycle     Boolean?
  lastPeriodDate           DateTime?
  avgCycleLength           Int?
  avgSleepHours            Float?
}
```

**Status:** ⚠️ **ATENÇÃO** - Coletamos dados sensíveis sem aviso explícito

---

## ❌ GAPS CRÍTICOS IDENTIFICADOS

### 🚨 CRÍTICO 1: Ausência de Termo de Consentimento LGPD

**Problema:**
- ❌ Não há política de privacidade
- ❌ Não há termos de uso
- ❌ Não há aviso sobre coleta de dados sensíveis
- ❌ Não há checkbox de consentimento no signup/onboarding
- ❌ Usuário não é informado sobre suas finalidades

**Impacto:** 🔴 **CRÍTICO** - Base legal ausente para tratamento de dados

**Risco Legal:**
- Todas as coletas de dados estão **sem base legal válida**
- Multa potencial: Até R$ 50 milhões
- Pode ser enquadrado como **tratamento irregular de dados sensíveis**

---

### 🚨 CRÍTICO 2: Ausência de Portal de Privacidade

**Problema:**
- ❌ Usuário não pode visualizar todos os seus dados coletados
- ❌ Não há opção de "baixar meus dados" (portabilidade)
- ❌ Não há histórico de consentimentos
- ❌ Não há log de quem acessou os dados
- ❌ Não há opção de revogar consentimento facilmente

**Impacto:** 🔴 **CRÍTICO** - Direitos do titular não implementados

**Direitos violados:**
- Acesso aos dados (Art. 18, II)
- Portabilidade (Art. 18, V)
- Informação sobre compartilhamento (Art. 18, VII)
- Revogação do consentimento (Art. 18, IX)

---

### 🚨 CRÍTICO 3: Dados Sensíveis sem Consentimento Específico

**Problema:**
```typescript
// Dados sensíveis coletados SEM aviso explícito:
- Ciclo menstrual (dados de saúde)
- Lesões e histórico médico (dados de saúde)
- Medicamentos e condições médicas (dados de saúde)
```

**Impacto:** 🔴 **CRÍTICO** - Art. 11 LGPD violado

**Artigo 11 LGPD:**
> "O tratamento de dados pessoais sensíveis somente poderá ocorrer nas seguintes hipóteses:
> I - quando o titular ou seu responsável legal consentir, **de forma específica e destacada**, para finalidades específicas"

**Risco Legal:**
- Multa agravada por tratar dados sensíveis sem consentimento específico
- Pode chegar a **R$ 50 milhões OU 5% do faturamento**

---

### 🟡 ALTO 4: Ausência de DPO (Encarregado de Dados)

**Problema:**
- ❌ Não há DPO nomeado
- ❌ Não há canal de comunicação para exercício de direitos
- ❌ Não há email/formulário específico para LGPD

**Impacto:** 🟡 **ALTO** - Art. 41 LGPD violado

**Requisito Legal:**
> "Art. 41. O controlador deverá indicar encarregado pelo tratamento de dados pessoais."

---

### 🟡 ALTO 5: Ausência de Registro de Atividades de Tratamento

**Problema:**
- ❌ Não há documentação de quais dados coletamos
- ❌ Não há mapeamento de finalidades
- ❌ Não há registro de bases legais utilizadas
- ❌ Não há documentação de compartilhamento de dados

**Impacto:** 🟡 **ALTO** - Impossibilita auditoria e fiscalização ANPD

---

### 🟡 MÉDIO 6: Integrações sem Aviso Claro

**Problema:**
```typescript
// Integrações ativas:
- Strava API (OAuth + Sincronização automática)
- Stripe (Dados de pagamento)
- OpenAI GPT-4o (Envia dados do perfil para IA)

// Sem aviso claro:
❌ Usuário não é informado que dados vão para OpenAI
❌ Não há política de compartilhamento com terceiros
❌ Não há DPA (Data Processing Agreement) público
```

**Impacto:** 🟡 **MÉDIO** - Art. 18, VII violado

---

### 🟢 BAIXO 7: Cookies e Tracking

**Problema:**
- ❌ Não há banner de cookies
- ⚠️ Vercel Analytics pode estar coletando dados
- ⚠️ NextAuth usa cookies de sessão

**Impacto:** 🟢 **BAIXO** - Cookies técnicos permitidos, mas falta transparência

---

### 🟢 BAIXO 8: Logs e Auditoria

**Problema:**
- ❌ Não há log de acessos aos dados
- ❌ Não há auditoria de alterações
- ❌ Não há registro de quem visualizou/modificou dados

**Impacto:** 🟢 **BAIXO** - Dificulta investigação em caso de incidentes

---

## 🎯 RECOMENDAÇÕES PRIORITÁRIAS

### 📌 FASE 1 - IMEDIATO (1-2 semanas) 🚨

#### 1.1 Criar Política de Privacidade ✅ OBRIGATÓRIO

**Arquivo:** `/app/[locale]/privacy-policy/page.tsx`

**Conteúdo mínimo:**
```markdown
# Política de Privacidade - Athera Run

## 1. Controlador de Dados
- Nome: [Sua Empresa Ltda]
- CNPJ: [XX.XXX.XXX/XXXX-XX]
- Email DPO: dpo@atherarun.com

## 2. Dados Coletados

### 2.1 Dados Pessoais Básicos
- Nome, email, senha (hash), idade, peso, altura, gênero
- Finalidade: Criação de conta e personalização do serviço
- Base Legal: Execução de contrato (Art. 7º, V)

### 2.2 Dados de Performance
- Tempos de corrida, VDOT, ritmos, volume semanal
- Finalidade: Geração de planos de treino personalizados
- Base Legal: Execução de contrato (Art. 7º, V)

### 2.3 Dados Sensíveis de Saúde (OPCIONAL)
- Lesões, condições médicas, medicamentos
- Ciclo menstrual (mulheres)
- Finalidade: Personalização avançada e segurança do atleta
- Base Legal: Consentimento específico (Art. 11, I)
- ⚠️ VOCÊ PODE RECUSAR o fornecimento destes dados

### 2.4 Dados de Terceiros
- Strava: Atividades, métricas, perfil
- Stripe: Dados de pagamento (não armazenamos cartão)
- OpenAI: Perfil do atleta para geração de planos com IA

## 3. Seus Direitos (Art. 18 LGPD)
- Acesso aos seus dados
- Correção de dados incorretos
- Exclusão de dados (exceto obrigações legais)
- Portabilidade (baixar todos os seus dados)
- Revogação de consentimento
- Informações sobre compartilhamento

## 4. Como Exercer Seus Direitos
- Email: dpo@atherarun.com
- Portal: atherarun.com/privacy/my-data
- Resposta em até 15 dias

## 5. Segurança
- Criptografia SSL/TLS
- Senhas hasheadas (bcrypt)
- Backups automáticos
- Acesso restrito (autenticação)

## 6. Retenção de Dados
- Dados de conta: Até exclusão pelo usuário
- Backups: 30 dias após exclusão
- Obrigações legais: 5 anos (Código Civil)

## 7. Compartilhamento
- Strava: Com seu consentimento
- OpenAI: Para geração de planos (DPA existente)
- Stripe: Para processar pagamentos
- Autoridades: Quando exigido por lei

## 8. Cookies
- Cookies técnicos: Sessão (necessários)
- Analytics: Vercel Analytics (anonimizado)

## 9. Contato
- DPO: dpo@atherarun.com
- ANPD: https://www.gov.br/anpd

Última atualização: 17/Nov/2025
```

---

#### 1.2 Criar Termos de Uso ✅ OBRIGATÓRIO

**Arquivo:** `/app/[locale]/terms-of-service/page.tsx`

**Conteúdo mínimo:**
```markdown
# Termos de Uso - Athera Run

## 1. Aceitação dos Termos
Ao criar uma conta, você concorda com estes Termos.

## 2. Descrição do Serviço
Plataforma de geração de planos de treino personalizados com IA.

## 3. Responsabilidades do Usuário
- Fornecer dados verdadeiros
- Não usar para fins ilegais
- Consultar médico antes de iniciar treinos

## 4. Responsabilidades da Athera Run
- Não somos médicos ou personal trainers
- Planos são orientativos
- Não nos responsabilizamos por lesões

## 5. Propriedade Intelectual
- Planos gerados são de sua propriedade
- Software e marca são de nossa propriedade

## 6. Cancelamento
- Você pode cancelar a qualquer momento
- Reembolso conforme política de cancelamento

## 7. Lei Aplicável
- Lei brasileira (Lei 13.709/2018 - LGPD)

Última atualização: 17/Nov/2025
```

---

#### 1.3 Implementar Checkbox de Consentimento ✅ OBRIGATÓRIO

**Arquivo:** `/app/[locale]/signup/page.tsx` e `/components/onboarding/v1.3.0/Step1Basic.tsx`

**Implementação:**
```typescript
// Adicionar ao formulário de signup:

const [consents, setConsents] = useState({
  termsAccepted: false,
  privacyAccepted: false,
  healthDataConsent: false, // OPCIONAL - apenas se preencher dados de saúde
});

<div className="space-y-3 border-t pt-4">
  {/* Termos obrigatórios */}
  <label className="flex items-start gap-2">
    <input
      type="checkbox"
      checked={consents.termsAccepted}
      onChange={(e) => setConsents({...consents, termsAccepted: e.target.checked})}
      required
      className="mt-1"
    />
    <span className="text-sm">
      Li e aceito os{' '}
      <a href="/terms-of-service" target="_blank" className="text-blue-600 underline">
        Termos de Uso
      </a>
      {' '}e a{' '}
      <a href="/privacy-policy" target="_blank" className="text-blue-600 underline">
        Política de Privacidade
      </a>
      *
    </span>
  </label>

  {/* Dados sensíveis - OPCIONAL E DESTACADO */}
  <div className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
    <label className="flex items-start gap-2">
      <input
        type="checkbox"
        checked={consents.healthDataConsent}
        onChange={(e) => setConsents({...consents, healthDataConsent: e.target.checked})}
        className="mt-1"
      />
      <span className="text-sm">
        <strong className="text-orange-700">OPCIONAL:</strong> Autorizo o tratamento de
        dados sensíveis de saúde (lesões, ciclo menstrual, condições médicas) para
        personalização avançada do plano de treino. Posso negar e ainda usar o serviço.
      </span>
    </label>
  </div>
</div>

// Validação:
const handleSignup = () => {
  if (!consents.termsAccepted || !consents.privacyAccepted) {
    alert('Você deve aceitar os Termos de Uso e Política de Privacidade');
    return;
  }
  // ... continuar signup
};
```

---

#### 1.4 Salvar Consentimentos no Banco ✅ OBRIGATÓRIO

**Migration:** `20251117_add_consent_tracking`

```sql
-- Criar tabela de consentimentos
CREATE TABLE user_consents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR NOT NULL, -- 'terms', 'privacy', 'health_data', 'strava', etc
  consented_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR,
  user_agent TEXT,
  version VARCHAR NOT NULL, -- versão do documento aceito
  revoked_at TIMESTAMP,
  
  UNIQUE(user_id, consent_type, version)
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
```

**API:** `/app/api/consent/record/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const { userId, consentType, version, ipAddress, userAgent } = await req.json();
  
  await prisma.userConsent.create({
    data: {
      userId,
      consentType,
      version,
      ipAddress,
      userAgent,
      consentedAt: new Date()
    }
  });
  
  return NextResponse.json({ success: true });
}
```

---

#### 1.5 Nomear DPO (Encarregado de Dados) ✅ OBRIGATÓRIO

**Ação:**
1. Nomear pessoa responsável (pode ser você, terceirizado ou consultor)
2. Criar email: **dpo@atherarun.com**
3. Publicar contato no site (rodapé + política de privacidade)
4. Registrar na ANPD (se exigido para sua categoria)

**Responsabilidades do DPO:**
- Receber e responder solicitações de titulares (15 dias)
- Orientar equipe sobre LGPD
- Interagir com ANPD em caso de fiscalização
- Manter registro de tratamento de dados

---

### 📌 FASE 2 - CURTO PRAZO (2-4 semanas) 🟡

#### 2.1 Criar Portal de Privacidade ✅ IMPORTANTE

**Arquivo:** `/app/[locale]/privacy/my-data/page.tsx`

**Funcionalidades:**

```typescript
// Portal do Usuário - Meus Dados

export default function MyDataPortal() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1>Meus Dados Pessoais</h1>
      
      {/* 1. Visualizar Todos os Dados */}
      <section>
        <h2>Dados Coletados</h2>
        <button onClick={viewAllData}>Ver Todos os Meus Dados</button>
        {/* Exibir: perfil, treinos, corridas, análises IA */}
      </section>
      
      {/* 2. Baixar Dados (Portabilidade) */}
      <section>
        <h2>Portabilidade</h2>
        <button onClick={downloadAllData}>
          Baixar Meus Dados (JSON)
        </button>
        {/* Gera arquivo JSON com TODOS os dados */}
      </section>
      
      {/* 3. Corrigir Dados */}
      <section>
        <h2>Correção</h2>
        <button onClick={() => router.push('/perfil')}>
          Editar Meu Perfil
        </button>
      </section>
      
      {/* 4. Excluir Dados */}
      <section className="border-red-500 border-2 p-4">
        <h2>Exclusão</h2>
        <p>Excluir permanentemente todos os meus dados.</p>
        <button onClick={handleDelete} className="bg-red-600">
          Excluir Minha Conta
        </button>
      </section>
      
      {/* 5. Histórico de Consentimentos */}
      <section>
        <h2>Consentimentos</h2>
        <ul>
          {consents.map(c => (
            <li key={c.id}>
              {c.type} - Aceito em {c.date}
              {c.canRevoke && (
                <button onClick={() => revokeConsent(c.id)}>
                  Revogar
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      
      {/* 6. Compartilhamento */}
      <section>
        <h2>Compartilhamento de Dados</h2>
        <ul>
          <li>Strava: {stravaConnected ? 'Conectado' : 'Não conectado'}</li>
          <li>OpenAI: Dados do perfil para geração de planos</li>
          <li>Stripe: Dados de pagamento</li>
        </ul>
      </section>
      
      {/* 7. Contato DPO */}
      <section>
        <h2>Dúvidas sobre seus dados?</h2>
        <p>Email: dpo@atherarun.com</p>
        <p>Resposta em até 15 dias úteis</p>
      </section>
    </div>
  );
}
```

**APIs Necessárias:**

```typescript
// GET /api/privacy/my-data - Retorna TODOS os dados do usuário
// GET /api/privacy/export - Gera JSON para download
// POST /api/privacy/revoke-consent - Revoga consentimento específico
// GET /api/privacy/consents - Lista histórico de consentimentos
```

---

#### 2.2 Implementar Aviso sobre IA (Transparência) ✅ IMPORTANTE

**Onde:** Step 5 do onboarding (antes de gerar plano)

```typescript
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
  <h3 className="font-bold text-blue-900">🤖 Sobre Inteligência Artificial</h3>
  <p className="text-sm text-blue-800">
    Seu plano de treino será gerado por inteligência artificial (OpenAI GPT-4o).
    Para isso, enviaremos os dados do seu perfil (idade, peso, nível, objetivos)
    para processamento. A OpenAI possui compromisso de privacidade e não treina
    seus modelos com dados de clientes.
  </p>
  <a href="/privacy-policy#ai-processing" className="text-blue-600 underline text-sm">
    Saiba mais sobre processamento por IA
  </a>
</div>
```

---

#### 2.3 Criar Registro de Atividades de Tratamento ✅ IMPORTANTE

**Documento:** `REGISTRO_TRATAMENTO_DADOS_LGPD.md`

```markdown
# Registro de Atividades de Tratamento de Dados

## Controlador
- Nome: [Sua Empresa Ltda]
- CNPJ: [XX.XXX.XXX/XXXX-XX]
- DPO: dpo@atherarun.com

## Atividade 1: Cadastro de Usuário
- Dados: Nome, email, senha (hash)
- Finalidade: Criação de conta
- Base Legal: Execução de contrato (Art. 7º, V)
- Retenção: Até exclusão da conta
- Compartilhamento: Não
- Medidas de segurança: Bcrypt, SSL

## Atividade 2: Perfil de Atleta
- Dados: Peso, altura, idade, gênero, nível, experiência
- Finalidade: Personalização de planos
- Base Legal: Execução de contrato (Art. 7º, V)
- Retenção: Até exclusão da conta
- Compartilhamento: OpenAI (DPA)
- Medidas de segurança: SSL, autenticação

## Atividade 3: Dados de Saúde (OPCIONAL)
- Dados: Lesões, condições médicas, ciclo menstrual
- Finalidade: Personalização avançada
- Base Legal: Consentimento específico (Art. 11, I)
- Retenção: Até revogação ou exclusão
- Compartilhamento: OpenAI (DPA)
- Medidas de segurança: SSL, autenticação, consentimento destacado

## Atividade 4: Integração Strava
- Dados: Tokens OAuth, atividades, métricas
- Finalidade: Sincronização de treinos
- Base Legal: Consentimento (Art. 7º, I)
- Retenção: Até desconexão
- Compartilhamento: Strava (OAuth)
- Medidas de segurança: Tokens criptografados, SSL

## Atividade 5: Pagamentos
- Dados: Email, Stripe Customer ID
- Finalidade: Processar assinaturas
- Base Legal: Execução de contrato (Art. 7º, V)
- Retenção: 5 anos (Código Civil)
- Compartilhamento: Stripe (PCI-DSS compliant)
- Medidas de segurança: Não armazenamos cartões

## Atividade 6: Análises de IA
- Dados: Perfil completo do atleta
- Finalidade: Geração de planos e análises
- Base Legal: Execução de contrato (Art. 7º, V)
- Retenção: Não retido pela OpenAI
- Compartilhamento: OpenAI GPT-4o
- Medidas de segurança: DPA, SSL, sem armazenamento

## Atividade 7: Logs de Sistema
- Dados: IP, User-Agent, ações
- Finalidade: Segurança e debug
- Base Legal: Interesse legítimo (Art. 7º, IX)
- Retenção: 30 dias
- Compartilhamento: Não
- Medidas de segurança: Acesso restrito
```

---

### 📌 FASE 3 - MÉDIO PRAZO (1-2 meses) 🟢

#### 3.1 Implementar Logs de Auditoria ✅ RECOMENDADO

**Schema:**
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR,
  action VARCHAR NOT NULL, -- 'view_profile', 'update_profile', 'delete_data', etc
  entity_type VARCHAR, -- 'profile', 'plan', 'workout', etc
  entity_id INT,
  ip_address VARCHAR,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

**Middleware:**
```typescript
// middleware/audit.ts
export async function auditLog(action: string, userId: string, details: any) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType: details.entityType,
      entityId: details.entityId,
      ipAddress: details.ip,
      userAgent: details.userAgent,
      timestamp: new Date()
    }
  });
}
```

---

#### 3.2 Banner de Cookies ✅ RECOMENDADO

**Componente:** `/components/cookie-banner.tsx`

```typescript
'use client';

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') setAccepted(true);
  }, []);
  
  if (accepted) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <p className="text-sm">
          Usamos cookies técnicos para melhorar sua experiência.{' '}
          <a href="/privacy-policy#cookies" className="underline">
            Saiba mais
          </a>
        </p>
        <button
          onClick={() => {
            localStorage.setItem('cookie-consent', 'true');
            setAccepted(true);
          }}
          className="bg-white text-gray-900 px-4 py-2 rounded"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
```

---

#### 3.3 Revisão de Decisões Automatizadas ✅ RECOMENDADO

**Contexto:** Geração de planos com IA

**Implementação:**
```typescript
// app/api/plan/review-request/route.ts
// Permite usuário solicitar revisão humana do plano gerado

POST /api/plan/review-request
Body: {
  planId: number,
  reason: string
}

Response: {
  ticketId: string,
  status: 'pending_review',
  estimatedResponse: '72 hours'
}
```

**No Dashboard:**
```typescript
<button onClick={requestReview}>
  Solicitar Revisão Humana do Plano
</button>
```

---

## 📊 RESUMO DE PRIORIDADES

### 🚨 CRÍTICO (Fazer AGORA - 1-2 semanas)

| Item | Esforço | Risco Legal | Prioridade |
|------|---------|-------------|------------|
| Política de Privacidade | 4h | 🔴 Alto | P0 |
| Termos de Uso | 2h | 🔴 Alto | P0 |
| Checkbox Consentimento | 3h | 🔴 Alto | P0 |
| Salvar Consentimentos (BD) | 4h | 🔴 Alto | P0 |
| Nomear DPO | 1h | 🟡 Médio | P0 |
| Aviso Dados Sensíveis | 2h | 🔴 Alto | P0 |

**Total Fase 1:** ~16 horas (2 dias de trabalho)

---

### 🟡 ALTO (Fazer em 2-4 semanas)

| Item | Esforço | Risco Legal | Prioridade |
|------|---------|-------------|------------|
| Portal "Meus Dados" | 12h | 🟡 Médio | P1 |
| API Portabilidade (Export JSON) | 4h | 🟡 Médio | P1 |
| API Revogação Consentimento | 3h | 🟡 Médio | P1 |
| Registro de Tratamento | 3h | 🟡 Médio | P1 |
| Aviso sobre IA | 2h | 🟡 Médio | P1 |

**Total Fase 2:** ~24 horas (3 dias de trabalho)

---

### 🟢 MÉDIO (Fazer em 1-2 meses)

| Item | Esforço | Risco Legal | Prioridade |
|------|---------|-------------|------------|
| Logs de Auditoria | 6h | 🟢 Baixo | P2 |
| Banner de Cookies | 2h | 🟢 Baixo | P2 |
| Revisão Decisões Automatizadas | 8h | 🟢 Baixo | P2 |

**Total Fase 3:** ~16 horas (2 dias de trabalho)

---

## 💰 ESTIMATIVA DE CUSTOS

### Desenvolvimento

| Fase | Horas | Custo (R$ 150/h) | Prazo |
|------|-------|------------------|-------|
| Fase 1 (Crítico) | 16h | R$ 2.400 | 1-2 semanas |
| Fase 2 (Alto) | 24h | R$ 3.600 | 2-4 semanas |
| Fase 3 (Médio) | 16h | R$ 2.400 | 1-2 meses |
| **TOTAL** | **56h** | **R$ 8.400** | **2-3 meses** |

### Outros Custos

- **DPO Terceirizado** (opcional): R$ 500-2.000/mês
- **Consultoria Jurídica LGPD**: R$ 3.000-10.000 (uma vez)
- **Seguro Cyber**: R$ 200-500/mês (opcional)

---

## ⚖️ RISCOS E MULTAS

### Cenário Atual (SEM implementação)

**Riscos:**
- 🔴 Tratamento de dados sensíveis sem consentimento específico (Art. 11)
- 🔴 Ausência de base legal para tratamento (Art. 7º)
- 🟡 Direitos do titular não implementados (Art. 18)
- 🟡 Ausência de DPO (Art. 41)

**Multa Potencial:**
- **Mínimo:** Advertência + prazo para adequação
- **Médio:** R$ 500.000 - 5.000.000 (dados sensíveis)
- **Máximo:** R$ 50.000.000 OU 5% do faturamento anual

**Probabilidade:**
- Fiscalização ANPD: **Baixa** (empresa pequena)
- Denúncia de usuário: **Média** (se houver insatisfação)
- Vazamento de dados: **Baixa** (infraestrutura boa)

---

### Cenário Futuro (COM implementação Fase 1+2)

**Riscos:**
- ✅ Conformidade básica alcançada
- ✅ Bases legais documentadas
- ✅ Direitos do titular implementados
- 🟡 Auditoria completa ainda pendente

**Multa Potencial:**
- **Mínimo:** R$ 0 (conformidade)
- **Médio:** R$ 50.000 (pequenas inconsistências)
- **Máximo:** R$ 500.000 (se houver incidente)

**Probabilidade:**
- Fiscalização ANPD: **Muito Baixa**
- Denúncia de usuário: **Muito Baixa**
- Vazamento de dados: **Baixa** (mesma infraestrutura)

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ Fase 1 - CRÍTICO (P0)

- [ ] Criar `/app/[locale]/privacy-policy/page.tsx`
- [ ] Criar `/app/[locale]/terms-of-service/page.tsx`
- [ ] Adicionar checkboxes no `/app/[locale]/signup/page.tsx`
- [ ] Adicionar checkboxes em Step 4 (dados de saúde) do onboarding
- [ ] Criar migration `20251117_add_consent_tracking`
- [ ] Criar API `/api/consent/record`
- [ ] Integrar gravação de consentimentos no signup
- [ ] Nomear DPO e criar email dpo@atherarun.com
- [ ] Adicionar contato DPO no rodapé do site
- [ ] Atualizar README.md com link de privacidade

---

### ✅ Fase 2 - ALTO (P1)

- [ ] Criar `/app/[locale]/privacy/my-data/page.tsx`
- [ ] Criar API `/api/privacy/my-data` (GET - visualizar)
- [ ] Criar API `/api/privacy/export` (GET - download JSON)
- [ ] Criar API `/api/privacy/consents` (GET - histórico)
- [ ] Criar API `/api/privacy/revoke-consent` (POST)
- [ ] Adicionar aviso sobre IA no Step 5 do onboarding
- [ ] Criar documento `REGISTRO_TRATAMENTO_DADOS_LGPD.md`
- [ ] Adicionar link "Meus Dados" no menu do perfil

---

### ✅ Fase 3 - MÉDIO (P2)

- [ ] Criar migration `20251117_add_audit_logs`
- [ ] Criar middleware de auditoria
- [ ] Integrar logs em todas APIs críticas
- [ ] Criar `/components/cookie-banner.tsx`
- [ ] Adicionar cookie banner no layout
- [ ] Criar API `/api/plan/review-request`
- [ ] Adicionar botão "Solicitar Revisão" no dashboard

---

## 🎯 CONCLUSÃO E PRÓXIMOS PASSOS

### Status Atual: ⚠️ **NÃO CONFORME**

**Principais Gaps:**
1. 🔴 Sem política de privacidade ou termos de uso
2. 🔴 Coleta de dados sensíveis sem consentimento específico
3. 🔴 Direitos do titular não implementados
4. 🟡 Sem DPO nomeado
5. 🟡 Sem registro de tratamento

---

### Status Futuro (Pós-Implementação): ✅ **CONFORME**

**Após Fase 1+2:**
- ✅ Base legal clara para todo tratamento
- ✅ Consentimentos documentados
- ✅ Direitos do titular implementados
- ✅ Transparência total sobre uso de dados
- ✅ Portal de privacidade funcional
- ✅ DPO nomeado e acessível
- ✅ Conformidade de ~90% com LGPD

---

### Recomendação Final

**Executar FASE 1 IMEDIATAMENTE:**
- Risco legal alto de multa
- Esforço baixo (2 dias de dev)
- Impacto massivo na conformidade

**Executar FASE 2 em seguida:**
- Completa conformidade básica
- Melhora confiança dos usuários
- Diferencial competitivo

**FASE 3 pode esperar:**
- Melhorias incrementais
- Não há risco legal urgente

---

## 📞 CONTATOS ÚTEIS

- **ANPD** (Autoridade Nacional): https://www.gov.br/anpd
- **Canal de denúncias ANPD**: https://www.gov.br/anpd/pt-br/canais_atendimento
- **Consultoria LGPD**: Considere contratar para revisão final
- **DPO Terceirizado**: Opção viável para startups

---

**Documento preparado por:** GitHub Copilot CLI  
**Data:** 17/Novembro/2025  
**Versão:** 1.0  
**Status:** Análise Completa

---

## 📚 REFERÊNCIAS

1. Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
2. ANPD - Guia de Boas Práticas (2024)
3. Jurisprudência LGPD (Jusbrasil, 2025)
4. GDPR (inspiração - Europa)
5. Código de Defesa do Consumidor (Lei 8.078/1990)

---

**🔒 Este é um documento técnico e não substitui consultoria jurídica especializada.**
