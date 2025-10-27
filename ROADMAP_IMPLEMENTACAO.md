
# 🗺️ Roadmap de Implementação - Maratona Training

## 📊 Estado Atual do Projeto

### ✅ Funcionalidades Implementadas

#### Core do Sistema
- [x] Autenticação com NextAuth (email/senha)
- [x] Cadastro e login de usuários
- [x] Perfil completo do atleta
- [x] Gestão de metas de prova (race goals)
- [x] Banco de dados PostgreSQL + Prisma ORM
- [x] Dashboard principal
- [x] Sistema de rotas protegidas (middleware)

#### Geração de Planos
- [x] Gerador de planos com IA (GPT-4o)
- [x] Cálculo dinâmico de duração baseado na data da prova
- [x] Respeito à disponibilidade de dias
- [x] Dias específicos para treino de força
- [x] Periodização automática (base, build, peak, taper)
- [x] Progressão gradual de volume
- [x] Variedade de treinos (longão, intervalados, tempo, regenerativo, força)
- [x] Ritmos baseados em VDOT

#### Visualização e Acompanhamento
- [x] Página de visualização do plano completo
- [x] Visualização semanal de treinos
- [x] Marcação de treinos como completos
- [x] Registro manual de treinos
- [x] Gráficos de progresso
- [x] Estatísticas de desempenho

#### Integração Strava
- [x] OAuth 2.0 flow completo
- [x] Conexão e desconexão de conta
- [x] Busca de atividades recentes
- [x] Cálculo de VDOT baseado em performances
- [x] Sincronização automática de treinos
- [x] Refresh token automático

#### IA e Chat
- [x] Chat com treinador virtual
- [x] Análise de progresso com IA
- [x] Sugestões personalizadas
- [x] Respostas baseadas no perfil do atleta

#### Nutrição
- [x] Calculadora de macros
- [x] Recomendações nutricionais
- [x] Cálculo de necessidades calóricas

#### Ferramentas
- [x] Calculadora VDOT
- [x] Tabelas de pace por zona
- [x] Glossário de termos técnicos

#### UI/UX
- [x] Design responsivo (Tailwind CSS)
- [x] Componentes Shadcn UI / Radix UI
- [x] Dark mode
- [x] Animações e transições
- [x] Loading states
- [x] Toast notifications

---

## 🚧 Funcionalidades em Desenvolvimento

### Prioridade Alta (1-2 semanas)

#### 1. Ajustes Automáticos Inteligentes
**Status**: Estrutura criada, precisa de refinamento

**Tarefas**:
- [ ] Implementar detecção de overtraining
  - Monitorar volume semanal vs. média histórica
  - Analisar frequência de treinos intensos
  - Detectar padrões de fadiga (RPE > 7 consecutivos)
- [ ] Sistema de sugestões de ajuste
  - Reduzir volume quando detectar fadiga
  - Aumentar recuperação quando necessário
  - Ajustar intensidade baseado em feedback
- [ ] Interface de aprovação de ajustes
  - Modal com sugestões da IA
  - Opção de aceitar/rejeitar/modificar
  - Histórico de ajustes feitos

**Arquivos Principais**:
- `lib/auto-adjust-service.ts` (já existe, precisa ser integrado)
- `components/auto-adjust-card.tsx` (já existe)
- `/api/plan/auto-adjust/route.ts` (criar)

---

#### 2. Notificações e Lembretes
**Status**: Não iniciado

**Tarefas**:
- [ ] Configurar envio de emails (Resend ou SendGrid)
- [ ] Lembretes de treino do dia (email matinal)
- [ ] Notificações de sincronização Strava
- [ ] Alertas de overtraining
- [ ] Resumo semanal de progresso
- [ ] Lembretes de prova se aproximando

**Arquivos a Criar**:
- `lib/email-service.ts`
- `/api/notifications/send/route.ts`
- `components/notification-settings.tsx`

**Integração Necessária**:
```bash
yarn add resend
# ou
yarn add @sendgrid/mail
```

---

#### 3. Página de Análise Avançada
**Status**: Parcialmente implementada

**Tarefas**:
- [ ] Gráfico de evolução de VDOT ao longo do tempo
- [ ] Predição de tempo de prova baseado em VDOT atual
- [ ] Análise de tendências (melhorando/piorando)
- [ ] Comparação de paces entre semanas
- [ ] Heatmap de treinos completos vs. perdidos
- [ ] Métricas de consistência

**Arquivos a Criar/Modificar**:
- `app/analysis/page.tsx` (criar)
- `components/vdot-evolution-chart.tsx` (criar)
- `components/pace-comparison-chart.tsx` (criar)

---

#### 4. Melhorias no Mobile
**Status**: Responsivo básico implementado

**Tarefas**:
- [ ] Testar em diversos tamanhos de tela
- [ ] Otimizar navegação mobile
- [ ] Gestos de swipe para navegação entre semanas
- [ ] Bottom navigation bar para mobile
- [ ] Melhorar formulários para teclados móveis
- [ ] PWA (Progressive Web App) básico

**Arquivos a Modificar**:
- `app/layout.tsx` (adicionar manifest)
- `components/header.tsx` (adaptar para mobile)
- `public/manifest.json` (criar)

---

### Prioridade Média (2-4 semanas)

#### 5. Multi-Race Planning
**Status**: Estrutura de banco pronta, lógica não implementada

**Descrição**: Permitir que usuários tenham múltiplas provas simultaneamente e o sistema gere um plano coordenado.

**Tarefas**:
- [ ] UI para adicionar múltiplas provas
  - Marcar prova como primária/secundária
  - Definir prioridade
  - Visualizar todas as provas em timeline
- [ ] Algoritmo de coordenação de planos
  - Detectar conflitos de datas
  - Priorizar treinos para prova principal
  - Ajustar volume para não sobrecarregar
  - Inserir tapers adequados antes de cada prova
- [ ] Visualização de plano multi-race
  - Timeline com todas as provas
  - Diferenciação visual de treinos por prova
  - Indicadores de qual prova cada treino visa

**Arquivos a Criar**:
- `lib/multi-race-plan-generator.ts` (já existe estrutura básica)
- `components/race-timeline.tsx`
- `app/races/page.tsx`

---

#### 6. Comunidade e Social
**Status**: Não iniciado

**Tarefas**:
- [ ] Feed de atividades
  - Ver treinos de outros usuários (opt-in)
  - Curtir/comentar
  - Sistema de follows
- [ ] Grupos de treino
  - Criar/participar de grupos
  - Objetivos de grupo
  - Chat de grupo
- [ ] Desafios
  - Desafios mensais (ex: 100km em outubro)
  - Badges e conquistas
  - Leaderboards
- [ ] Perfil público
  - Estatísticas públicas
  - Histórico de provas
  - Opções de privacidade

**Arquivos a Criar**:
- `app/feed/page.tsx`
- `app/groups/page.tsx`
- `app/challenges/page.tsx`
- `app/profile/[userId]/page.tsx`
- `components/activity-feed.tsx`
- Schema Prisma:
  - `Follow`, `Group`, `GroupMember`, `Challenge`, `ChallengeParticipant`

---

#### 7. Integração com Mais Wearables
**Status**: Apenas Strava implementado

**Tarefas**:
- [ ] Garmin Connect
  - OAuth flow
  - Busca de atividades
  - Dados de FC, cadência, VO2max
- [ ] Polar Flow
  - OAuth flow
  - Sincronização de treinos
- [ ] Apple Health (via HealthKit)
  - Requer app mobile nativo
- [ ] Suunto
  - OAuth flow
- [ ] Coros
  - OAuth flow

**Arquivos a Criar**:
- `lib/garmin.ts`
- `lib/polar.ts`
- `/api/garmin/*`
- `/api/polar/*`

---

#### 8. Planos de Treino de Força Detalhados
**Status**: Força incluída no plano, mas sem detalhes

**Tarefas**:
- [ ] Biblioteca de exercícios
  - Nome, descrição, músculos trabalhados
  - Vídeos demonstrativos (YouTube embeds)
  - Progressões (fácil → difícil)
- [ ] Planos de força específicos
  - Força básica para iniciantes
  - Força explosiva para avançados
  - Prevenção de lesões (glúteos, core)
- [ ] Registro de treinos de força
  - Exercícios realizados
  - Séries, repetições, carga
  - Progressão ao longo do tempo

**Arquivos a Criar**:
- Schema Prisma: `Exercise`, `StrengthWorkout`, `StrengthLog`
- `app/strength/page.tsx`
- `components/exercise-library.tsx`
- `components/strength-log-form.tsx`

---

### Prioridade Baixa (1-3 meses)

#### 9. App Mobile Nativo
**Status**: Apenas web app

**Tecnologias Sugeridas**:
- React Native + Expo
- ou Flutter

**Tarefas**:
- [ ] Setup do projeto mobile
- [ ] Autenticação compartilhada com web
- [ ] Telas principais (dashboard, plano, perfil)
- [ ] GPS tracking nativo
- [ ] Notificações push
- [ ] Modo offline (sync quando conectar)
- [ ] Integração com HealthKit (iOS) e Google Fit (Android)

---

#### 10. Marketplace de Treinadores
**Status**: Não iniciado

**Descrição**: Permitir que treinadores humanos ofereçam serviços pagos na plataforma.

**Tarefas**:
- [ ] Sistema de cadastro de treinadores
  - Verificação de credenciais
  - Perfil profissional
  - Portfólio
- [ ] Sistema de assinaturas/pagamentos
  - Integração Stripe
  - Planos de assinatura
  - Comissão da plataforma
- [ ] Chat direto com treinador
  - Mensagens privadas
  - Videochamadas (Zoom/Google Meet)
- [ ] Planos personalizados por treinador
  - Treinador pode editar planos manualmente
  - Sistema de aprovação
- [ ] Avaliações e reviews
  - Rating de treinadores
  - Comentários de clientes

**Arquivos a Criar**:
- Schema Prisma: `Coach`, `CoachClient`, `Subscription`, `Payment`
- `app/coaches/page.tsx`
- `app/coach-dashboard/page.tsx`
- `lib/stripe.ts`

---

#### 11. Planos de Nutrição Completos
**Status**: Apenas calculadora de macros implementada

**Tarefas**:
- [ ] Banco de alimentos
  - Nutrientes por alimento
  - Porções padrão
- [ ] Sugestões de refeições
  - Café da manhã, almoço, jantar, lanches
  - Filtros (vegetariano, vegano, etc.)
- [ ] Plano diário de alimentação
  - Baseado em macros calculadas
  - Timing de nutrientes (antes/depois treino)
- [ ] Registro de alimentação
  - Log diário
  - Comparação com meta
- [ ] Suplementação
  - Recomendações baseadas em treino
  - Timing de suplementos

**Arquivos a Criar**:
- Schema Prisma: `Food`, `Meal`, `MealPlan`, `FoodLog`
- `app/nutrition/meals/page.tsx`
- `app/nutrition/log/page.tsx`
- `components/meal-planner.tsx`

---

#### 12. Analytics para Admin
**Status**: Não iniciado

**Tarefas**:
- [ ] Dashboard de métricas da plataforma
  - Total de usuários
  - Usuários ativos (DAU, MAU)
  - Planos gerados
  - Taxa de conclusão de treinos
  - Integrações Strava ativas
- [ ] Funil de conversão
  - Signup → Onboarding → Plano Gerado → Ativo
- [ ] Análise de uso
  - Features mais usadas
  - Tempo médio na plataforma
  - Retenção de usuários
- [ ] Logs de erros
  - Erros de IA
  - Erros de integração
  - Erros de usuário

**Arquivos a Criar**:
- `app/admin/analytics/page.tsx`
- `/api/admin/metrics/route.ts`
- `components/admin/metrics-dashboard.tsx`

---

## 🐛 Bugs Conhecidos e Melhorias Técnicas

### Bugs a Corrigir

1. **Planos muito longos (>40 semanas) ocasionalmente falham**
   - **Causa**: Resposta da IA muito longa, atinge limite de tokens
   - **Solução**: Gerar plano em chunks (8-12 semanas por vez)
   - **Prioridade**: Média

2. **Timezone inconsistente em datas**
   - **Causa**: Mix de UTC e timezone local
   - **Solução**: Padronizar tudo em UTC e converter na UI
   - **Prioridade**: Alta

3. **Refresh token do Strava às vezes falha**
   - **Causa**: Token já expirado antes de renovar
   - **Solução**: Renovar com mais antecedência (1h antes)
   - **Prioridade**: Média

4. **Scroll em modal de treino trava no mobile**
   - **Causa**: Conflito de overflow
   - **Solução**: Ajustar CSS do modal
   - **Prioridade**: Baixa

### Melhorias Técnicas

1. **Implementar caching**
   - Redis para sessões
   - Cache de planos gerados
   - Cache de dados do Strava
   - **Impacto**: Performance, custo de IA

2. **Otimização de queries**
   - Adicionar índices no Prisma
   - Reduzir N+1 queries
   - Implementar pagination
   - **Impacto**: Performance, escalabilidade

3. **Testes automatizados**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright)
   - **Impacto**: Confiabilidade

4. **CI/CD**
   - GitHub Actions
   - Testes automáticos em PR
   - Deploy automático após merge
   - **Impacto**: Velocidade de desenvolvimento

5. **Monitoring e Logging**
   - Sentry para error tracking
   - Datadog/New Relic para APM
   - Logs estruturados (Winston)
   - **Impacto**: Observabilidade

6. **Internacionalização (i18n)**
   - Suporte a inglês
   - Suporte a espanhol
   - **Impacto**: Alcance global

---

## 📅 Timeline Sugerido

### Mês 1
- ✅ Setup inicial e core features (FEITO)
- ✅ Geração de planos com IA (FEITO)
- ✅ Integração Strava (FEITO)
- ⏳ Ajustes automáticos inteligentes (EM ANDAMENTO)
- 🔜 Notificações e lembretes

### Mês 2
- Análise avançada
- Melhorias mobile
- Multi-race planning (fase 1)

### Mês 3
- Comunidade e social (fase 1)
- Treino de força detalhado
- Integração Garmin

### Mês 4-6
- App mobile nativo (fase 1)
- Marketplace de treinadores (fase 1)
- Nutrição completa

### Mês 6+
- Internacionalização
- Analytics avançado
- Features enterprise

---

## 💡 Ideias Futuras (Backlog)

### Features Inovadoras

1. **IA Personal Trainer por Voz**
   - Comandos de voz durante treino
   - Coaching em tempo real via áudio
   - Integração com fones bluetooth

2. **Realidade Aumentada**
   - AR para correção de forma de corrida
   - Análise de pisada via câmera
   - Overlay de ritmo/distância em tempo real

3. **Predição de Lesões**
   - ML para detectar padrões que levam a lesões
   - Alertas preventivos
   - Recomendações de fisioterapia

4. **Social Racing**
   - Corridas virtuais com amigos
   - Leaderboards em tempo real
   - Eventos online da comunidade

5. **Integração com Fisioterapeutas**
   - Conexão com profissionais
   - Planos de reabilitação integrados
   - Exercícios preventivos personalizados

6. **Gamificação Avançada**
   - Sistema de levels e XP
   - Conquistas desbloqueáveis
   - Avatares e customização
   - Recompensas (descontos em produtos de corrida)

---

## 🔐 Segurança e Compliance

### Tarefas de Segurança

- [ ] Implementar rate limiting em APIs
- [ ] Adicionar CAPTCHA no signup
- [ ] Criptografar dados sensíveis (tokens Strava)
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Audit logs para ações críticas
- [ ] Penetration testing

### Compliance

- [ ] LGPD (Lei Geral de Proteção de Dados)
  - Política de privacidade
  - Termos de uso
  - Consentimento de cookies
  - Direito ao esquecimento (deletar conta)
  - Exportação de dados pessoais

- [ ] GDPR (se expandir para Europa)
- [ ] Acessibilidade (WCAG 2.1)
  - Screen reader support
  - Contraste adequado
  - Navegação por teclado

---

## 📊 Métricas de Sucesso

### KPIs Principais

1. **Aquisição**
   - Novos usuários/mês
   - Taxa de conversão signup
   - Fonte de tráfego

2. **Ativação**
   - % que completa onboarding
   - % que gera primeiro plano
   - Tempo médio até primeiro plano

3. **Engajamento**
   - DAU (Daily Active Users)
   - MAU (Monthly Active Users)
   - % de treinos completos
   - Tempo médio na plataforma

4. **Retenção**
   - Retenção em 7 dias
   - Retenção em 30 dias
   - Churn rate

5. **Referência**
   - NPS (Net Promoter Score)
   - Convites enviados
   - Taxa de conversão de convites

---

## 🎯 Visão de Longo Prazo

**Missão**: Democratizar o acesso a treinamento de corrida de qualidade através de IA, tornando cada corredor capaz de alcançar seu potencial máximo.

**Objetivos para 2027**:
- 100.000+ usuários ativos
- Presença em 5+ países
- App nativo iOS e Android
- Partnerships com marcas de corrida
- Comunidade ativa e engajada
- Marketplace de treinadores consolidado

**Diferenciais Competitivos**:
1. IA verdadeiramente personalizada (não templates)
2. Integração completa com wearables
3. Comunidade forte
4. Planos acessíveis vs. treinadores tradicionais
5. Metodologia científica comprovada (VDOT)

---

**Última Atualização**: 27 de outubro de 2025  
**Versão do Roadmap**: 1.0
