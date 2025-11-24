# 🎯 CONTEXTO v2.8.0 - AI Transparency Complete

**Data:** 24 de Novembro de 2025 - 17:34 UTC  
**Versão:** 2.8.0  
**Status:** ✅ **PRODUÇÃO**  

---

## 📋 ÍNDICE RÁPIDO

1. [Sistema de Transparência de IA](#sistema)
2. [Arquitetura Técnica](#arquitetura)
3. [Componentes](#componentes)
4. [Database Schema](#database)
5. [APIs](#apis)
6. [Cobertura](#cobertura)
7. [Próximos Passos](#proximos)

---

## 🎯 SISTEMA DE TRANSPARÊNCIA DE IA {#sistema}

### Visão Geral

Sistema completo que mostra ao usuário **exatamente** quais campos de seu perfil são usados pela IA ao gerar planos de treino.

### Objetivos Alcançados

✅ **Transparência Total** - Usuário vê o que a IA considera  
✅ **Educação** - Tooltips explicam o porquê de cada campo  
✅ **Motivação** - Gamificação natural (buscar todos os verdes)  
✅ **Compliance** - LGPD/GDPR sobre uso de dados  
✅ **Diferencial** - Feature única no mercado  

---

## 🏗️ ARQUITETURA TÉCNICA {#arquitetura}

### Fluxo Completo

```
┌─────────────────────────────────────────────────────┐
│  1. USUÁRIO PREENCHE PERFIL                         │
│     - 65 campos disponíveis                          │
│     - Cada um com indicador 🧠⚪ (aguardando)        │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  2. GERAÇÃO DO PLANO                                 │
│     - context-builder.ts coleta dados                │
│     - Monta contexto para IA                         │
│     - Envia para OpenAI (gpt-4o)                     │
│     - Recebe plano personalizado                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  3. TRACKING AUTOMÁTICO                              │
│     - AIFieldTracker analisa contexto enviado        │
│     - Identifica quais campos foram usados           │
│     - Chama: POST /api/ai/track-field-usage          │
│     - Salva no banco: ai_field_usage table           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  4. ATUALIZAÇÃO DE UI                                │
│     - Frontend chama: GET /api/ai/field-analysis     │
│     - Recebe status de cada campo                    │
│     - Atualiza semáforos:                            │
│       🟢 Verde = usado                               │
│       🔴 Vermelho = não usado                        │
│     - Mostra tooltips explicativos                   │
└─────────────────────────────────────────────────────┘
```

### Stack Tecnológico

```
Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui
- Lucide React (ícones)

Backend:
- Next.js API Routes
- Prisma ORM
- PostgreSQL 16.9 (Neon)

AI/LLM:
- OpenAI GPT-4o
- Custom System Prompt v3.0.0

Tracking:
- Custom implementation
- PostgreSQL persistence
- Real-time updates
```

---

## 🧩 COMPONENTES {#componentes}

### AIFieldIndicator

**Localização:** `components/ui/ai-field-indicator.tsx`

**Props:**
```typescript
interface AIFieldIndicatorProps {
  fieldName: string;        // Nome do campo (ex: 'age')
  category: FieldCategory;  // Categoria (basic, health, etc)
  status?: 'used' | 'not-used' | 'pending';
  explanation?: string;     // Texto do tooltip
  className?: string;
}
```

**Estados:**

1. **Pending (⚪ Cinza)**
   - Nenhum plano gerado ainda
   - Tooltip: "Aguardando geração do plano"

2. **Used (🟢 Verde)**
   - Campo foi usado pela IA
   - Tooltip: Explicação específica do uso

3. **Not Used (🔴 Vermelho)**
   - Campo não foi necessário
   - Tooltip: Explicação do não uso

**Uso:**
```tsx
<AIFieldIndicator
  fieldName="age"
  category="basic"
  status="used"
  explanation="Sua idade é usada para calcular zonas cardíacas..."
/>
```

### Integração em Componentes

**Padrão de Uso:**

```tsx
// 1. Importar
import { AIFieldIndicator } from '@/components/ui/ai-field-indicator';

// 2. Adicionar ao lado do label
<div className="flex items-center gap-2">
  <Label htmlFor="age">Idade</Label>
  <AIFieldIndicator
    fieldName="age"
    category="basic"
    status={fieldStatus?.age || 'pending'}
  />
</div>

// 3. Input normal
<Input id="age" type="number" {...field} />
```

---

## 💾 DATABASE SCHEMA {#database}

### Tabela: ai_field_usage

```sql
CREATE TABLE ai_field_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_category TEXT NOT NULL,
  was_used BOOLEAN NOT NULL,
  plan_generation_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_field_usage_user_id 
  ON ai_field_usage(user_id);

CREATE INDEX idx_ai_field_usage_field_name 
  ON ai_field_usage(field_name);
```

**Campos:**
- `id` - Chave primária
- `user_id` - Clerk user ID
- `field_name` - Nome do campo (ex: 'age', 'weight')
- `field_category` - Categoria (basic, health, experience, preferences)
- `was_used` - Boolean: true se foi usado, false se não
- `plan_generation_date` - Timestamp da geração

**Índices:**
- Por usuário (queries rápidas)
- Por campo (analytics)

**Exemplo de Dados:**
```
id | user_id  | field_name | field_category | was_used | plan_generation_date
---|----------|------------|----------------|----------|---------------------
1  | user_123 | age        | basic          | true     | 2025-11-24 17:00:00
2  | user_123 | weight     | basic          | true     | 2025-11-24 17:00:00
3  | user_123 | alcohol    | health         | false    | 2025-11-24 17:00:00
```

---

## 🔌 APIs {#apis}

### POST /api/ai/track-field-usage

**Propósito:** Registrar quais campos foram usados na geração

**Request:**
```typescript
{
  userId: string;
  fields: {
    fieldName: string;
    category: string;
    wasUsed: boolean;
  }[];
}
```

**Response:**
```typescript
{
  success: boolean;
  recordsCreated: number;
}
```

**Exemplo:**
```bash
curl -X POST https://atherarun.com/api/ai/track-field-usage \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "fields": [
      {"fieldName": "age", "category": "basic", "wasUsed": true},
      {"fieldName": "weight", "category": "basic", "wasUsed": true}
    ]
  }'
```

### GET /api/ai/field-analysis

**Propósito:** Obter análise de uso dos campos

**Query Params:**
- `userId` (required) - Clerk user ID

**Response:**
```typescript
{
  userId: string;
  lastGeneration: string; // ISO timestamp
  fields: {
    [fieldName: string]: {
      wasUsed: boolean;
      category: string;
      lastUsed: string; // ISO timestamp
    }
  };
  stats: {
    totalFields: number;
    fieldsUsed: number;
    fieldsNotUsed: number;
    usageRate: number; // percentage
  };
}
```

**Exemplo:**
```bash
curl https://atherarun.com/api/ai/field-analysis?userId=user_123
```

**Response:**
```json
{
  "userId": "user_123",
  "lastGeneration": "2025-11-24T17:00:00Z",
  "fields": {
    "age": {
      "wasUsed": true,
      "category": "basic",
      "lastUsed": "2025-11-24T17:00:00Z"
    },
    "weight": {
      "wasUsed": true,
      "category": "basic",
      "lastUsed": "2025-11-24T17:00:00Z"
    }
  },
  "stats": {
    "totalFields": 35,
    "fieldsUsed": 28,
    "fieldsNotUsed": 7,
    "usageRate": 80
  }
}
```

---

## 📊 COBERTURA {#cobertura}

### Por Área (65 campos total)

#### 1. Perfil - 35 campos (53.8%)

**BasicDataTab (5 campos):**
```typescript
✅ age              - Idade
✅ weight           - Peso  
✅ gender           - Gênero
✅ fitnessLevel     - Nível de condicionamento
✅ weeklyMileage    - Quilometragem semanal
```

**HealthTab (10 campos):**
```typescript
✅ heartRateZones   - Zonas cardíacas
✅ injuries         - Lesões
✅ medication       - Medicamentos
✅ sleepHours       - Horas de sono
✅ sleepQuality     - Qualidade do sono
✅ stressLevel      - Nível de estresse
✅ menstrualCycle   - Ciclo menstrual
✅ nutritionHabits  - Hábitos nutricionais
✅ hydrationLevel   - Nível de hidratação
✅ alcoholConsumption - Consumo de álcool
```

**ExperienceTab (10 campos):**
```typescript
✅ currentPace      - Pace atual
✅ longestRun       - Corrida mais longa
✅ weeklyLongRun    - Longão semanal
✅ runningExperience - Experiência em corrida
✅ previousRaces    - Corridas anteriores
✅ trainingBackground - Histórico de treino
✅ comfortablePace  - Pace confortável
✅ currentFitnessLevel - Nível atual
✅ recentWorkouts   - Treinos recentes
✅ preferredWorkouts - Treinos preferidos
```

**PreferencesTab (10 campos):**
```typescript
✅ availabilityDays - Dias disponíveis
✅ longRunDay       - Dia do longão
✅ preferredTime    - Horário preferido
✅ terrainPreference - Preferência de terreno
✅ preferredDuration - Duração preferida
✅ intensity        - Intensidade preferida
✅ crossTraining    - Cross-training
✅ specificGoals    - Objetivos específicos
✅ limitations      - Limitações
✅ notes            - Observações
```

#### 2. Dashboard - 15 campos (23.1%)

**Cards (9 cards):**
```typescript
✅ WeekOverviewCard    - Resumo semanal
✅ WorkoutCard         - Próximo treino
✅ ProgressCard        - Progresso
✅ WeeklyDistanceCard  - Distância semanal
✅ ConsistencyCard     - Consistência
✅ UpcomingRaceCard    - Próxima corrida
✅ ZonesCard           - Zonas de treino
✅ RecoveryCard        - Recuperação
✅ InsightsCard        - Insights da IA
```

**Métricas (6 métricas):**
```typescript
✅ totalDistance       - Distância total
✅ completedWorkouts   - Treinos completados
✅ avgPace             - Pace médio
✅ weekProgress        - Progresso semanal
✅ consistency         - Taxa de consistência
✅ recoveryStatus      - Status de recuperação
```

#### 3. Plano - 10 campos (15.4%)

```typescript
✅ workoutType         - Tipo de treino
✅ duration            - Duração
✅ distance            - Distância
✅ targetPace          - Pace alvo
✅ intervals           - Intervalos
✅ warmup              - Aquecimento
✅ cooldown            - Resfriamento
✅ notes               - Observações
✅ rpeTarget           - RPE alvo
✅ heartRateTarget     - FC alvo
```

#### 4. Onboarding - 5 campos (7.7%)

```typescript
✅ fitnessLevel        - Nível de condicionamento
✅ weeklyMileage       - Quilometragem semanal
✅ comfortablePace     - Pace confortável
✅ runningExperience   - Experiência em corrida
✅ trainingBackground  - Histórico de treino
```

---

## 🚀 PRÓXIMOS PASSOS {#proximos}

### Sugestões para Próximas Sessões

#### 1. Analytics Dashboard (Admin)
```
Objetivo: Painel para ver estatísticas globais

Features:
- Campos mais/menos usados
- Taxa de preenchimento por campo
- Correlação campo X qualidade do plano
- Heatmap de uso
- Tendências ao longo do tempo

Impacto: Insights sobre o comportamento do sistema
Esforço: 2-3 horas
Prioridade: Média
```

#### 2. Gamificação Avançada
```
Objetivo: Engajar usuários a preencher mais

Features:
- Badge "Perfil Completo" (todos verdes)
- XP por campo preenchido
- Ranking entre usuários
- Challenges semanais
- Rewards por completude

Impacto: Aumento de engajamento
Esforço: 4-6 horas
Prioridade: Alta
```

#### 3. Feedback do Usuário
```
Objetivo: Coletar feedback sobre utilidade

Features:
- "Este campo foi útil?" (thumbs up/down)
- Sugestão de campos faltantes
- Rating de qualidade do plano
- Comentários livres

Impacto: Melhoria contínua
Esforço: 2-3 horas
Prioridade: Alta
```

#### 4. A/B Testing
```
Objetivo: Otimizar design dos indicadores

Testes:
- Diferentes cores de semáforo
- Posicionamento dos ícones
- Textos de tooltip
- Animações

Impacto: Melhor conversão
Esforço: 3-4 horas
Prioridade: Baixa
```

#### 5. Exportação de Dados
```
Objetivo: Compliance LGPD/GDPR

Features:
- Exportar histórico de uso
- PDF com análise completa
- Dashboard pessoal de dados
- Relatório de privacidade

Impacto: Compliance legal
Esforço: 2-3 horas
Prioridade: Média
```

---

## 📈 MÉTRICAS DE SUCESSO

### KPIs para Monitorar

```
1. Taxa de Preenchimento
   - % de campos preenchidos por usuário
   - Meta: > 70%

2. Taxa de Uso pela IA
   - % de campos preenchidos que são usados
   - Meta: > 80%

3. Engajamento
   - Tempo gasto no perfil
   - Número de edições
   - Meta: +30% vs baseline

4. Qualidade dos Planos
   - User satisfaction rating
   - Taxa de conclusão de treinos
   - Meta: > 4.5/5 stars

5. Conversão
   - Usuários free → premium
   - Taxa de renovação
   - Meta: +15% vs baseline
```

---

## 🔧 MANUTENÇÃO

### Checklist Regular

**Semanal:**
- [ ] Verificar logs de erro
- [ ] Monitorar performance das APIs
- [ ] Revisar feedback de usuários

**Mensal:**
- [ ] Analisar estatísticas de uso
- [ ] Atualizar tooltips se necessário
- [ ] Otimizar queries pesadas

**Trimestral:**
- [ ] Review completo do sistema
- [ ] A/B tests de melhorias
- [ ] Atualização de documentação

---

## 📞 SUPORTE

### Troubleshooting

**Problema: Semáforos não atualizam**
```
Verificar:
1. API /field-analysis está respondendo?
2. Banco tem dados na tabela ai_field_usage?
3. UserId correto?
4. Cache desatualizado?

Solução:
- Clear cache do browser
- Re-gerar plano
- Verificar logs do Neon
```

**Problema: Todos os campos em vermelho**
```
Verificar:
1. Geração do plano funcionou?
2. Tracking foi executado?
3. POST /track-field-usage foi chamado?

Solução:
- Verificar logs do context-builder
- Verificar logs da API
- Re-gerar plano
```

**Problema: Performance lenta**
```
Verificar:
1. Índices no banco estão ok?
2. Muitos registros antigos?
3. Query N+1?

Solução:
- Limpar dados antigos (> 90 dias)
- Adicionar cache
- Otimizar queries
```

---

## 🎉 CONCLUSÃO

Sistema de Transparência de IA v2.8.0:
- ✅ 100% Implementado
- ✅ 100% Documentado
- ✅ 100% Testado
- ✅ 100% Deployado

**Status:** PRONTO PARA PRODUÇÃO! 🚀

---

**Última revisão:** 24/11/2025 17:34 UTC  
**Próxima revisão:** Quando houver updates significativos  
**Maintainer:** Time Athera Run  

---

_Desenvolvido com precisão e excelência! 🏃‍♂️💨_
