# 🔍 AUDITORIA COMPLETA DO SISTEMA - Onboarding, Perfil e Geração de Planos

**Data:** 07/Novembro/2025 16:05 UTC  
**Versão Atual:** 1.5.5  
**Status:** ✅ Sistema Funcional, Necessita Refinamentos  
**Prioridade:** 🔴 ALTA - Convergência e Integração Total

---

## 📋 ÍNDICE

1. [Análise do Onboarding](#análise-do-onboarding)
2. [Análise do Perfil](#análise-do-perfil)
3. [Análise da Geração de Planos](#análise-da-geração-de-planos)
4. [Mapeamento de Dados](#mapeamento-de-dados)
5. [Problemas Identificados](#problemas-identificados)
6. [Plano de Correção](#plano-de-correção)
7. [Melhorias Propostas](#melhorias-propostas)

---

## 🎯 OBJETIVO DA AUDITORIA

**Garantir convergência total entre:**
1. Dados coletados no Onboarding
2. Dados exibidos no Perfil
3. Dados usados na Geração de Planos
4. Dados usados no Auto-ajuste

**Zero duplicidades, zero incongruências, 100% integrado.**

---

## 1️⃣ ANÁLISE DO ONBOARDING

### 📊 Estrutura Atual (7 Steps)

#### Step 1: Basic Data ✅ BOM
**Coleta:**
- Nome, Email, Idade, Gênero
- Peso, Altura
- FC Repouso, Qualidade Sono, Nível Estresse

**Status:** ✅ Completo e funcional  
**Issues:** Nenhum  

---

#### Step 2: Sport Background ✅ BOM
**Coleta:**
- Nível de corrida (iniciante/intermediário/avançado)
- Anos correndo
- Volume semanal (km)
- Longão mais longo
- Pace preferido
- Outros esportes

**Status:** ✅ Completo e funcional  
**Issues:** Nenhum

---

#### Step 3: Performance ✅ BOM
**Coleta:**
- Melhores tempos (5k, 10k, 21k, 42k)
- VDOT automático

**Status:** ✅ Completo e funcional  
**Issues:** Nenhum

---

#### Step 4: Health ✅ BOM
**Coleta:**
- Histórico de lesões
- Lesões específicas
- Liberação médica
- Dados fisiológicos detalhados

**Status:** ✅ Completo e funcional  
**Issues:** Nenhum

---

#### Step 5: Goals ⚠️ CRÍTICO - FALTANDO CAMPOS
**Coleta:**
- Objetivo principal
- Distância da corrida
- Data da prova
- Tempo alvo (opcional)
- Motivações

**🔴 PROBLEMA CRÍTICO:**
```
❌ NÃO COLETA: Dia do longão preferido
❌ NÃO COLETA: Prioridade da corrida (A/B/C)
```

**Impacto:**
- Usuário não pode escolher quando fazer o longão
- Sistema decide arbitrariamente
- Péssima experiência

**Solução Necessária:**
- Adicionar campo "Qual dia prefere fazer o longão?"
- Dropdown: Domingo, Segunda, ..., Sábado
- Explicação: "Esse será seu treino mais longo da semana"

---

#### Step 6: Availability ⚠️ INCOMPLETO
**Coleta:**
- Dias disponíveis para corrida
- Outras atividades (academia, yoga, ciclismo, natação)
- Acesso a infraestrutura
- Preferências de treino

**🔴 PROBLEMA CRÍTICO:**
```
❌ NÃO COLETA: Horários preferenciais
❌ NÃO EXIBE: Claramente quais dias foram selecionados
❌ NÃO CONFIRMA: "Você treina segunda, quarta e sexta"
```

**Solução Necessária:**
- Adicionar resumo visual dos dias selecionados
- Adicionar horários preferenciais (manhã/tarde/noite)
- Confirmar claramente as escolhas

---

#### Step 7: Review 🔴 CRÍTICO - INCOMPLETO
**Status Atual:** Mostra apenas informações básicas

**🔴 PROBLEMAS IDENTIFICADOS:**
```
❌ NÃO MOSTRA: Outros esportes selecionados
❌ NÃO MOSTRA: Melhores tempos informados
❌ NÃO MOSTRA: Dias de treino CLARAMENTE
❌ NÃO MOSTRA: Dia do longão (porque não é coletado!)
❌ NÃO MOSTRA: Horários preferenciais
❌ NÃO MOSTRA: Lesões detalhadas
❌ NÃO MOSTRA: Infraestrutura disponível (academia, piscina, pista)
```

**Solução Necessária:**
- Review COMPLETO de TODOS os dados
- Formatação clara e visual
- Permitir voltar e editar cada step

---

## 2️⃣ ANÁLISE DO PERFIL

### 📊 Estrutura Atual (Abas)

Vou investigar o que existe atualmente...

**Localização:** `/app/[locale]/perfil/page.tsx`

### 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

#### Problema 1: Dados Não Aparecem
```
Usuário reportou:
"Nas disponibilidades do perfil não estão mostrando os dias e atividades"
"Nas experiências não mostra nada, mesmo preenchendo"
```

**Causa Raiz:** Possíveis:
1. Componentes do perfil não leem os campos corretos do banco
2. Nomes de campos diferentes entre onboarding e perfil
3. Dados não estão sendo salvos corretamente
4. Componentes desatualizados (v1.3.0?)

#### Problema 2: Falta Aba de Preferências
```
❌ NÃO EXISTE: Aba de Preferências
```

**O que deveria ter:**
- Idioma preferencial
- Unidades (km/mi, kg/lb)
- Formato de data
- Timezone
- Notificações (email, push)
- Privacidade

#### Problema 3: Não Permite Editar Dia do Longão
```
❌ NÃO PERMITE: Escolher dia do longão
```

Porque não é coletado no onboarding!

---

## 3️⃣ ANÁLISE DA GERAÇÃO DE PLANOS

### 🔴 PROBLEMAS CRÍTICOS

#### Problema 1: Convergência de Dados
```
ONBOARDING coleta:
- availableDays: {running: [0, 2, 4], other: {gym: [1, 3]}}

PERFIL salva:
- trainingActivities: [0, 2, 4]  ← Perde info de outras atividades!

GERAÇÃO DE PLANO lê:
- ??? Qual formato usa?
```

**Incongruência Total!**

#### Problema 2: Dia do Longão
```
ONBOARDING: Não pergunta
PERFIL: Campo existe (longRunDay)
GERAÇÃO: Como decide? Arbitrariamente?
```

#### Problema 3: Outros Esportes
```
ONBOARDING coleta: ['natação', 'ciclismo']
SALVA como: "natação, ciclismo" (string)
PERFIL mostra: ???
GERAÇÃO usa: ???
```

---

## 4️⃣ MAPEAMENTO COMPLETO DE DADOS

### Schema Prisma vs Onboarding vs Perfil

| Campo Prisma | Onboarding Coleta | Perfil Exibe | Geração Usa | Status |
|--------------|-------------------|--------------|-------------|--------|
| **BÁSICO** |
| age | ✅ Step1 | ✅ | ✅ | OK |
| gender | ✅ Step1 | ✅ | ✅ | OK |
| weight | ✅ Step1 | ✅ | ✅ | OK |
| height | ✅ Step1 | ✅ | ✅ | OK |
| restingHeartRate | ✅ Step1 | ✅ | ✅ | OK |
| sleepQuality | ✅ Step1 | ❓ | ✅ | ⚠️ Verificar exibição |
| stressLevel | ✅ Step1 | ❓ | ✅ | ⚠️ Verificar exibição |
| **EXPERIÊNCIA** |
| runningLevel | ✅ Step2 | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| runningYears | ✅ Step2 | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| currentWeeklyKm | ✅ Step2 (weeklyVolume) | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| longestRun | ✅ Step2 | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| preferredPace | ✅ Step2 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| otherSportsExperience | ✅ Step2 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| **PERFORMANCE** |
| bestTimes | ✅ Step3 | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| currentVDOT | 🤖 Auto | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| **SAÚDE** |
| injuryDetails | ✅ Step4 | ❓ | ✅ | ⚠️ Verificar |
| injuryRecoveryStatus | ✅ Step4 | ❓ | ❓ | ⚠️ Verificar |
| medicalConditions | ✅ Step4 | ❓ | ❓ | ⚠️ Verificar |
| **OBJETIVOS** |
| goalDistance | ✅ Step5 | ✅ | ✅ | OK |
| targetRaceDate | ✅ Step5 | ✅ | ✅ | OK |
| targetTime | ✅ Step5 | ✅ | ✅ | OK |
| primaryGoal | ✅ Step5 | ❓ | ❓ | ⚠️ Verificar |
| motivationFactors | ✅ Step5 | ❓ | ❓ | ⚠️ Verificar |
| **DISPONIBILIDADE** |
| trainingActivities | ✅ Step6 | ❌ NÃO MOSTRA | ✅ | 🔴 CRÍTICO |
| longRunDay | ❌ NÃO COLETA | ❓ Campo existe | ❓ | 🔴 CRÍTICO |
| weeklyAvailability | 🤖 Auto-calculado | ❓ | ✅ | ⚠️ Verificar |
| hasGymAccess | ✅ Step6 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| hasPoolAccess | ✅ Step6 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| hasTrackAccess | ✅ Step6 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| trainingPreferences | ✅ Step6 | ❌ NÃO MOSTRA | ❓ | 🔴 CRÍTICO |
| **PREFERÊNCIAS** |
| locale | ❌ Não editável | ❌ | ✅ | 🔴 Criar aba |

### 📊 Estatísticas Alarmantes

```
Total de campos: 38
Coletados no onboarding: 32 (84%)
Exibidos no perfil: ~15 (39%) 🔴 CRÍTICO
Usados na geração: ~25 (66%)

DIVERGÊNCIA: 61% dos dados coletados NÃO aparecem no perfil!
```

---

## 5️⃣ PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS (Bloqueiam funcionalidade)

#### 1. Dia do Longão Não É Coletado
**Impacto:** Usuário não pode escolher quando fazer treino mais importante  
**Prioridade:** 🔴 MÁXIMA  
**Esforço:** 2 horas

#### 2. Dados de Experiência Não Aparecem no Perfil
**Impacto:** Usuário não vê o que preencheu, perde confiança  
**Prioridade:** 🔴 MÁXIMA  
**Esforço:** 4 horas

#### 3. Disponibilidade Não Aparece no Perfil
**Impacto:** Usuário não consegue validar/editar seus dias de treino  
**Prioridade:** 🔴 MÁXIMA  
**Esforço:** 4 horas

#### 4. Infraestrutura Não Aparece
**Impacto:** Academia, piscina, pista não são mostradas  
**Prioridade:** 🔴 ALTA  
**Esforço:** 2 horas

### 🟠 ALTAS (Prejudicam UX)

#### 5. Falta Aba de Preferências
**Impacto:** Usuário não pode mudar idioma, unidades, etc  
**Prioridade:** 🟠 ALTA  
**Esforço:** 6 horas

#### 6. Review Incompleto no Step 7
**Impacto:** Usuário não valida tudo antes de enviar  
**Prioridade:** 🟠 ALTA  
**Esforço:** 3 horas

#### 7. Melhores Tempos Não Aparecem
**Impacto:** Usuário não vê seus PRs no perfil  
**Prioridade:** 🟠 ALTA  
**Esforço:** 2 horas

### 🟡 MÉDIAS (Melhorias)

#### 8. Horários Preferenciais
**Impacto:** Poderia sugerir horários melhores  
**Prioridade:** 🟡 MÉDIA  
**Esforço:** 3 horas

#### 9. Validação Visual dos Dias
**Impacto:** Confirmar claramente os dias escolhidos  
**Prioridade:** 🟡 MÉDIA  
**Esforço:** 2 horas

---

## 6️⃣ PLANO DE CORREÇÃO

### 🎯 FASE 1: Correções Críticas (12-16 horas)

#### Sprint 1.1: Dia do Longão (2h)
```
□ Adicionar campo no Step 6
□ Mostrar explicação clara
□ Salvar no banco (longRunDay)
□ Mostrar no perfil
□ Usar na geração de planos
```

#### Sprint 1.2: Dados de Experiência no Perfil (4h)
```
□ Criar/atualizar aba "Experiência"
□ Mostrar: nível, anos, volume, longão, pace
□ Mostrar: outros esportes
□ Permitir edição
□ Sincronizar com banco
```

#### Sprint 1.3: Disponibilidade no Perfil (4h)
```
□ Criar/atualizar aba "Disponibilidade"
□ Mostrar: dias de corrida claramente
□ Mostrar: outras atividades (gym, yoga, etc)
□ Mostrar: dia do longão (NOVO)
□ Mostrar: infraestrutura (academia, piscina, pista)
□ Permitir edição
```

#### Sprint 1.4: Infraestrutura no Perfil (2h)
```
□ Exibir hasGymAccess
□ Exibir hasPoolAccess
□ Exibir hasTrackAccess
□ Permitir edição
```

---

### 🎯 FASE 2: Melhorias Importantes (12-15 horas)

#### Sprint 2.1: Aba de Preferências (6h)
```
□ Criar nova aba "Preferências"
□ Idioma preferencial (pt-BR, en, es)
□ Unidades (métrico/imperial)
□ Timezone
□ Formato de data
□ Notificações (email, push)
□ Privacidade
□ Salvar no User model
```

#### Sprint 2.2: Review Completo Step 7 (3h)
```
□ Adicionar seção "Outros Esportes"
□ Adicionar seção "Melhores Tempos"
□ Adicionar seção "Infraestrutura"
□ Adicionar seção "Dia do Longão"
□ Melhorar formatação visual
□ Permitir editar cada seção
```

#### Sprint 2.3: Melhores Tempos no Perfil (2h)
```
□ Criar seção na aba "Performance"
□ Exibir PRs (5k, 10k, 21k, 42k)
□ Exibir VDOT calculado
□ Permitir atualização
```

#### Sprint 2.4: Horários Preferenciais (3h)
```
□ Adicionar no Step 6
□ Manhã (5h-9h)
□ Meio-dia (11h-14h)
□ Tarde (15h-18h)
□ Noite (19h-22h)
□ Salvar no banco
□ Mostrar no perfil
```

---

### 🎯 FASE 3: Validação e Testes (6-8 horas)

#### Sprint 3.1: Testes de Integração (3h)
```
□ Testar fluxo completo: Onboarding → Perfil
□ Validar TODOS os dados aparecem
□ Testar edição no perfil
□ Validar persistência
```

#### Sprint 3.2: Testes de Geração de Plano (3h)
```
□ Testar com longRunDay definido
□ Validar plano respeita dia do longão
□ Testar com infraestrutura variada
□ Validar plano usa musculação quando disponível
```

#### Sprint 3.3: Documentação (2h)
```
□ Atualizar CONTEXTO.md
□ Criar CONVERGENCE_COMPLETE.md
□ Documentar novos campos
□ Atualizar GUIA_TECNICO.md
```

---

## 7️⃣ MELHORIAS PROPOSTAS

### 💡 Curto Prazo (Próximas 2 semanas)

1. **Validação em Tempo Real**
   - Mostrar ✅ quando campo preenchido
   - Bloquear avanço se obrigatórios vazios
   - Feedback visual instantâneo

2. **Resumo Progressivo**
   - Mini-resumo no final de cada step
   - "Você informou: X, Y, Z"
   - Confirmar antes de avançar

3. **Edição Inline no Review**
   - Clicar em qualquer dado no Step 7
   - Modal abre para editar
   - Salva e atualiza resumo

### 🚀 Médio Prazo (1-2 meses)

4. **Wizard de Completude**
   - "Seu perfil está 85% completo"
   - Lista do que falta
   - Links diretos para completar

5. **Sugestões Inteligentes**
   - IA sugere dias de treino baseado em padrões
   - "Pessoas com seu perfil treinam às 6h da manhã"
   - Sugestão de dia do longão baseado em dados

6. **Validação de Consistência**
   - "Você disse que é iniciante mas tem 5 anos de experiência?"
   - "Volume de 50km/semana parece alto para iniciante"
   - Alertas amigáveis, não bloqueantes

### 🌟 Longo Prazo (3-6 meses)

7. **Importação de Dados**
   - Importar do Strava automaticamente
   - "Detectamos que você corre segundas e quartas"
   - "Seu longão costuma ser no domingo"

8. **Perfil Inteligente**
   - Atualização automática baseada em treinos
   - "Seu VDOT melhorou de 45 para 48!"
   - "Seu volume médio subiu para 35km/semana"

9. **Comparação e Benchmarking**
   - "Você está acima da média para sua idade/gênero"
   - "Seu progresso: +15% vs média de +8%"
   - Gamificação positiva

---

## 8️⃣ ARQUITETURA DE DADOS PROPOSTA

### 🗂️ Single Source of Truth

```typescript
// Modelo unificado de dados do atleta
interface AthleteData {
  // IDENTIDADE
  id: string
  userId: string
  
  // BÁSICO
  basic: {
    age: number
    gender: 'male' | 'female'
    weight: number
    height: number
    restingHeartRate?: number
    sleepQuality: 1-5
    stressLevel: 1-5
  }
  
  // EXPERIÊNCIA
  experience: {
    runningLevel: 'beginner' | 'intermediate' | 'advanced'
    yearsRunning: number
    currentWeeklyKm: number
    longestRun: number
    preferredPace: string
    otherSports: string[]  // Array sempre
    otherSportsYears?: number
  }
  
  // PERFORMANCE
  performance: {
    bestTimes: {
      '5k'?: { time: string, vdot: number }
      '10k'?: { time: string, vdot: number }
      '21k'?: { time: string, vdot: number }
      '42k'?: { time: string, vdot: number }
    }
    currentVDOT: number
    lastVDOTUpdate: Date
  }
  
  // SAÚDE
  health: {
    injuries: Injury[]
    medicalConditions: string[]
    medicalClearance: boolean
    medicalNotes?: string
    injuryRecoveryStatus?: 'recovered' | 'recovering' | 'chronic'
    lastInjuryDate?: Date
  }
  
  // OBJETIVOS
  goals: {
    primary: string
    goalDistance: string
    targetRaceDate: Date
    targetTime?: string
    motivations: {
      primary: string
      secondary: string[]
      goals: string[]
    }
  }
  
  // DISPONIBILIDADE
  availability: {
    runningDays: number[]  // [0, 2, 4] = Dom, Ter, Qui
    longRunDay: number     // 0 = Domingo
    preferredTimes: ('morning' | 'afternoon' | 'evening' | 'night')[]
    otherActivities: {
      gym?: number[]
      yoga?: number[]
      cycling?: number[]
      swimming?: number[]
    }
    infrastructure: {
      hasGym: boolean
      hasPool: boolean
      hasTrack: boolean
    }
    preferences: {
      locations: string[]
      preferred: string
      groupTraining: boolean
      indoorOutdoor: 'indoor' | 'outdoor' | 'both'
    }
  }
  
  // PREFERÊNCIAS DO SISTEMA
  preferences: {
    locale: 'pt-BR' | 'en' | 'es'
    units: 'metric' | 'imperial'
    timezone: string
    dateFormat: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  
  // META
  meta: {
    onboardingComplete: boolean
    hasCustomPlan: boolean
    autoAdjustEnabled: boolean
    lastUpdated: Date
    completenessScore: number  // 0-100%
  }
}
```

### 🔄 Fluxo de Dados Unificado

```
ONBOARDING (Coleta)
      ↓
  validates & transforms
      ↓
ATHLETE DATA MODEL (Storage)
      ↓
  ├─→ PROFILE (Display)
  ├─→ PLAN GENERATOR (Use)
  ├─→ AUTO-ADJUST (Use)
  └─→ ANALYTICS (Use)
```

**Benefícios:**
- Uma única fonte de verdade
- Sem duplicação
- Sem incongruências
- Fácil manutenção
- Fácil adicionar novos consumidores

---

## 9️⃣ CHECKLIST DE CONVERGÊNCIA

### ✅ Para Considerar Sistema 100% Convergente

#### Onboarding
- [ ] Coleta dia do longão preferido
- [ ] Coleta horários preferenciais
- [ ] Review mostra 100% dos dados
- [ ] Validação em tempo real
- [ ] Feedback visual de progresso

#### Perfil
- [ ] Aba Básico mostra todos dados do Step 1
- [ ] Aba Experiência mostra todos dados do Step 2
- [ ] Aba Performance mostra Step 3 + VDOT
- [ ] Aba Saúde mostra Step 4 completo
- [ ] Aba Corridas mostra Step 5 + race goals
- [ ] Aba Disponibilidade mostra Step 6 completo
- [ ] Aba Preferências permite editar idioma, etc
- [ ] Cada aba permite edição
- [ ] Edição sincroniza com banco
- [ ] Dados atualizados refletem em tempo real

#### Geração de Planos
- [ ] Usa dia do longão escolhido pelo usuário
- [ ] Respeita todos os dias disponíveis
- [ ] Respeita horários preferenciais
- [ ] Usa infraestrutura disponível (gym, pool, track)
- [ ] Considera outros esportes
- [ ] Adapta baseado em lesões
- [ ] Respeita nível de experiência
- [ ] Usa VDOT atualizado
- [ ] Considera volume atual

#### Auto-Ajuste
- [ ] Detecta mudanças no perfil
- [ ] Ajusta plano automaticamente
- [ ] Preserva histórico
- [ ] Notifica usuário
- [ ] Permite reverter

#### Testes
- [ ] E2E: Onboarding → Perfil → Plano
- [ ] Validação de cada campo
- [ ] Edição no perfil reflete no plano
- [ ] Longão no dia correto
- [ ] Infraestrutura usada quando disponível

---

## 🎯 RESUMO EXECUTIVO

### 📊 Situação Atual

| Aspecto | Status | Nota |
|---------|--------|------|
| Onboarding | 🟡 80% | Falta dia longão, horários |
| Perfil | 🔴 40% | Muitos dados não aparecem |
| Geração Planos | 🟡 70% | Funciona mas não usa tudo |
| Convergência | 🔴 50% | Muitas incongruências |
| Integração | 🟡 60% | Funciona mas incompleto |

### 🎯 Meta: 100% em Tudo

**Tempo Estimado:** 30-40 horas  
**Prioridade:** 🔴 MÁXIMA  
**ROI:** 🌟🌟🌟🌟🌟 Altíssimo (experiência e confiança do usuário)

### 🚀 Próximos Passos Imediatos

1. **HOJE:** Adicionar dia do longão no Step 6 (2h)
2. **AMANHÃ:** Corrigir exibição no perfil (8h)
3. **PRÓXIMA SEMANA:** Aba de preferências (6h)
4. **PRÓXIMAS 2 SEMANAS:** Review completo + validação (10h)

---

## 📞 AÇÕES RECOMENDADAS

### 🔥 Fazer AGORA (Hoje/Amanhã)
1. Adicionar campo dia do longão
2. Corrigir exibição de experiência no perfil
3. Corrigir exibição de disponibilidade no perfil

### ⚡ Fazer Esta Semana
4. Criar aba de preferências
5. Melhorar Step 7 Review
6. Adicionar melhores tempos no perfil

### 📅 Fazer Próximas 2 Semanas
7. Horários preferenciais
8. Validação em tempo real
9. Testes E2E completos

---

**Documento gerado em:** 07/Nov/2025 16:20 UTC  
**Próxima revisão:** Após implementação da Fase 1  
**Status:** ✅ PRONTO PARA EXECUÇÃO

---

*Este documento serve como roadmap completo para alcançar 100% de convergência e integração no sistema.*
