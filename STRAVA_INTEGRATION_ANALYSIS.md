# ANÁLISE COMPLETA - INTEGRAÇÃO STRAVA ATHERA RUN
**Data:** 2025-11-20  
**Versão Atual:** 2.6.0

## 📋 RESUMO EXECUTIVO
A integração com Strava já está **FUNCIONAL e IMPLEMENTADA**. O sistema atual permite conectar contas Strava (recurso PREMIUM), importar treinos automaticamente e sincronizar dados. Existem tabelas e serviços para funcionalidades avançadas (PRs, Stats, Gear) que estão **PARCIALMENTE IMPLEMENTADAS**.

---

## 🗄️ BANCO DE DADOS ATUAL

### Tabelas Principais Strava

#### 1. **athlete_profiles** (Conexão Strava)
```sql
stravaConnected       Boolean   @default(false)
stravaAthleteId       String?   @unique
stravaAccessToken     String?
stravaRefreshToken    String?
stravaTokenExpiry     DateTime?
```
✅ **Status:** FUNCIONANDO - Armazena credenciais OAuth

#### 2. **completed_workouts** (Treinos Importados)
```sql
stravaActivityId String? @unique
```
✅ **Status:** FUNCIONANDO - Vincula treinos do Strava

#### 3. **strava_webhooks** 
✅ **Status:** EXISTE - Para receber notificações em tempo real

#### 4. **strava_stats** (v2.6.0 - Nova)
```sql
- allRunsTotals, recentRunsTotals, ytdRunsTotals
- allRideTotals, recentRideTotals, ytdRideTotals  
- allSwimTotals, recentSwimTotals, ytdSwimTotals
- avgDistance, avgPace, avgHeartRate, avgElevationGain
- weeklyFrequency, monthlyFrequency
```
⚠️ **Status:** TABELA EXISTE, SERVIÇO IMPLEMENTADO, MAS NÃO INTEGRADO AO FLUXO

#### 5. **strava_personal_records** (v2.6.0 - Nova)
```sql
- type (400m, 1k, 5k, 10k, half_marathon, marathon)
- time, pace, activityId, activityDate
- heartRate, elevationGain, temperature
- isOfficial, raceName, location
```
⚠️ **Status:** TABELA EXISTE, SERVIÇO IMPLEMENTADO, MAS NÃO INTEGRADO AO FLUXO

#### 6. **strava_gear** (v2.6.0 - Nova)
```sql
- name, brand, model, description
- type (shoe, bike)
- distance, activityCount
- purchaseDate, retiredDate, isRetired
```
⚠️ **Status:** TABELA EXISTE, SEM SERVIÇO IMPLEMENTADO

#### 7. **strava_training_zones** (v2.6.0 - Nova)
```sql
- heartRateZones, maxHeartRate, restingHeartRate
- powerZones, ftp
- paceZones, thresholdPace
```
⚠️ **Status:** TABELA EXISTE, SEM SERVIÇO IMPLEMENTADO

#### 8. **strava_activities** (v2.6.0 - Nova)
```sql
- Armazena histórico completo de atividades com metadados estendidos
- Distância, tempo, performance, elevação, temperatura
- Kudos, comentários, equipamento
- Localização, flags (manual, trainer, commute)
```
⚠️ **Status:** TABELA EXISTE, SEM SERVIÇO IMPLEMENTADO

---

## 📁 ARQUIVOS E SERVIÇOS ATUAIS

### Serviços Core (/lib)

#### ✅ **lib/strava.ts** - FUNCIONANDO
- `refreshStravaToken()` - Renova tokens OAuth
- `fetchStravaActivities()` - Busca atividades
- `importStravaActivity()` - Importa treino do Strava
- `linkToPlannedWorkout()` - Vincula automaticamente ao plano
- `mapStravaActivityType()` - Mapeia tipos de atividade
- `calculatePace()` - Calcula pace

#### ⚠️ **lib/strava-stats.ts** - IMPLEMENTADO MAS NÃO USADO
- `fetchStravaStats()` - Busca estatísticas do atleta
- `importStravaStats()` - Importa e salva stats (PREMIUM)
- `getStravaStats()` - Recupera stats salvos
- `calculateAverages()` - Calcula médias

**❌ PROBLEMA:** Serviço existe mas não é chamado em nenhum lugar

#### ⚠️ **lib/strava-prs.ts** - IMPLEMENTADO MAS NÃO USADO
- `extractPRsFromActivities()` - Extrai PRs das atividades
- `importStravaPRs()` - Importa PRs (PREMIUM)
- `getStravaPRs()` - Recupera PRs salvos
- `getStravaPR()` - Recupera PR específico

**❌ PROBLEMA:** Serviço existe mas não é chamado em nenhum lugar

#### ❌ **lib/strava-gear.ts** - NÃO EXISTE
- Precisa ser criado

---

### APIs (/app/api/strava)

#### ✅ **FUNCIONANDO:**
1. `/api/strava/auth` - Inicia OAuth
2. `/api/strava/callback` - Callback OAuth
3. `/api/strava/disconnect` - Desconecta conta
4. `/api/strava/import` - Importa atividades (PREMIUM)
5. `/api/strava/sync-all` - Sincroniza todas atividades
6. `/api/strava/webhook` - Recebe notificações webhook

#### ⚠️ **EXISTEM MAS NÃO FUNCIONAM:**
7. `/api/strava/stats` - **EXISTE** mas retorna erro
8. `/api/strava/prs` - **EXISTE** mas não é chamado
9. `/api/strava/gear` - **EXISTE** mas não funciona
10. `/api/strava/sync-stats` - **EXISTE** mas não é usado

---

## 🎯 O QUE JÁ FUNCIONA (PREMIUM)

### ✅ Funcionalidades Ativas:
1. **Conexão OAuth com Strava** - OAuth flow completo
2. **Importação de Treinos** - Atividades viram completed_workouts
3. **Vinculação Automática** - Treinos importados se conectam ao plano
4. **Renovação de Token** - Tokens são renovados automaticamente
5. **Webhook Events** - Sistema preparado para notificações em tempo real
6. **Desconexão** - Usuário pode desconectar conta

### 🔒 Restrições:
- **APENAS PREMIUM** pode conectar Strava
- **APENAS PREMIUM** pode importar treinos
- Usuários FREE podem preencher treinos manualmente

---

## ❌ O QUE NÃO FUNCIONA/NÃO ESTÁ INTEGRADO

### 1. **Estatísticas do Atleta (strava_stats)**
**Tabela:** ✅ Existe  
**Serviço:** ✅ Implementado  
**API:** ⚠️ Existe mas com erro  
**UI:** ❌ Não integrado  

**O que falta:**
- Corrigir endpoint `/api/strava/stats`
- Criar componente UI para exibir stats
- Chamar `importStravaStats()` no fluxo de sincronização
- Integrar stats no dashboard/perfil

---

### 2. **Recordes Pessoais (strava_personal_records)**
**Tabela:** ✅ Existe  
**Serviço:** ✅ Implementado  
**API:** ⚠️ Existe mas não é chamado  
**UI:** ❌ Não existe  

**O que falta:**
- Corrigir endpoint `/api/strava/prs`
- Criar componente UI para exibir PRs
- Chamar `importStravaPRs()` no fluxo de sincronização
- Integrar PRs no perfil do atleta
- Usar PRs para calcular VDOT automaticamente

---

### 3. **Equipamentos (strava_gear)**
**Tabela:** ✅ Existe  
**Serviço:** ❌ Não implementado  
**API:** ⚠️ Existe mas não funciona  
**UI:** ❌ Não existe  

**O que falta:**
- Criar `lib/strava-gear.ts`
- Implementar `importStravaGear()`
- Corrigir endpoint `/api/strava/gear`
- Criar UI para tracking de tênis
- Alertas de substituição de tênis (>800km)

---

### 4. **Zonas de Treino (strava_training_zones)**
**Tabela:** ✅ Existe  
**Serviço:** ❌ Não implementado  
**API:** ❌ Não existe  
**UI:** ❌ Não existe  

**O que falta:**
- Criar serviço de importação
- Criar API endpoint
- Integrar zonas no cálculo de treinos
- UI para visualização de zonas

---

### 5. **Histórico Completo de Atividades (strava_activities)**
**Tabela:** ✅ Existe  
**Serviço:** ❌ Não implementado  
**API:** ❌ Não existe  
**UI:** ❌ Não existe  

**O que falta:**
- Decidir se é necessário (já temos completed_workouts)
- Se sim, implementar importação
- Criar views de análise histórica

---

## 🚀 PLANO DE AÇÃO RECOMENDADO

### FASE 1: CORREÇÃO E INTEGRAÇÃO DO QUE JÁ EXISTE (PRIORIDADE ALTA)
**Objetivo:** Ativar funcionalidades já desenvolvidas

#### 1.1. Stats do Atleta
- [ ] Corrigir erro no `/api/athlete-stats` (userEmail não existe)
- [ ] Integrar `importStravaStats()` no sync
- [ ] Criar card no dashboard com stats
- [ ] Exibir: Total de corridas, distância total, pace médio, frequência

#### 1.2. Recordes Pessoais  
- [ ] Testar e corrigir `/api/strava/prs`
- [ ] Integrar `importStravaPRs()` no sync
- [ ] Criar seção "Meus Recordes" no perfil
- [ ] Usar PRs para sugerir VDOT automaticamente

#### 1.3. Sincronização Automática
- [ ] Criar job que chama `importStravaStats()` + `importStravaPRs()`
- [ ] Executar a cada importação de treinos
- [ ] Adicionar botão "Sincronizar Tudo" no perfil

---

### FASE 2: EQUIPAMENTOS (PRIORIDADE MÉDIA)
**Objetivo:** Tracking de tênis e equipamentos

#### 2.1. Serviço
- [ ] Criar `lib/strava-gear.ts`
- [ ] Implementar `importStravaGear()`
- [ ] Implementar `getStravaGear()`
- [ ] Calcular km restantes e alertas

#### 2.2. API
- [ ] Criar `/api/strava/gear/route.ts` funcional
- [ ] Endpoint GET para listar equipamentos
- [ ] Endpoint para marcar tênis como aposentado

#### 2.3. UI
- [ ] Criar página "Meus Equipamentos"
- [ ] Card de tênis principal no dashboard
- [ ] Alerta: "Seu tênis está com 850km, considere trocar"
- [ ] Histórico de tênis usados

---

### FASE 3: ZONAS DE TREINO (PRIORIDADE BAIXA)
**Objetivo:** Importar zonas calculadas pelo Strava

#### 3.1. Serviço
- [ ] Criar `lib/strava-zones.ts`
- [ ] Importar zonas de FC, pace, potência
- [ ] Comparar com zonas calculadas pelo VDOT

#### 3.2. Integração
- [ ] Usar zonas do Strava se disponíveis
- [ ] Fallback para VDOT se não houver Strava
- [ ] UI para visualização

---

### FASE 4: MELHORIAS NA UX (PRIORIDADE MÉDIA)
**Objetivo:** Tornar experiência Strava mais fluida

#### 4.1. Dashboard Premium
- [ ] Card "Conecte seu Strava" para users premium sem Strava
- [ ] Card "Stats da Semana" para users conectados
- [ ] Badge "Conectado ao Strava"

#### 4.2. Perfil do Atleta
- [ ] Seção "Dados do Strava" no perfil
- [ ] Exibir: Stats, PRs, Equipamentos
- [ ] Botão "Sincronizar Agora"
- [ ] Última sincronização: "há 2 horas"

#### 4.3. Onboarding
- [ ] Se usuário premium conecta Strava durante onboarding
- [ ] Importar tudo automaticamente
- [ ] Preencher perfil com dados do Strava
- [ ] Calcular VDOT a partir de PRs

---

## 📊 FLUXO IDEAL DE SINCRONIZAÇÃO STRAVA

```
1. Usuário conecta Strava (OAuth)
   ↓
2. Sistema salva tokens e athleteId
   ↓
3. SINCRONIZAÇÃO COMPLETA (primeira vez):
   ├─ importStravaStats()     → strava_stats
   ├─ importStravaPRs()       → strava_personal_records  
   ├─ importStravaGear()      → strava_gear
   └─ importStravaActivities()→ completed_workouts
   ↓
4. SINCRONIZAÇÕES FUTURAS (webhook ou manual):
   ├─ Novas atividades         → completed_workouts
   ├─ Atualizar stats (semanal)
   ├─ Verificar novos PRs
   └─ Atualizar km dos tênis
   ↓
5. USAR DADOS DO STRAVA:
   ├─ Calcular VDOT automaticamente (PRs)
   ├─ Sugerir pace baseado em médias
   ├─ Alertar sobre troca de tênis
   └─ Exibir progresso (stats)
```

---

## 🔒 REGRAS DE NEGÓCIO

### PREMIUM vs FREE

| Funcionalidade | FREE | PREMIUM |
|---|---|---|
| Conectar Strava | ❌ | ✅ |
| Importar treinos | ❌ | ✅ |
| Ver stats do Strava | ❌ | ✅ |
| Ver PRs do Strava | ❌ | ✅ |
| Tracking de equipamentos | ❌ | ✅ |
| Sincronização automática | ❌ | ✅ |
| Preencher treinos manualmente | ✅ | ✅ |
| Ver plano de treino | ✅ | ✅ |

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. Erro no `/api/athlete-stats`
```
Unknown argument `userEmail`. Available options are marked with ?.
```
**Causa:** Código tenta buscar por `userEmail` mas schema só tem `userId`  
**Solução:** Corrigir query para usar `userId`

### 2. Services implementados mas não usados
- `strava-stats.ts` - Implementado mas não chamado
- `strava-prs.ts` - Implementado mas não chamado

**Solução:** Integrar no fluxo de sincronização

### 3. Tabelas criadas mas não populadas
- `strava_stats` - Vazia
- `strava_personal_records` - Vazia
- `strava_gear` - Vazia
- `strava_training_zones` - Vazia
- `strava_activities` - Vazia (redundante?)

**Solução:** Implementar população ou remover tabelas não utilizadas

---

## 💡 SUGESTÕES DE MELHORIAS FUTURAS

1. **Analytics Strava**
   - Comparar performance semana a semana
   - Gráficos de evolução
   - Heatmap de atividades

2. **Social Strava**
   - Compartilhar treinos
   - Comparar com amigos
   - Leaderboards

3. **Integração Inteligente**
   - Auto-ajustar plano baseado em PRs do Strava
   - Detectar overtraining via stats do Strava
   - Sugerir corridas com base em eventos do Strava

4. **Challenges**
   - Desafios mensais
   - Badges por conquistas
   - Gamification

---

## 🎯 CONCLUSÃO

**Situação Atual:**
- ✅ Core Strava (OAuth + Importação) FUNCIONA
- ⚠️ Funcionalidades avançadas EXISTEM mas NÃO ESTÃO ATIVAS
- ❌ UI para dados avançados NÃO EXISTE

**Próximos Passos Recomendados:**
1. **URGENTE:** Corrigir `/api/athlete-stats`
2. **FASE 1:** Ativar Stats + PRs (maior valor com menor esforço)
3. **FASE 2:** Implementar Gear tracking
4. **FASE 3:** Melhorar UX geral

**Estimativa de Esforço:**
- Fase 1 (Stats + PRs): 4-6 horas
- Fase 2 (Gear): 6-8 horas  
- Fase 3 (Zonas): 4-6 horas
- Melhorias UX: 8-10 horas

**TOTAL:** ~25-30 horas de desenvolvimento

---

**Documento criado por:** GitHub Copilot CLI  
**Data:** 2025-11-20  
**Versão:** 1.0
