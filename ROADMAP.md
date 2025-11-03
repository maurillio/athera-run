# 🗺️ Roadmap - Athera Run

> Planejamento de features, melhorias e evolução da plataforma

**Última atualização:** 03 de Novembro de 2025  
**Versão Atual:** 1.1.0

---

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Prioridades](#prioridades)
3. [Q4 2024](#q4-2024-outubro---dezembro)
4. [Q1 2025](#q1-2025-janeiro---março)
5. [Q2 2025](#q2-2025-abril---junho)
6. [Q3 2025](#q3-2025-julho---setembro)
7. [Futuro (2026+)](#futuro-2026)
8. [Ideias Explorando](#ideias-em-exploração)

---

## 🎯 Visão Geral

### Missão

Tornar-se a **#1 plataforma de treinamento de corrida com IA do Brasil**, oferecendo planos verdadeiramente personalizados e ajustes inteligentes em tempo real.

### Objetivos 2025-2026

- **1.000 usuários ativos** até Março/2026
- **250 assinantes Premium** até Junho/2026
- **10.000 planos gerados** até final de 2026
- **App Mobile** lançado até Setembro/2026
- **Expansão internacional** (EN, ES) até Dezembro/2026

---

## 🚦 Prioridades

### P0 - Crítico (Fazer AGORA)
- Estabilidade da plataforma
- Correção de bugs críticos
- Performance de geração de planos

### P1 - Alta (Próximos 3 meses)
- Ajustes inteligentes automáticos
- Notificações e lembretes
- Analytics avançados
- Melhorias UX

### P2 - Média (6 meses)
- App mobile
- Integrações adicionais (Garmin, Polar)
- Social features
- Marketplace de treinadores

### P3 - Baixa (12+ meses)
- Versões internacionais
- Planos multi-esporte
- Competições virtuais
- Gamificação avançada

---

## 📅 Q4 2025 (Outubro - Dezembro)

### Outubro ✅ COMPLETO

- [x] Lançamento MVP
- [x] Sistema multi-corrida com classificação A/B/C
- [x] Integração Strava completa (Premium)
- [x] Sistema de assinaturas Stripe
- [x] Onboarding em 5 etapas
- [x] Dashboard interativo
- [x] Customer Portal Stripe

### Novembro ✅ COMPLETO

#### Features Implementadas

- [x] **Auto-Ajuste de Disponibilidade (FREE)**
  - Disponível para TODOS os usuários
  - Atualiza plano automaticamente ao mudar atividades
  - Validação sem fallbacks automáticos (100% escolha do usuário)
  - Refresh automático após ajuste
  - **Status:** ✅ Implementado
  - **Data:** 03/Nov/2025

- [x] **Análise Inteligente de Progresso (Premium)**
  - IA analisa taxa de conclusão de treinos
  - Detecta sinais de fadiga e overtraining
  - Sugestões automáticas de ajuste
  - Banner inteligente no dashboard
  - Teaser para usuários FREE (upgrade prompt)
  - **Status:** ✅ Implementado  
  - **Data:** 03/Nov/2025

#### Em Andamento

- [ ] **Notificações e Lembretes**
  - Email para treinos do dia
  - Push notifications (web)
  - Lembretes pré-corrida (semana antes)
  - Parabenizações por conquistas
  - **Status:** Planejado
  - **ETA:** 30/Nov

- [ ] **Analytics Avançados**
  - Dashboard de progresso detalhado
  - Gráficos de evolução (volume, pace)
  - Comparação com períodos anteriores
  - Predição de performance
  - **Status:** Planejado
  - **ETA:** 30/Nov

#### Melhorias

- [ ] **Performance de Geração**
  - Reduzir tempo de geração de 60s para 30s
  - Cache inteligente de prompts similares
  - Geração paralela de semanas
  - **ETA:** 20/Nov

- [ ] **UX do Dashboard**
  - Animações suaves
  - Skeleton loaders
  - Feedback visual melhor
  - Mobile responsiveness aprimorado
  - **ETA:** 25/Nov

- [ ] **Onboarding Guiado**
  - Tooltips explicativos
  - Tutorial interativo
  - Vídeos curtos de orientação
  - **ETA:** 30/Nov

### Dezembro

#### Features

- [ ] **Relatórios Semanais**
  - Email semanal com resumo
  - Análise de desempenho
  - Dicas personalizadas da IA
  - **ETA:** 10/Dez

- [ ] **Calculadora de Paces Avançada**
  - Múltiplas performances como input
  - Ajuste por condições (calor, altitude)
  - Equivalências de corrida
  - **ETA:** 15/Dez

- [ ] **Planos de Força Detalhados**
  - Exercícios específicos por fase
  - Vídeos demonstrativos
  - Progressão de carga
  - Integração com plano de corrida
  - **ETA:** 31/Dez

#### Marketing & Crescimento

- [ ] Landing page otimizada (SEO)
- [ ] Blog com conteúdo (corrida, treino, nutrição)
- [ ] Campanhas Google Ads
- [ ] Parcerias com assessorias
- [ ] Depoimentos de usuários

---

## 📅 Q1 2025 (Janeiro - Março)

### Janeiro

#### Features

- [ ] **Sistema de Badges e Conquistas**
  - Badges por treinos completados
  - Conquistas de km acumulados
  - Séries de treinos (streaks)
  - Compartilhamento social

- [ ] **Chat Melhorado**
  - Histórico de conversas
  - Sugestões contextuais
  - Respostas mais rápidas
  - Integração com dados do atleta

- [ ] **Feed de Atividades**
  - Timeline de treinos
  - Treinos de amigos (se conectados)
  - Celebrações de conquistas
  - Comentários e reações

### Fevereiro

#### Features

- [ ] **Integração Garmin**
  - OAuth Garmin Connect
  - Sincronização de atividades
  - Métricas avançadas (VO2max, recovery time)
  - Envio de treinos para Garmin

- [ ] **Integração Polar**
  - OAuth Polar Flow
  - Sincronização de atividades
  - Dados de treino de força
  - Análise de recuperação

- [ ] **Planos Multi-Esporte**
  - Triatlo (natação + ciclismo + corrida)
  - Duatlo (corrida + ciclismo)
  - Corridas de montanha (trail)

### Março

#### App Mobile - Fase 1

- [ ] **Setup Projeto**
  - React Native + Expo
  - Navegação (React Navigation)
  - Estado global (Redux/Zustand)
  - Autenticação

- [ ] **Telas Básicas**
  - Login/Signup
  - Dashboard
  - Plano semanal
  - Perfil

- [ ] **Funcionalidades Core**
  - Visualizar plano
  - Marcar treinos como completos
  - Sincronização com backend
  - Notificações push nativas

---

## 📅 Q2 2025 (Abril - Junho)

### Abril

#### App Mobile - Fase 2

- [ ] **Tracking de Corrida GPS**
  - GPS tracking nativo
  - Métricas em tempo real (pace, distância, tempo)
  - Audio cues (a cada km)
  - Integração com plano

- [ ] **Offline Mode**
  - Cache de dados do plano
  - Sincronização quando online
  - Funcionalidades básicas offline

- [ ] **Apple Health / Google Fit**
  - Sincronização de atividades
  - Importar dados de saúde
  - Exportar treinos

### Maio

#### Social Features

- [ ] **Perfil Público**
  - Página pública do atleta
  - Treinos compartilhados
  - Conquistas visíveis
  - Estatísticas

- [ ] **Sistema de Amigos**
  - Adicionar amigos
  - Ver treinos de amigos
  - Comentar e reagir
  - Competições amigáveis

- [ ] **Grupos e Clubes**
  - Criar/juntar-se a grupos
  - Chat de grupo
  - Desafios de grupo
  - Rankings de grupo

### Junho

#### Marketplace de Treinadores

- [ ] **Perfil de Treinador**
  - Treinadores profissionais podem se cadastrar
  - Portfólio e especialidades
  - Avaliações de atletas
  - Preços e pacotes

- [ ] **Matching Atleta-Treinador**
  - Sistema de recomendação
  - Filtros por especialidade, preço, localização
  - Chat direto com treinador

- [ ] **Planos Customizados por Treinador**
  - Treinador pode criar/editar planos
  - Comunicação direta com atleta
  - Ajustes em tempo real

---

## 📅 Q3 2025 (Julho - Setembro)

### Julho

#### Analytics Preditivos

- [ ] **Predição de Performance**
  - IA prediz tempo de prova com base no treino
  - Simulações de cenários
  - Recomendações de ajuste

- [ ] **Análise de Risco de Lesão**
  - IA detecta padrões de overtraining
  - Alertas preventivos
  - Recomendações de recuperação

- [ ] **Otimização de Plano**
  - IA sugere melhor distribuição de treinos
  - A/B testing de abordagens
  - Machine learning sobre dados de usuários

### Agosto

#### Competições Virtuais

- [ ] **Desafios Mensais**
  - Desafios de km acumulados
  - Desafios de consistência
  - Rankings globais
  - Prêmios e badges

- [ ] **Corridas Virtuais**
  - Organização de corridas virtuais
  - Inscrições e cronometragem
  - Certificados digitais
  - Integração com Strava segments

### Setembro

#### Lançamento App Mobile Final

- [ ] **Testes Beta** (Julho-Agosto)
  - TestFlight (iOS)
  - Google Play Beta (Android)
  - Feedback de beta testers

- [ ] **Lançamento Oficial**
  - App Store
  - Google Play Store
  - Campanha de lançamento
  - Press release

- [ ] **Marketing Mobile**
  - ASO (App Store Optimization)
  - Campanhas de aquisição
  - Influencers e reviews

---

## 📅 Q4 2025 (Outubro - Dezembro)

### Internacionalização

- [ ] **Versão em Inglês**
  - Tradução completa
  - Unidades imperiais (milhas, lbs)
  - Moeda USD
  - Marketing US

- [ ] **Versão em Espanhol**
  - Tradução completa
  - Marketing LATAM
  - Parcerias locais

### Gamificação Avançada

- [ ] **Sistema de XP e Níveis**
  - Ganhar XP por treinos
  - Níveis de atleta (Bronze → Ouro → Platina)
  - Recompensas por nível

- [ ] **Battles (Duelos)**
  - Desafiar amigos para duelos semanais
  - Rankings head-to-head
  - Troféus virtuais

- [ ] **Eventos Sazonais**
  - Eventos temáticos (Natal, Ano Novo)
  - Recompensas exclusivas
  - Leaderboards temporários

---

## 🔮 Futuro (2026+)

### Ideias Grandes

#### 1. Athera Run Coaching Platform

Plataforma para treinadores profissionais:
- Gerenciar múltiplos atletas
- Dashboard de treinador
- Planos em massa
- CRM integrado
- Mensalidade SaaS B2B

#### 2. Athera Run Teams

Para empresas e assessorias:
- Planos coletivos
- Dashboard de gestão
- Relatórios agregados
- Descontos por volume

#### 3. Athera Run Nutrition

Módulo completo de nutrição:
- Planos alimentares personalizados
- Tracking de macros
- Receitas adaptadas ao treino
- Integração com apps de nutrição

#### 4. Athera Run Recovery

Foco em recuperação:
- Planos de sono
- Massagem e fisioterapia
- Meditation e mindfulness
- Monitoramento de HRV

#### 5. Athera Run Races

Organização de corridas:
- Inscrições
- Cronometragem
  - Resultados e rankings
- Certificados

#### 6. Athera Run AI Coach

Coach de IA mais avançado:
- Análise de vídeos de corrida
- Correção de técnica
- Personal trainer virtual 24/7
- Voice assistant

---

## 💡 Ideias em Exploração

### Sob Análise

- [ ] **Athera Run Wear**
  - Linha de roupas e acessórios
  - Parcerias com marcas

- [ ] **Athera Run Challenges**
  - Desafios patrocinados por marcas
  - Prêmios físicos (tênis, relógios)

- [ ] **Athera Run University**
  - Cursos online sobre corrida
  - Certificações
  - Masterclasses com atletas

- [ ] **Athera Run Podcast**
  - Podcast semanal
  - Entrevistas com atletas
  - Dicas de treino

- [ ] **Integração com Whoop**
  - HRV e recovery
  - Strain e stress
  - Ajustes baseados em recuperação

- [ ] **Integração com Apple Watch**
  - App nativo Apple Watch
  - Workouts diretos no relógio
  - Complicações (complications)

- [ ] **Realidade Aumentada**
  - AR para correção de forma
  - Visualização de pace em tempo real
  - Navegação AR para rotas

---

## 📊 Métricas de Sucesso

### KPIs Principais

| Métrica | Atual | Q4 2024 | Q1 2025 | Q2 2025 | Q3 2025 |
|---------|-------|---------|---------|---------|---------|
| **Usuários Ativos** | 50 | 200 | 500 | 1.000 | 2.000 |
| **Assinantes Premium** | 10 | 50 | 100 | 250 | 500 |
| **MRR** | R$ 300 | R$ 1.500 | R$ 3.000 | R$ 7.500 | R$ 15.000 |
| **Planos Gerados** | 100 | 500 | 1.500 | 4.000 | 10.000 |
| **Taxa de Conversão** | 20% | 25% | 30% | 35% | 40% |
| **Churn Rate** | - | <10% | <8% | <7% | <5% |
| **NPS** | - | 50+ | 60+ | 70+ | 80+ |

### Objetivos de Produto

- **Time to First Plan**: < 5 minutos (do signup ao plano gerado)
- **Plan Generation Time**: < 30 segundos
- **Mobile App Rating**: > 4.5 estrelas
- **Customer Support**: < 24h resposta
- **Uptime**: > 99.9%

---

## 🛠️ Stack Técnico Futuro

### Considerações

#### Backend

- [ ] Migrar para microservices? (se escalar muito)
- [ ] GraphQL em vez de REST?
- [ ] Serverless functions para tarefas pesadas

#### Frontend

- [ ] Next.js 15+ (quando lançar)
- [ ] React 19 (quando estável)
- [ ] Migrar para Turbopack?

#### Mobile

- [ ] React Native (decisão atual)
- [ ] OU Flutter? (avaliar performance)
- [ ] OU Native (Swift/Kotlin)? (máxima performance)

#### IA/ML

- [ ] Fine-tuning de modelo próprio
- [ ] Self-hosted LLM (custos)
- [ ] GPT-5 quando lançar

#### Infraestrutura

- [ ] Multi-region deployment
- [ ] CDN global
- [ ] Edge computing

---

## 💰 Plano de Monetização

### Modelos de Receita

#### 1. Assinaturas (Principal)

- **Free**: R$ 0
  - 1 plano básico
  - Funcionalidades limitadas
  
- **Premium**: R$ 29,90/mês ou R$ 288/ano
  - Planos ilimitados
  - Todas as funcionalidades
  - Suporte prioritário

- **Pro** (Futuro): R$ 79,90/mês
  - Tudo do Premium +
  - Coaching 1:1 mensal
  - Planos multi-esporte
  - Análises avançadas

#### 2. Marketplace (Futuro)

- Comissão de 20-30% sobre serviços de treinadores
- Receita estimada: R$ 5.000-10.000/mês em 2025

#### 3. B2B (Futuro)

- **Athera Run Teams**: R$ 49/atleta/mês
- **Athera Run Coaching**: R$ 299/treinador/mês
- Target: 10 clientes B2B até final de 2025

#### 4. Afiliados e Parcerias

- Comissões em vendas de produtos (tênis, relógios)
- Patrocínios em desafios virtuais
- Parcerias com corridas (descontos para assinantes)

### Projeção de Receita

| Mês | Usuários Free | Premium | MRR | ARR |
|-----|---------------|---------|-----|-----|
| Out/24 | 50 | 10 | R$ 300 | R$ 3.600 |
| Dez/24 | 200 | 50 | R$ 1.500 | R$ 18.000 |
| Mar/25 | 500 | 100 | R$ 3.000 | R$ 36.000 |
| Jun/25 | 1.000 | 250 | R$ 7.500 | R$ 90.000 |
| Set/25 | 2.000 | 500 | R$ 15.000 | R$ 180.000 |
| Dez/25 | 5.000 | 1.000 | R$ 30.000 | R$ 360.000 |

**Meta 2025: R$ 360.000 ARR**

---

## 🎯 Próximos Passos Imediatos

### Esta Semana (03-09 Nov)

1. ✅ Consolidar documentação
2. [ ] Implementar ajustes inteligentes (MVP)
3. [ ] Setup de notificações por email
4. [ ] Melhorar performance de geração

### Este Mês (Novembro)

1. [ ] Lançar ajustes inteligentes completo
2. [ ] Implementar analytics avançados
3. [ ] Melhorar UX do dashboard
4. [ ] Iniciar marketing agressivo

### Este Trimestre (Q4 2024)

1. [ ] Atingir 200 usuários ativos
2. [ ] Atingir 50 assinantes Premium
3. [ ] Lançar planos de força detalhados
4. [ ] Estabilizar plataforma (< 5 bugs/semana)

---

## 📞 Feedback e Sugestões

Este roadmap é vivo e deve evoluir com feedback de:
- Usuários da plataforma
- Equipe de desenvolvimento
- Parceiros e investidores
- Comunidade de corredores

**Como sugerir features:**
- Abrir issue no repositório
- Email: suporte@atherarun.com
- Formulário de feedback no app

---

**© 2024 Athera Run. O futuro da corrida é agora.** 🏃‍♂️💨
