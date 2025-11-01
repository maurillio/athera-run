# 📊 PLANO DE NEGÓCIOS - ATHERA RUN
## Plataforma Inteligente de Treinamento para Maratonistas

**Data:** Novembro de 2025  
**Versão:** 2.0  
**Contato:** mmaurillio2@gmail.com  
**Website:** https://atherarun.com

---

## 📑 ÍNDICE

1. [Sumário Executivo](#sumário-executivo)
2. [Análise de Mercado](#análise-de-mercado)
3. [Produto e Tecnologia](#produto-e-tecnologia)
4. [Modelo de Negócio](#modelo-de-negócio)
5. [Estratégia de Crescimento](#estratégia-de-crescimento)
6. [Análise Competitiva](#análise-competitiva)
7. [Projeções Financeiras](#projeções-financeiras)
8. [Roadmap de Desenvolvimento](#roadmap-de-desenvolvimento)
9. [Time e Recursos](#time-e-recursos)
10. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 1. SUMÁRIO EXECUTIVO

### 🎯 Visão Geral

**Athera Run** é uma plataforma SaaS de treinamento personalizado para maratonistas que utiliza **Inteligência Artificial (GPT-4)** para criar planos de treino dinâmicos e adaptativos, integrando-se nativamente com **Strava** e **Google OAuth**.

### 💡 Proposta de Valor

- **Personalização Real**: IA analisa perfil, histórico e objetivos para criar planos únicos
- **Adaptação Contínua**: Ajustes automáticos baseados em performance e feedback
- **Integração Nativa**: Sincronização automática com Strava (10M+ usuários)
- **Acessibilidade**: 70% mais barato que treinadores pessoais (R$ 29-99/mês vs R$ 300-500/mês)
- **Científico e Comprovado**: Baseado em metodologias VDOT, periodização e ciência do esporte

### 📊 Status Atual (Novembro 2025)

- ✅ **MVP Funcional** em produção
- ✅ **14 Funcionalidades Core** implementadas
- ✅ **Integração Strava** completa com OAuth 2.0
- ✅ **Gerador de Planos com IA** (GPT-4o)
- ✅ **Dashboard Responsivo** (mobile-first)
- 🚀 **Pronto para Beta Privado** com primeiros usuários

### 🎯 Objetivos 12 Meses

| Métrica | Mês 3 | Mês 6 | Mês 12 |
|---------|-------|-------|--------|
| Usuários Ativos | 100 | 500 | 2.000 |
| Planos Gerados | 150 | 800 | 3.500 |
| MRR (R$) | 2.000 | 15.000 | 80.000 |
| Taxa de Conversão | 5% | 10% | 15% |
| Churn Mensal | <10% | <7% | <5% |

---

## 2. ANÁLISE DE MERCADO

### 🌍 Mercado Global de Corrida

#### Tamanho do Mercado

**Mercado Global:**
- **120 milhões** de corredores regulares no mundo (2024)
- **US$ 12.5 bilhões** - mercado de aplicativos fitness (2024)
- **CAGR 17.8%** - crescimento anual projetado até 2030
- **35%** dos corredores usam apps de treino

**Brasil:**
- **6 milhões** de praticantes de corrida (2024)
- **2.1 milhões** em corridas de rua (Track & Field/Corpore)
- **400 mil** finishers em maratonas e meias-maratonas/ano
- **R$ 1.8 bilhões** - mercado de corridas de rua (2024)

#### Perfil do Cliente Ideal (ICP)

**Demografia:**
- Idade: 28-45 anos (60% do público)
- Renda: Classe A/B (R$ 5.000+)
- Educação: Superior completo (70%)
- Localização: Grandes centros urbanos (SP, RJ, BH, Porto Alegre)

**Características:**
- Já corre regularmente (3-5x/semana)
- Objetivo de completar maratona em 6-12 meses
- Usuário ativo de Strava (sync automático)
- Busca resultados baseados em ciência
- Não pode pagar treinador pessoal (R$ 300-500/mês)
- Tech-savvy, confortável com apps

**Dores e Necessidades:**
- ❌ Planos genéricos não funcionam
- ❌ Falta de adaptação a imprevistos
- ❌ Não sabe se está evoluindo
- ❌ Overtraining ou undertraining
- ❌ Treinadores pessoais muito caros

### 📊 Segmentação de Mercado

#### TAM (Total Addressable Market)
- **6M corredores Brasil** × R$ 588/ano (R$ 49/mês) = **R$ 3.5 bilhões/ano**

#### SAM (Serviceable Available Market)
- **400k maratonistas sérios** × R$ 588/ano = **R$ 235 milhões/ano**

#### SOM (Serviceable Obtainable Market - Ano 1)
- **2.000 usuários** × R$ 588/ano = **R$ 1.2 milhão** (0.5% do SAM)

### 🔥 Tendências de Mercado

1. **Boom de Maratonas Pós-Pandemia**
   - +35% de inscrições vs 2019
   - Eventos esgotando em horas (Maratona SP, Rio)

2. **Explosão de Wearables**
   - 45% dos corredores usam smartwatch
   - Integração com apps é diferencial competitivo

3. **Ascensão da IA no Fitness**
   - Usuários esperam personalização real
   - IA vista como "democratização do treinador"

4. **Comunidade e Gamificação**
   - Strava como rede social de corrida
   - Competições virtuais em alta

---

## 3. PRODUTO E TECNOLOGIA

### 🚀 Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router) - React framework moderno
- TypeScript - Type safety
- Tailwind CSS + Shadcn/UI - Design system responsivo
- Recharts/Plotly - Visualização de dados

**Backend:**
- Next.js API Routes - Serverless
- Prisma ORM - Type-safe database queries
- PostgreSQL - Banco relacional robusto
- NextAuth.js - Autenticação segura

**IA e Integrações:**
- OpenAI GPT-4o - Geração de planos e chat
- Strava API v3 - Sincronização de treinos
- Google OAuth - Login social

**Infraestrutura:**
- Abacus.AI - Deploy e hosting
- GitHub - Versionamento
- Vercel-ready - Escalabilidade

### ✨ Funcionalidades Implementadas

#### Core (14 features)

**Autenticação e Perfil:**
- ✅ Login/Signup com email ou Google
- ✅ OAuth 2.0 com Strava
- ✅ Perfil atlético completo (VDOT, histórico, disponibilidade)
- ✅ Múltiplas metas de corrida (Race Goals)

**Geração Inteligente de Planos:**
- ✅ IA cria plano baseado em perfil, objetivos e disponibilidade
- ✅ Periodização automática (Base → Build → Peak → Taper)
- ✅ Cálculo dinâmico de ritmos (VDOT)
- ✅ Variedade de treinos: longão, intervalados, tempo, regenerativo, força
- ✅ Progressão gradual de volume (regra 10%)
- ✅ Respeito a dias específicos (ex: treino de força só terça/quinta)

**Acompanhamento e Análise:**
- ✅ Dashboard com métricas principais
- ✅ Visualização semanal de treinos
- ✅ Marcação de treinos como completos
- ✅ Gráficos de progresso (volume, intensidade)
- ✅ Registro manual de treinos
- ✅ Sincronização automática com Strava
- ✅ Cálculo de VDOT baseado em performances reais

**IA e Interação:**
- ✅ Chat com treinador virtual
- ✅ Análise de progresso com IA
- ✅ Sugestões personalizadas

**Nutrição:**
- ✅ Calculadora de macros para corrida

**Mobile-First:**
- ✅ Layout 100% responsivo (última atualização)
- ✅ Otimizado para uso em smartphones

### 🎯 Diferenciais Competitivos

| Aspecto | Athera Run | Concorrentes |
|---------|------------|--------------|
| **Personalização IA** | GPT-4o real-time | Regras fixas ou básica |
| **Adaptação** | Contínua baseada em feedback | Manual ou limitada |
| **Integração Strava** | Nativa e automática | Parcial ou inexistente |
| **Preço** | R$ 29-99/mês | R$ 150-500/mês |
| **Multi-Race** | Múltiplas corridas simultâneas | Foco em uma corrida |
| **Científico** | VDOT, periodização, literatura | Genérico |
| **UX Mobile** | Mobile-first, moderno | Desktop-first, datado |

---

## 4. MODELO DE NEGÓCIO

### 💰 Estrutura de Preços (Freemium + SaaS)

#### Plano FREE (Lead Magnet)
**R$ 0/mês**
- ✅ 1 plano de treino gerado
- ✅ Visualização de 2 semanas
- ✅ Dashboard básico
- ✅ Calculadora de ritmos
- ❌ Sem integração Strava
- ❌ Sem chat com IA
- ❌ Sem ajustes de plano

**Objetivo:** Capturar leads e converter para pago

---

#### Plano RUNNER (Core) ⭐
**R$ 49/mês** ou **R$ 490/ano** (16% desconto)
- ✅ Planos ilimitados
- ✅ Integração completa Strava
- ✅ Ajustes automáticos de plano
- ✅ Chat com IA treinador
- ✅ Análise de progresso
- ✅ Todas as funcionalidades core
- ✅ Suporte por email

**Target:** 80% dos usuários pagantes

---

#### Plano PRO (Power Users)
**R$ 99/mês** ou **R$ 990/ano** (16% desconto)
- ✅ Tudo do RUNNER +
- ✅ Multi-race planning (várias corridas)
- ✅ Análise avançada de performance
- ✅ Planos de nutrição personalizados
- ✅ Acesso a comunidade premium
- ✅ Relatórios mensais detalhados
- ✅ Suporte prioritário

**Target:** 15% dos usuários pagantes

---

#### Plano COACH (B2B - Futuro)
**R$ 299/mês**
- ✅ Até 20 atletas gerenciados
- ✅ Dashboard de treinador
- ✅ White-label (sua marca)
- ✅ API access
- ✅ Suporte dedicado

**Target:** 5% dos usuários pagantes

---

### 📊 Projeção de Mix de Planos

| Plano | % Usuários | MRR Médio | Conversão Free→Pago |
|-------|------------|-----------|---------------------|
| FREE | 70% | R$ 0 | Base de leads |
| RUNNER | 24% (80% pagos) | R$ 49 | 25% após 7 dias |
| PRO | 4.5% (15% pagos) | R$ 99 | 5% upgrade |
| COACH | 1.5% (5% pagos) | R$ 299 | - |

### 💵 Receitas Adicionais (Futuro)

1. **Marketplace de Nutrição** (10% comissão)
   - Géis, isotônicos, suplementos
   - Parceria com marcas (Probiótica, Gatorade)

2. **Afiliação de Corridas**
   - Comissão em inscrições (5-10%)
   - Códigos de desconto exclusivos

3. **Parcerias com Marcas**
   - Nike, Asics, adidas (patrocínio)
   - Testes de produtos

4. **Conteúdo Premium**
   - Cursos sobre técnica, nutrição
   - Webinars com atletas de elite

---

## 5. ESTRATÉGIA DE CRESCIMENTO

### 🎯 Fase 1: Beta Privado (Meses 1-3)

**Objetivo:** 100 usuários ativos, validar product-market fit

**Ações:**
1. **Convites Manuais**
   - Grupos de corrida em SP, RJ, BH
   - Clubes de running (Nike Run Club, adidas Runners)
   - 50 convites iniciais

2. **Parcerias Locais**
   - 3-5 assessorias de corrida (divulgação)
   - Lojas especializadas (QR code na loja)

3. **Feedback Loop**
   - Entrevistas semanais com usuários
   - Iteração rápida de features
   - NPS como métrica chave

**KPIs:**
- 100 usuários registrados
- 20% conversão Free → Runner
- NPS > 50
- < 10% churn

---

### 🚀 Fase 2: Lançamento Público (Meses 4-6)

**Objetivo:** 500 usuários ativos, R$ 15k MRR

**Ações:**
1. **Marketing de Conteúdo**
   - Blog: "Como treinar para sua primeira maratona"
   - YouTube: Tutoriais de treino
   - SEO para "plano de treino maratona"

2. **Growth Hacking**
   - Indicação amigos: 1 mês grátis (ambos)
   - Integração Strava: "Athera Run analisou seu treino"
   - Hashtag #TreinandoComIA

3. **Mídia Paga**
   - Facebook/Instagram Ads: R$ 5k/mês
   - Google Ads: R$ 3k/mês
   - Influenciadores micro (5-50k seguidores): 10 parcerias

4. **PR**
   - Matérias em O2, Runners Brasil
   - Podcast "Papo de Corrida", "Podcast do Raul"

**KPIs:**
- 500 usuários ativos
- CAC < R$ 100
- LTV/CAC > 3
- 15% conversão Free → Pago

---

### 🌟 Fase 3: Escala (Meses 7-12)

**Objetivo:** 2.000 usuários ativos, R$ 80k MRR

**Ações:**
1. **Partnerships Estratégicas**
   - Strava: Feature no Strava Brasil
   - Maratonas: Parceiro oficial (SP, Rio, Floripa)
   - Garmin/Polar: Integração de devices

2. **Expansão de Produto**
   - Multi-race planning (corridas simultâneas)
   - Planos de força específicos
   - Análise biomecânica (futuro)

3. **Comunidade**
   - Grupos exclusivos por nível
   - Desafios mensais
   - Meetups presenciais

4. **B2B**
   - Assessorias de corrida (plano Coach)
   - Empresas (wellbeing corporativo)

**KPIs:**
- 2.000 usuários ativos
- R$ 80k MRR
- <5% churn
- 20% de receita de B2B

---

### 🌎 Fase 4: Internacionalização (Ano 2+)

**Mercados Prioritários:**
1. **América Latina:** México, Argentina, Chile
2. **Europa:** Portugal, Espanha
3. **USA:** Mercado premium

---

## 6. ANÁLISE COMPETITIVA

### 🥊 Concorrentes Diretos

#### 1. **TrainingPeaks**
- **Preço:** US$ 19.95/mês (≈ R$ 100)
- **Força:** Consolidado, usado por treinadores profissionais
- **Fraqueza:** Interface datada, não usa IA real, complexo para iniciantes
- **Nossa Vantagem:** UX moderna, IA nativa, mobile-first, preço BR

#### 2. **Runna** (UK)
- **Preço:** £9.99/mês (≈ R$ 62)
- **Força:** IA para gerar planos, ótimo UX
- **Fraqueza:** Não disponível no Brasil, sem integração Strava avançada
- **Nossa Vantagem:** Localizado BR, ritmos adaptados, support português

#### 3. **iFit / Nike Training Club**
- **Preço:** R$ 49-79/mês
- **Força:** Marca forte, conteúdo vasto
- **Fraqueza:** Genérico, não personaliza de verdade
- **Nossa Vantagem:** Personalização real com IA, foco em maratona

#### 4. **Assessorias Online (humanas)**
- **Preço:** R$ 150-500/mês
- **Força:** Humano, relação pessoal
- **Fraqueza:** Caro, limitado por tempo do treinador
- **Nossa Vantagem:** 70% mais barato, disponível 24/7, escala infinita

### 🏆 Posicionamento Competitivo

```
             Alto $$
                |
    TrainingPeaks    Assessorias
                |
    iFit/Nike   |    [ATHERA RUN]
                |    (IA+Personalização)
                |
    Apps Grátis |    Runna
                |
             Baixo $$
    --------------------------------
    Genérico        Personalizado
```

**Nossa Posição:** "Assessoria pessoal com IA, preço acessível, personalização real"

---

## 7. PROJEÇÕES FINANCEIRAS

### 💰 Projeção de Receita (12 meses)

| Mês | Usuários Totais | Free | Runner (R$49) | Pro (R$99) | MRR | Receita Acum. |
|-----|-----------------|------|---------------|------------|-----|---------------|
| 1 | 30 | 20 | 8 | 2 | R$ 590 | R$ 590 |
| 2 | 60 | 40 | 16 | 4 | R$ 1.180 | R$ 1.770 |
| 3 | 100 | 70 | 24 | 6 | R$ 1.770 | R$ 3.540 |
| 4 | 180 | 120 | 48 | 12 | R$ 3.540 | R$ 7.080 |
| 5 | 280 | 190 | 72 | 18 | R$ 5.310 | R$ 12.390 |
| 6 | 500 | 350 | 120 | 30 | R$ 8.850 | R$ 21.240 |
| 7 | 700 | 490 | 168 | 42 | R$ 12.390 | R$ 33.630 |
| 8 | 1.000 | 700 | 240 | 60 | R$ 17.700 | R$ 51.330 |
| 9 | 1.300 | 910 | 312 | 78 | R$ 23.010 | R$ 74.340 |
| 10 | 1.600 | 1.120 | 384 | 96 | R$ 28.320 | R$ 102.660 |
| 11 | 1.850 | 1.295 | 444 | 111 | R$ 32.775 | R$ 135.435 |
| 12 | 2.000 | 1.400 | 480 | 120 | R$ 35.400 | R$ 170.835 |

**ARR Projetado (Ano 1):** R$ 424.800  
**MRR Final:** R$ 35.400  
**Ticket Médio:** R$ 59

---

### 💸 Custos Operacionais (Mensal)

#### Custos Fixos
| Item | Valor Mensal |
|------|--------------|
| Hosting (Abacus.AI/Vercel) | R$ 500 |
| Banco de Dados PostgreSQL | R$ 300 |
| OpenAI API (GPT-4o) | R$ 2.000* |
| Strava API | R$ 0 (grátis até 1M req) |
| Ferramentas (GitHub, Sentry) | R$ 200 |
| **Total Fixo** | **R$ 3.000** |

*Estimado: 2.000 usuários × 5 gerações/mês × $0.15 = $1.500 (~R$ 7.500 em escala)

#### Custos Variáveis
| Item | % Receita |
|------|-----------|
| Marketing (Ads, Conteúdo) | 30% |
| Suporte/Operações | 10% |
| Comissões de Pagamento | 5% |
| **Total Variável** | **45%** |

---

### 📊 Análise de Viabilidade (Mês 12)

| Métrica | Valor |
|---------|-------|
| **Receita Mensal (MRR)** | R$ 35.400 |
| Custos Fixos | R$ 10.000* |
| Custos Variáveis (45%) | R$ 15.930 |
| **Lucro Operacional** | R$ 9.470 |
| **Margem** | 27% |

*Inclui OpenAI em escala + 1 dev part-time

---

### 💡 Unit Economics

| Métrica | Valor | Benchmark |
|---------|-------|-----------|
| **CAC (Custo Aquisição)** | R$ 80 | < R$ 100 ✅ |
| **LTV (Lifetime Value)** | R$ 353* | > R$ 300 ✅ |
| **LTV/CAC Ratio** | 4.4x | > 3x ✅ |
| **Payback Period** | 1.6 meses | < 12m ✅ |
| **Churn Mensal** | 5% | < 7% ✅ |

*LTV = R$ 59 (ticket médio) × 6 meses (vida média) × 0.95 (retenção)

---

### 🎯 Breakeven

**Ponto de Equilíbrio:** ~120 usuários pagantes (R$ 7.080 MRR)  
**Previsão de Atingir:** Mês 4  
**Status Atual:** MVP pronto, precisa de tração

---

## 8. ROADMAP DE DESENVOLVIMENTO

### ✅ Q4 2024 - MVP [CONCLUÍDO]
- [x] Autenticação e perfil
- [x] Gerador de planos com IA
- [x] Dashboard básico
- [x] Integração Strava
- [x] Mobile responsivo

### 🚀 Q1 2025 - Beta Privado
**Objetivo:** 100 usuários, validar PMF

**Features:**
- [ ] Sistema de pagamentos (Stripe)
- [ ] Onboarding melhorado (5 steps)
- [ ] Notificações push (treino hoje)
- [ ] Ajuste de plano manual
- [ ] Analytics interno (Mixpanel)

**Marketing:**
- [ ] Landing page otimizada
- [ ] 3 parcerias com assessorias
- [ ] Conteúdo blog (10 posts)

---

### 🌟 Q2 2025 - Lançamento Público
**Objetivo:** 500 usuários, R$ 15k MRR

**Features:**
- [ ] Multi-race planning (várias corridas)
- [ ] Planos de força integrados
- [ ] Análise avançada de performance
- [ ] Comunidade (grupos, desafios)
- [ ] App mobile nativo (React Native)

**Marketing:**
- [ ] Campanha Meta Ads (R$ 15k)
- [ ] 10 influenciadores micro
- [ ] PR em 3 mídias especializadas
- [ ] SEO on-page completo

---

### 🚀 Q3 2025 - Escala
**Objetivo:** 1.500 usuários, R$ 60k MRR

**Features:**
- [ ] Integração Garmin/Polar
- [ ] Planos de nutrição IA
- [ ] Coaching ao vivo (vídeo)
- [ ] Marketplace de produtos

**Parcerias:**
- [ ] Strava Brasil (feature oficial)
- [ ] 2 maratonas (parceiro oficial)
- [ ] 1 marca esportiva (patrocínio)

---

### 🌎 Q4 2025 - Consolidação
**Objetivo:** 2.000 usuários, R$ 80k MRR

**Features:**
- [ ] Dashboard para treinadores (B2B)
- [ ] API pública (developers)
- [ ] Análise biomecânica (IA visão)
- [ ] Gamificação completa

**Expansão:**
- [ ] Lançamento em português PT
- [ ] Testes em espanhol (México)
- [ ] Captação Seed (R$ 500k-1M)

---

## 9. TIME E RECURSOS

### 👥 Time Atual

**Founder/CTO:** Maurílio
- Desenvolvedor full-stack
- Conhecimento em IA e ML
- Corredor amador (entende o problema)

### 🎯 Contratações Necessárias (12 meses)

| Papel | Quando | Salary | Tipo |
|-------|--------|--------|------|
| **Marketing/Growth** | Mês 3 | R$ 5k | Part-time |
| **Customer Success** | Mês 6 | R$ 4k | Part-time |
| **Designer UX/UI** | Mês 8 | R$ 6k | Freelance |
| **Dev Backend** | Mês 10 | R$ 8k | Part-time |

**Total Ano 1:** ~R$ 100k em pessoas

---

### 💼 Advisors/Mentores (Desejado)

- **Treinador Elite:** Validação científica dos planos
- **Growth Expert:** Estratégia de aquisição
- **Founder SaaS:** Experiência em escalabilidade

---

### 💰 Necessidade de Capital

#### Bootstrapping (Cenário Atual)
- **Investimento Inicial:** R$ 10k (próprio)
- **Runway:** 6 meses até breakeven
- **Risco:** Crescimento lento

#### Seed Round (Recomendado)
- **Valor:** R$ 500k - R$ 1M
- **Uso:**
  - 50% Marketing e Aquisição
  - 30% Time (Growth, CS, Dev)
  - 15% Produto (features prioritárias)
  - 5% Reserva operacional
- **Runway:** 18-24 meses
- **Objetivo:** 10k usuários, R$ 300k MRR

---

## 10. RISCOS E MITIGAÇÕES

### ⚠️ Riscos Principais

#### 1. **Baixa Conversão Free → Pago**
**Risco:** Usuários usam só o free  
**Probabilidade:** Média  
**Impacto:** Alto  
**Mitigação:**
- Limitar free a 1 plano + 2 semanas
- Onboarding que demonstra valor
- Trial de 7 dias do Runner
- Email marketing agressivo

---

#### 2. **Alto Custo de IA (OpenAI)**
**Risco:** GPT-4o fica muito caro em escala  
**Probabilidade:** Média  
**Impacto:** Médio  
**Mitigação:**
- Usar GPT-4o-mini para tarefas simples
- Cache de respostas similares
- Fine-tuning de modelo próprio (futuro)
- Pricing ajustado se necessário

---

#### 3. **Strava Muda API/Pricing**
**Risco:** Dependência de integração chave  
**Probabilidade:** Baixa  
**Impacto:** Alto  
**Mitigação:**
- Integrar Garmin e Polar em paralelo
- Import manual de arquivos GPX
- Desenvolver próprio tracking (futuro)

---

#### 4. **Concorrente Grande Entra**
**Risco:** Nike/Strava lança similar  
**Probabilidade:** Média  
**Impacto:** Alto  
**Mitigação:**
- Foco em nicho (maratonistas BR)
- Construir comunidade forte
- Personalização profunda (moat)
- Mover rápido, iterar

---

#### 5. **Regulação de IA**
**Risco:** Leis limitam uso de IA em saúde  
**Probabilidade:** Baixa  
**Impacto:** Médio  
**Mitigação:**
- Disclaimer: "não substitui médico/nutricionista"
- Termos de uso robustos
- Consultoria jurídica preventiva

---

#### 6. **Churn Alto**
**Risco:** Usuários cancelam após corrida  
**Probabilidade:** Alta  
**Impacto:** Alto  
**Mitigação:**
- Multi-race planning (próxima corrida)
- Manutenção de fitness (off-season)
- Comunidade engaja além do treino
- Análise de progresso (histórico valioso)

---

## 📈 CONCLUSÃO E PRÓXIMOS PASSOS

### 🎯 Por Que Investir/Apoiar Athera Run?

1. **Mercado Enorme e Crescente**
   - 6M corredores no Brasil
   - R$ 1.8 bi/ano em corridas de rua
   - Tendência de alta pós-pandemia

2. **Problema Real e Validado**
   - Treinadores caros (R$ 300-500/mês)
   - Apps genéricos não funcionam
   - Falta de personalização real

3. **Solução Diferenciada**
   - IA real (GPT-4o), não regras fixas
   - Integração nativa Strava
   - Mobile-first, UX moderna
   - 70% mais barato que alternativas

4. **MVP Funcional e Testado**
   - 14 features core prontas
   - Stack escalável (Next.js, Prisma)
   - Já em produção
   - Pronto para primeiros usuários

5. **Economics Saudáveis**
   - LTV/CAC > 4x
   - Margem 27%+ em escala
   - Breakeven em 4 meses (projetado)
   - Payback < 2 meses

6. **Founder Com Skin in the Game**
   - Developer experiente
   - Corredor (entende o problema)
   - Bootstrapping inicial (comprometido)

---

### 🚀 Próximos 90 Dias (Ação Imediata)

**Semanas 1-4: Preparação**
- [ ] Implementar Stripe/pagamentos
- [ ] Finalizar onboarding
- [ ] Landing page + SEO
- [ ] Setup analytics (Mixpanel)

**Semanas 5-8: Beta Privado**
- [ ] 50 convites manuais (grupos de corrida)
- [ ] 3 parcerias com assessorias
- [ ] Coletar feedback intensivo
- [ ] Iterar produto

**Semanas 9-12: Tração Inicial**
- [ ] Ativar marketing de conteúdo
- [ ] 100 usuários registrados
- [ ] 20 usuários pagantes
- [ ] Validar unit economics

---

### 📞 CONTATO

**Maurílio**  
Email: mmaurillio2@gmail.com  
GitHub: github.com/maurillio/athera-run  
Website: https://42maurillio.abacusai.app

---

**Athera Run** - *Treine como um atleta de elite. Pague como um corredor real.*

---

*Documento gerado em: Novembro 2025*  
*Versão: 1.0*  
*Confidencial e Proprietário*
