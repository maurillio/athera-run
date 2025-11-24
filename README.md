
# 🏃 Athera Run

> Plataforma inteligente de treinamento de corrida com IA

**Versão:** 3.1.0 (Convergência Total de Dados) ✅  
**Última atualização:** 24 de Novembro de 2025 - 19:00 UTC  
**Website:** https://atherarun.com  
**Status:** ✅ 60% Problemas Críticos Resolvidos - Pronto para Deploy  
**Database:** 🌩️ Neon PostgreSQL 16.9 (US East)

---

## 🎉 v3.1.0 - Convergência Total de Dados

**Implementação Completa:** 5 Fases, 6 Arquivos, +920 Linhas

### O Que Mudou

✅ **17 novos campos** exibidos e editáveis  
✅ **Disponibilidade 100% editável** (adicionar/remover atividades sem refazer onboarding)  
✅ **Performance transparente** (VDOT, paces, experiência IA visível)  
✅ **Motivação completa** (primary + secondary + goals)  
✅ **AI Tracking** conectado ao banco de dados real  
✅ **Migration SQL** para consolidar race goals  
✅ **Zero duplicações** de dados fisiológicos  

### Impacto

| Métrica | Antes | Agora | Melhoria |
|---------|-------|-------|----------|
| Campos exibidos | 53% | 75% | **+22%** |
| Campos editáveis | 43% | 70% | **+27%** |
| Duplicações | 5 | 2 | **-60%** |
| Problemas resolvidos | 0/15 | 9/15 | **60%** |

### Testes

✅ **31/31 testes E2E passados**  
✅ **Build sucesso** (0 erros TypeScript)  
✅ **Sistema validado** e pronto para produção

📄 **Documentação Completa:** [RESUMO_IMPLEMENTACAO_COMPLETO_v3_1_0.md](./RESUMO_IMPLEMENTACAO_COMPLETO_v3_1_0.md)

---

## 📚 Documentação Completa

### 📖 Documentos Principais
1. **[CONTEXTO_ATUALIZADO_07NOV2025.md](./CONTEXTO_ATUALIZADO_07NOV2025.md)** 
   - Contexto completo do projeto
   - Arquitetura técnica detalhada
   - Todos os fluxos e integrações
   - Schema completo do banco
   - Algoritmos e cálculos

2. **[HISTORICO_COMPLETO_07NOV2025.md](./HISTORICO_COMPLETO_07NOV2025.md)**
   - Histórico detalhado da sessão 07/Nov/2025
   - Todos os problemas identificados
   - Todas as correções implementadas
   - Resultados e métricas alcançadas

3. **[ANALISE_PROFUNDA_COMPLETA.md](./ANALISE_PROFUNDA_COMPLETA.md)**
   - Análise técnica profunda do sistema
   - Mapeamento completo de campos
   - Gaps e soluções
   - Plano de ação executado

---

## 🎯 Status Atual - v1.5.5

### ✅ Implementações Concluídas

#### 1. Correção Erro Crítico
- ❌ **Problema:** `otherSportsExperience: Expected String, provided []`
- ✅ **Solução:** Conversão correta de array para string/null
- ✅ **Status:** Perfis criados com sucesso

#### 2. Dia do Longão
- ✅ Seletor implementado no Step 6
- ✅ Validação obrigatória
- ✅ Salvo no banco (campo `longRunDay`)
- ✅ Exibido no perfil (AvailabilityTab)
- ✅ Usado na geração de planos

#### 3. Aba de Preferências (NOVA)
- ✅ Idioma (pt-BR, en-US, es-ES)
- ✅ Sistema de medidas (métrico/imperial)
- ✅ Notificações (email, push, SMS)
- ✅ Preferências de treino
- ✅ Tema (claro/escuro/sistema)
- ✅ Auto-save (debounce 1s)
- ✅ Integração com i18n

#### 4. PerformanceTab Completa
- ✅ Nível e experiência
- ✅ Ritmos de treino formatados
- ✅ Melhores tempos com badges
- ✅ VDOT e análise da IA
- ✅ Longão recente

#### 5. AvailabilityTab Detalhada
- ✅ Grid de 7 dias da semana
- ✅ Destaque para dia do longão (⭐)
- ✅ Infraestrutura (academia, piscina, pista)
- ✅ Resumo de disponibilidade

#### 6. Convergência Total
- ✅ Onboarding → Perfil: 89% dos campos exibidos
- ✅ Perfil → Plano: 85% dos campos utilizados
- ✅ Zero duplicidades
- ✅ Zero incongruências

### 📊 Métricas de Convergência

**ANTES:**
```
Campos coletados: 38/47 (81%)
Campos exibidos: 20/47 (43%) 🔴
Campos usados: 30/47 (64%)
Gap de Visibilidade: 57% 🔴
```

**DEPOIS:**
```
Campos coletados: 40/47 (85%) ✅
Campos exibidos: 42/47 (89%) ✅
Campos usados: 40/47 (85%) ✅
Gap de Visibilidade: 11% ✅
```

**Melhoria:** +46% de visibilidade | +21% de utilização

---

## 🎯 Últimas Atualizações

### v1.5.1 - Database Migration to Neon (07/Nov/2025)
- 🌩️ **NOVO**: Banco migrado para Neon (PostgreSQL as a Service)
- ⚡ Performance 40-100x mais rápida (latência 1-5ms)
- 🔄 Backups automáticos e contínuos
- 🛡️ Alta disponibilidade (99.95% SLA)
- 📊 Zero manutenção de servidor
- 📄 Ver: [MIGRACAO_NEON_07NOV2025.md](MIGRACAO_NEON_07NOV2025.md)

### v1.5.1 - Correção Crítica do Onboarding (06/Nov/2025)
- ✅ **CRÍTICO**: Restaurados campos de Race Goal no Step5
- ✅ Usuários agora podem gerar planos de treino após onboarding
- ✅ Adicionadas 16 traduções em 3 idiomas
- ✅ Sistema completo end-to-end funcional
- 📄 Ver: [CORRECAO_ONBOARDING_06NOV2025.md](CORRECAO_ONBOARDING_06NOV2025.md)

### v1.4.0 - Multilinguagem Completo (05/Nov/2025)
- ✅ Sistema i18n completo (pt-BR, en, es)
- ✅ 85% do sistema traduzido
- ✅ Onboarding totalmente internacionalizado

### v1.3.0 - Estruturação Avançada (03/Nov/2025)
- ✅ Perfil atleta v1.3.0 com fisiologia avançada
- ✅ Sistema de motivação estruturada
- ✅ Infraestrutura e preferências de treino

---

## 📖 Sobre o Projeto

**Athera Run** é uma plataforma SaaS de treinamento de corrida que utiliza inteligência artificial para gerar planos de treino 100% personalizados. Diferente de templates genéricos, cada plano é único e considera:

- 🎯 **Perfil completo do atleta** (nível, histórico, disponibilidade real)
- 🏁 **Múltiplas corridas** (sistema A/B/C de classificação automática)
- 📊 **Metodologia VDOT** (Jack Daniels - científica e comprovada)
- 🔄 **Integração com Strava** (sincronização automática de atividades)
- 🤖 **IA GPT-4o** (OpenAI - geração inteligente de planos)

### 🎯 Diferenciais Competitivos

✅ **Planos 100% personalizados** - Não são templates, são gerados por IA  
✅ **Sistema multi-corrida** - Gerencia várias provas simultaneamente  
✅ **Classificação inteligente** - IA identifica automaticamente corridas A/B/C  
✅ **Periodização científica** - Base → Build → Peak → Taper  
✅ **Auto-ajuste FREE** - Atualiza plano ao mudar disponibilidade (todos usuários)  
✅ **Integração Strava** - Sincronização automática (Premium)  
✅ **Análise inteligente** - IA analisa progresso e sugere ajustes (Premium)  
✅ **Chat com treinador virtual** - Suporte personalizado 24/7  

---

## 🚀 Acesso Rápido

### 🌐 Aplicação Online
**Produção:** https://atherarun.com  
**Status:** ✅ Online e estável

### 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[DOCUMENTACAO.md](DOCUMENTACAO.md)** | 📘 Documentação completa do produto |
| **[GUIA_TECNICO.md](GUIA_TECNICO.md)** | 🛠️ Guia técnico para desenvolvedores |
| **[ROADMAP.md](ROADMAP.md)** | 🗺️ Roadmap e planejamento futuro |

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js** 14.2.28 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS 3.4 + Shadcn UI + Radix UI
- **State**: Zustand 5.0 + React Query 5.0
- **Charts**: Recharts, React-Chartjs-2, Plotly.js

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (REST)
- **Database**: PostgreSQL 14+ (via Prisma ORM 6.18)
- **Auth**: NextAuth.js 4.24 (JWT + OAuth)

### IA & Integrações
- **LLM**: OpenAI GPT-4o (geração de planos)
- **Payments**: Stripe 19.2 (subscriptions + webhooks)
- **Wearables**: Strava API (OAuth 2.0 + webhooks)

### Infraestrutura
- **Hosting**: Vercel (frontend + API routes + CI/CD)
- **Database**: PostgreSQL (servidor próprio)
- **Domain**: atherarun.com (via GoDaddy)
- **Deploy**: Automático via Git push
- **Monitoring**: Vercel Analytics

---

## 💻 Setup Local

### Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **PostgreSQL** 14+ ([download](https://postgresql.org/))
- **Yarn** (recomendado) ou npm
- **Git**

### Instalação Rápida

```bash
# 1. Clone e navegue
cd athera-run/nextjs_space

# 2. Instale dependências
yarn install

# 3. Configure ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Setup banco de dados
yarn prisma generate
yarn prisma db push

# 5. (Opcional) Seed com dados de teste
yarn prisma db seed

# 6. Inicie dev server
yarn dev

# 🚀 Acesse: http://localhost:3000
```

### Variáveis de Ambiente Essenciais

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/atherarun"

# NextAuth
NEXTAUTH_SECRET="openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (obrigatório para geração de planos)
OPENAI_API_KEY="sk-..."
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o"

# Google OAuth (obrigatório - feature crítica)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Strava
STRAVA_CLIENT_ID="seu-client-id"
STRAVA_CLIENT_SECRET="seu-client-secret"

# Stripe (opcional)
STRIPE_SECRET_KEY="sk_test_..."
```

📖 **Detalhes completos**: Ver [GUIA_TECNICO.md](GUIA_TECNICO.md)

---

## 📁 Estrutura Principal

```
athera-run/
├── nextjs_space/              # 🏠 Aplicação principal
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API Routes (REST endpoints)
│   │   ├── dashboard/        # Dashboard interativo
│   │   ├── plano/            # Visualização completa do plano
│   │   ├── onboarding/       # Fluxo de cadastro (5 etapas)
│   │   ├── perfil/           # Perfil do atleta
│   │   └── tracking/         # Acompanhamento de treinos
│   │
│   ├── components/           # Componentes React
│   │   ├── ui/              # Shadcn UI components
│   │   ├── dashboard/       # Dashboard específicos
│   │   └── plan/            # Plano específicos
│   │
│   ├── lib/                  # 🧠 Lógica de negócio
│   │   ├── ai-plan-generator.ts        # Gerador principal IA
│   │   ├── multi-race-plan-generator.ts # Sistema multi-corrida
│   │   ├── race-classifier.ts          # Classificador A/B/C
│   │   ├── strava.ts                   # Cliente Strava
│   │   ├── stripe.ts                   # Cliente Stripe
│   │   └── ...
│   │
│   ├── prisma/              # Banco de dados
│   │   ├── schema.prisma   # Schema completo
│   │   └── migrations/     # Histórico de migrações
│   │
│   └── scripts/            # Scripts utilitários
│
├── DOCUMENTACAO.md         # 📘 Documentação do produto
├── GUIA_TECNICO.md        # 🛠️ Guia técnico completo
└── ROADMAP.md             # 🗺️ Roadmap e planejamento
```

---

## 🎯 Como Usar

### Para Atletas

1. **Acesse**: https://atherarun.com
2. **Cadastre-se**: Email/senha ou Google OAuth
3. **Onboarding (5 etapas)**:
   - Dados básicos (peso, altura, idade)
   - Nível e experiência em corrida
   - Disponibilidade de dias e horários
   - Corridas e objetivos
   - Revisão e geração do plano
4. **Receba seu plano**: IA gera em ~30-60 segundos
5. **Acompanhe**: Dashboard interativo, marque treinos completos
6. **Conecte Strava**: Sincronização automática (opcional)
7. **Evolua**: IA ajusta seu plano conforme progresso

### Para Desenvolvedores

1. **Leia**: [DOCUMENTACAO.md](DOCUMENTACAO.md) - Entenda o produto
2. **Configure**: [GUIA_TECNICO.md](GUIA_TECNICO.md) - Setup completo
3. **Desenvolva**: Siga padrões de código documentados
4. **Teste**: 
   ```bash
   yarn ts-node scripts/comprehensive_test.ts
   ```
5. **Contribua**: Veja [ROADMAP.md](ROADMAP.md) para features futuras

---

## ✅ Status e Features

### 💎 Plano FREE vs PREMIUM

#### 🆓 FREE (R$ 0)
- ✅ Geração de plano personalizado com IA (GPT-4o)
- ✅ Dashboard completo com visualização semanal
- ✅ Calculadoras (VDOT, nutrição, pace)
- ✅ Sistema multi-corridas (A/B/C)
- ✅ Chat com treinador virtual (IA)
- ✅ **Auto-ajuste ao alterar disponibilidade/perfil**
- ✅ **Atualização automática ao mudar atividades**

#### ⭐ PREMIUM (R$ 29,90/mês ou R$ 288/ano)
- ✅ **Tudo do Free +**
- ✅ **Integração Strava** - Sincronização automática
- ✅ **Análise Inteligente de Progresso** - IA analisa treinos e feedbacks
- ✅ **Ajustes Automáticos Inteligentes** - Baseado em performance
- ✅ **Banner de Sugestões** - IA avisa quando detecta oportunidades
- ✅ **Relatórios Detalhados** - Análise semanal completa

### 🆕 Novidades v1.2.0

**Auto-Ajuste Progressivo (FREE):**
- Preserva todo histórico ao alterar disponibilidade
- Mantém treinos completados e taxa de conclusão
- Ajusta apenas treinos futuros
- Feedback claro: "X semanas anteriores preservadas"

**IA em Dias de Descanso:**
- Sugestões personalizadas por fase de treino
- Considera atividades disponíveis do usuário
- Dicas de recuperação e prevenção de lesões
- Contexto: base, build, peak ou taper

**Correções de UX:**
- Botão "Confirmar Treino" oculto em dias de descanso
- Consistência entre título e descrição (km sincronizados)
- Onboarding: apenas Masculino/Feminino (precisão VDOT)
- Transação atômica: plano nunca fica vazio durante ajuste

### Implementado (v1.2.0)

- [x] Autenticação (Email/senha + Google OAuth)
- [x] Onboarding inteligente (5 etapas com IA)
- [x] Geração de planos 100% personalizados
- [x] Sistema multi-corrida com classificação A/B/C
- [x] Dashboard interativo com métricas
- [x] Visualização completa do plano (todas as semanas)
- [x] Integração Strava (Premium - OAuth 2.0 + sincronização)
- [x] Sistema de assinaturas (Stripe + webhooks)
- [x] Customer Portal (gerenciar assinatura)
- [x] Chat com treinador virtual (GPT-4o)
- [x] Calculadoras (VDOT, nutrição)
- [x] Tracking de treinos completados
- [x] **Auto-ajuste progressivo (FREE)** - Preserva histórico
- [x] **Análise inteligente de progresso (Premium)**
- [x] **IA em dias de descanso** - Sugestões contextuais
- [x] **Validação de disponibilidade** - 100% escolha do usuário
- [x] **Transação atômica** - Plano nunca fica quebrado

### Em Desenvolvimento (Q4 2025)

- [ ] Notificações e lembretes por email
- [ ] Analytics avançados e dashboards
- [ ] Relatórios automáticos semanais

### Roadmap (2026)

- [ ] App mobile nativo (Q3 2026)
- [ ] Integração Garmin e Polar (Q1 2026)
- [ ] Social features e comunidade (Q2 2026)
- [ ] Marketplace de treinadores (Q2 2026)
- [ ] Internacionalização (EN, ES) (Q4 2026)

📖 **Ver detalhes**: [ROADMAP.md](ROADMAP.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

### Como Contribuir

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Adiciona MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Padrões

- **TypeScript** - Type safety obrigatório
- **Componentes** - Funcionais com hooks
- **Nomenclatura** - PascalCase (componentes), camelCase (funções)
- **Comentários** - Em português quando necessário
- **Formatação** - Prettier automático

📖 **Detalhes**: [GUIA_TECNICO.md](GUIA_TECNICO.md)

---

## 📊 Métricas Atuais

| Métrica | Valor |
|---------|-------|
| **Usuários Ativos** | 50+ |
| **Assinantes Premium** | 10+ |
| **Planos Gerados** | 100+ |
| **Uptime** | 99.9% |
| **Tempo Médio de Geração** | ~45s |
| **Taxa de Sucesso** | 95% |

*Última atualização: 03/Nov/2025*

---

## 🎓 Metodologia Científica

### VDOT (Jack Daniels)

Sistema baseado na metodologia **VDOT** de Jack Daniels:
- Calcula fitness level baseado em performances
- Define zonas de treino personalizadas
- Progressão segura e comprovada

📚 **Referências**:
- [Daniels' Running Formula](https://www.amazon.com/Daniels-Running-Formula-Jack/dp/1450431836)
- [VDOT Calculator](https://runsmartproject.com/calculator/)

### Periodização Clássica

```
BASE (40-50%) → BUILD (30-35%) → PEAK (10-15%) → TAPER (5-10%)
    ↓                ↓                ↓               ↓
Volume alto    Intensidade     Específico      Recuperação
Aeróbico       moderada        da prova        pré-prova
```

---

## 📞 Suporte e Links

### 📚 Documentação

- **Produto**: [DOCUMENTACAO.md](DOCUMENTACAO.md)
- **Técnica**: [GUIA_TECNICO.md](GUIA_TECNICO.md)
- **Roadmap**: [ROADMAP.md](ROADMAP.md)

### 🌐 Links Úteis

- **Website**: https://atherarun.com
- **Email**: suporte@atherarun.com
- **Issues**: GitHub Issues (este repo)

### 🛠️ Para Desenvolvedores

- **Next.js**: [Docs](https://nextjs.org/docs)
- **Prisma**: [Docs](https://www.prisma.io/docs)
- **Strava API**: [Docs](https://developers.strava.com)
- **Stripe**: [Docs](https://stripe.com/docs)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">

### 🏃‍♂️ Feito com ❤️ para corredores por corredores 🏃‍♀️

**[Website](https://atherarun.com)** • **[Documentação](DOCUMENTACAO.md)** • **[Roadmap](ROADMAP.md)**

**© 2025 Athera Run** - O futuro da corrida é agora 💨

</div>

---

## 📖 Documentação Completa

### Documentos Principais
- **[CONTEXTO_ATUALIZADO_07NOV2025.md](./CONTEXTO_ATUALIZADO_07NOV2025.md)** - Contexto completo do projeto, arquitetura, fluxos e integrações
- **[HISTORICO_COMPLETO_07NOV2025.md](./HISTORICO_COMPLETO_07NOV2025.md)** - Histórico detalhado da sessão de desenvolvimento de 07/Nov/2025
- **[ANALISE_PROFUNDA_COMPLETA.md](./ANALISE_PROFUNDA_COMPLETA.md)** - Análise técnica profunda do sistema

### Status Atual
🟢 **Sistema Operacional e Estável**

**Últimas Implementações (v1.5.5):**
- ✅ Correção erro crítico otherSportsExperience
- ✅ Implementação dia do longão no onboarding
- ✅ Aba de Preferências completa (idioma, medidas, tema, notificações)
- ✅ PerformanceTab enriquecida com todos os dados de experiência
- ✅ AvailabilityTab detalhada com grid de dias e infraestrutura
- ✅ Auto-save em preferências com debounce
- ✅ Convergência total: Onboarding → Perfil → Geração de Planos

### Métricas de Convergência
```
✅ Campos coletados no onboarding: 40/47 (85%)
✅ Campos exibidos no perfil: 42/47 (89%)
✅ Campos usados na geração: 40/47 (85%)

Gap de Visibilidade: 11% (excelente!)
Gap de Utilização: 15% (muito bom!)
```

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Neon (PostgreSQL)
- Conta Clerk
- Conta OpenAI
- Conta Stripe

### Instalação Local
```bash
# Clone o repositório
git clone [repo-url]
cd athera-run

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Gere o Prisma Client
npx prisma generate

# Execute as migrations
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

### Deploy em Produção
```bash
# Build
npm run build

# Push para main (deploy automático no Vercel)
git push origin main
```

---

## 🏗️ Arquitetura

### Stack
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **Auth:** Clerk
- **Payments:** Stripe
- **AI:** OpenAI GPT-4
- **Deploy:** Vercel + Neon

### Estrutura de Pastas
```
athera-run/
├── app/                    # Next.js App Router
│   ├── (authenticated)/   # Rotas protegidas
│   ├── (public)/          # Rotas públicas
│   └── api/               # API Routes
├── components/            # Componentes React
├── contexts/              # React Contexts
├── lib/                   # Utilitários e helpers
├── prisma/                # Schema e migrations
└── public/                # Assets estáticos
```

---

## 🔄 Fluxo Principal

### 1. Onboarding (7 Steps)
```
Step 1: Dados Pessoais → 
Step 2: Experiência de Corrida → 
Step 3: Performance → 
Step 4: Saúde → 
Step 5: Objetivos → 
Step 6: Disponibilidade (com dia do longão) → 
Step 7: Revisão → 
  Criação do Perfil
```

### 2. Perfil (6 Abas)
```
📊 Visão Geral
🏃 Performance (nível, ritmos, VDOT, análise IA)
📅 Disponibilidade (dias, longão, infraestrutura)
🏥 Saúde (lesões, restrições)
🎯 Objetivos (meta, prova, progresso)
⚙️ Preferências (idioma, medidas, tema, notificações)
```

### 3. Geração de Plano
```
Validação do Perfil → 
Cálculo VDOT → 
Personalização IA → 
Distribuição de Treinos (respeitando dia do longão) → 
Geração de Datas → 
Salvamento → 
Dashboard
```

---

## 🔑 Variáveis de Ambiente

```bash
# Database (Neon)
DATABASE_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI (OpenAI)
OPENAI_API_KEY="sk-..."

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Strava
STRAVA_CLIENT_ID="..."
STRAVA_CLIENT_SECRET="..."
NEXT_PUBLIC_STRAVA_REDIRECT_URI="..."

# App
NEXT_PUBLIC_APP_URL="https://atherarun.com"
```

---

## 📊 Schema do Banco

### AthleteProfile (47 campos)
Perfil completo do atleta incluindo:
- Dados básicos (idade, peso, altura, gênero)
- Experiência (nível, anos, volume, ritmos)
- Performance (melhores tempos, VDOT)
- Saúde (lesões, condições, restrições)
- Objetivos (distância, data, tempo)
- Disponibilidade (dias, longão, infraestrutura)
- Preferências (idioma, medidas, tema, notificações)
- Integrações (Strava)

### TrainingPlan
Plano de treino personalizado com:
- Estrutura de semanas
- Treinos detalhados
- Datas específicas
- Status de progresso

### TrainingLog
Registro de treinos realizados

### Race
Gerenciamento de corridas

---

## 🧪 Testes

### Testes Manuais Realizados
- ✅ Onboarding completo (todos os 7 steps)
- ✅ Criação de perfil
- ✅ Visualização de perfil (todas as 6 abas)
- ✅ Edição de preferências com auto-save
- ✅ Geração de plano personalizado
- ✅ Dashboard

### Próximos Testes
- [ ] Testes E2E automatizados (Playwright)
- [ ] Testes de integração das APIs
- [ ] Testes de performance
- [ ] Testes de acessibilidade

---

## 📈 Roadmap

### Próximos Passos Imediatos
1. Auto-save em Steps 3, 4 e 6 do onboarding
2. Testes E2E automatizados
3. Validação progressiva em cada step
4. Completar traduções (en-US, es-ES)

### Q4 2025
- Analytics avançado
- Notificações push
- App mobile

### Q1 2026
- AI Coach conversacional
- Funcionalidades sociais
- Grupos de treino

---

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe.

---

## 📄 Licença

Proprietário - Athera Run © 2025

---

## 📞 Suporte

- **Email:** support@atherarun.com
- **Website:** https://atherarun.com
- **Documentação:** Ver arquivos .md na raiz do projeto

---

**Mantido com ❤️ pela equipe Athera**
# Strava Enhancement v2.6.0 - Thu Nov 20 16:17:36 UTC 2025
