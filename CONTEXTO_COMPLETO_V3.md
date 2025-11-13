# 🎯 CONTEXTO COMPLETO - Athera Run v3.0.1

**Data da Sessão:** 13/NOV/2025  
**Versão Atual:** v3.0.1  
**Status:** ⚠️ Migration pendente no Neon

---

## 📖 HISTÓRIA COMPLETA

### O Que Implementamos (Ontem/Antes)

#### v2.0.0 - Sistema Avançado de Treinos
**Implementado em:** 10/NOV/2025

✅ **13 novos campos** em `custom_workouts`:
- Estrutura em 3 fases: warm-up, main workout, cool-down
- Conteúdo educacional: objetivo, base científica, dicas
- Métricas avançadas: intensidade, RPE, zonas FC, intervalos
- Critérios de sucesso e erros comuns

**Benefícios:**
- Treinos não são mais apenas "corra X km"
- Cada treino tem contexto científico
- Atleta aprende enquanto treina
- Melhor aderência ao plano

#### v3.0.0 - Perfil Multi-Dimensional
**Implementado em:** 13/NOV/2025 (hoje)

✅ **8 novos campos** em `athlete_profiles`:
- `hasRunBefore` - Distingue iniciante absoluto (**CRÍTICO**)
- `currentlyInjured` - Flag rápido lesão ativa
- `avgSleepHours` - Recuperação e fadiga
- `tracksMenstrualCycle` - Adaptação feminina (opcional)
- `avgCycleLength` + `lastPeriodDate` - Fases hormonais
- `workDemand` - Demanda física do trabalho
- `familyDemand` - Responsabilidades extras

**Benefícios:**
- IA personaliza treinos com muito mais precisão
- Iniciantes absolutos têm progressão segura (começam caminhando)
- Considera ciclo de recuperação completo
- Previne overtraining e lesões

---

## 🚨 PROBLEMA ATUAL

### Erro em Produção (Neon)
```
PrismaClientKnownRequestError: 
Invalid `prisma.user.findUnique()` invocation:

The column `custom_workouts.warmUpStructure` does not exist in the current database.
```

**Por quê?**
- ✅ Código está correto e deployado no Vercel
- ✅ Schema `prisma/schema.prisma` está atualizado
- ✅ Migrations existem localmente (`prisma/migrations/`)
- ❌ **MAS** banco Neon (produção) está desatualizado

**Impacto:**
- ❌ Geração de planos não funciona
- ❌ API `/api/plan/generate` retorna 500
- ❌ Usuários não conseguem criar planos

---

## ✅ SOLUÇÃO CRIADA

### Arquivos Preparados (Hoje)

| Arquivo | Finalidade | Status |
|---------|------------|--------|
| `NEON_MIGRATION_GUIDE.md` | Guia visual passo-a-passo | ✅ Criado |
| `prisma/APPLY_MIGRATIONS_NEON.sql` | SQL consolidado v2+v3 | ✅ Criado |
| `prisma/VERIFY_MIGRATIONS_NEON.sql` | Validação automática | ✅ Criado |
| `MIGRATION_EXECUTIVE_SUMMARY.md` | Resumo executivo | ✅ Criado |
| `CHANGELOG.md` | v3.0.1 documentado | ✅ Atualizado |

### O Que Você Precisa Fazer (5 Minutos)

1. **Acessar Neon Console**
   ```
   URL: https://console.neon.tech/
   Projeto: Athera Run
   Aba: SQL Editor
   ```

2. **Executar Migration**
   - Copiar conteúdo de `prisma/APPLY_MIGRATIONS_NEON.sql`
   - Colar no SQL Editor (bloco `BEGIN...COMMIT`)
   - Clicar "Run"
   - Aguardar ✅ (< 5 segundos)

3. **Validar**
   - Executar queries de verificação
   - Resultado esperado: `13, 8, 3` (colunas v2, v3, índices)

4. **Testar**
   - Criar novo plano no frontend
   - Verificar que funciona sem erro 500

---

## 🎯 JORNADA COMPLETA DO ATHERA RUN

### Versões Anteriores (Contexto)

#### v1.0.0 - Base
- Sistema de planos básico
- Integração Strava
- Perfil de atleta simples

#### v1.4.0 - Atividades Customizadas
- `trainingSchedule` - Estrutura por dia da semana
- Suporte a múltiplas atividades (musculação, natação, etc)
- Dias de descanso personalizados

#### v1.5.0 - Periodização
- Classificação ABC de corridas
- Sistema de taper automático
- Validação de estratégias

#### v1.6.0 - IA Melhorada
- OpenAI para geração de planos
- Prompt engineering avançado
- Cache de estratégias

---

### Versões Atuais (Ontem/Hoje)

#### v2.0.0 - Sistema Avançado de Treinos
**Mudança de Paradigma:**
- ❌ Antes: Treinos genéricos "Corra 10km"
- ✅ Agora: Treinos educacionais estruturados

**Exemplo de Treino v2.0.0:**
```json
{
  "title": "Treino de Limiar - 8km",
  "warmUpStructure": {
    "duration": 15,
    "steps": [
      "5min caminhada leve",
      "5min trote suave",
      "4x 30s acelerações progressivas"
    ]
  },
  "mainWorkoutStruct": {
    "type": "threshold",
    "intervals": [
      { "duration": "3x 10min", "pace": "4:30/km", "rest": "2min" }
    ]
  },
  "coolDownStructure": {
    "duration": 10,
    "steps": ["5min trote leve", "5min caminhada"]
  },
  "objective": "Aumentar limiar anaeróbico e capacidade de sustentar ritmo forte",
  "scientificBasis": "Treino de limiar (85-90% FCMax) melhora eficiência do lactato...",
  "tips": [
    "Mantenha ritmo consistente nos intervalos",
    "Se não tem monitor FC, use RPE 7-8",
    "Hidrate-se antes e durante"
  ],
  "commonMistakes": [
    "Começar muito rápido no aquecimento",
    "Não respeitar o descanso entre intervalos"
  ],
  "intensityLevel": 4,
  "expectedRPE": 8
}
```

**Impacto:**
- 🎓 Atleta aprende enquanto treina
- 📈 Melhor aderência (entende o "por quê")
- 🔬 Base científica gera confiança
- 💪 Execução mais correta → menos lesões

#### v3.0.0 - Perfil Multi-Dimensional
**Mudança de Paradigma:**
- ❌ Antes: IA só sabia nível + distância meta
- ✅ Agora: IA considera contexto completo de vida

**Casos de Uso Reais:**

1. **Maria - Iniciante Absoluta** 🚶‍♀️
   ```json
   {
     "hasRunBefore": false,
     "avgSleepHours": 6.5,
     "workDemand": "sedentary",
     "familyDemand": "high"
   }
   ```
   **Plano gerado:**
   - Começa com caminhadas (não corrida!)
   - Progressão mais lenta (12-16 semanas para 5k)
   - Mais dias de descanso (3x/semana inicialmente)
   - Treinos curtos (20-30 min) respeitando rotina familiar

2. **João - Corredor Lesionado** 🩹
   ```json
   {
     "hasRunBefore": true,
     "currentlyInjured": true,
     "injuryDetails": { "type": "tendinite", "location": "aquiles" },
     "runningLevel": "intermediate"
   }
   ```
   **Plano gerado:**
   - Fase inicial com cross-training (natação, bike)
   - Volume reduzido (50% do usual)
   - Sem treinos de velocidade nas primeiras 4 semanas
   - Foco em fortalecimento e mobilidade

3. **Ana - Ciclo Menstrual** 🔄
   ```json
   {
     "tracksMenstrualCycle": true,
     "avgCycleLength": 28,
     "lastPeriodDate": "2025-11-01"
   }
   ```
   **Adaptações:**
   - Semana 1-2 (folicular): Treinos intensos
   - Semana 3 (ovulação): Pico de performance
   - Semana 4 (luteal): Volume mantido, intensidade reduzida
   - Durante período: Treinos leves opcionais

4. **Carlos - Trabalho Pesado** 💼
   ```json
   {
     "workDemand": "physical",
     "avgSleepHours": 7.0,
     "runningLevel": "advanced"
   }
   ```
   **Ajustes:**
   - Treinos de qualidade em dias de menor demanda trabalho
   - Longões no fim de semana (mais descanso após trabalho)
   - Volume controlado (não soma carga trabalho + treino demais)
   - Mais ênfase em recuperação ativa

**Impacto:**
- 🎯 Personalização de VERDADE (não genérico)
- 🛡️ Prevenção de overtraining
- 📊 Considera contexto completo de vida
- 🧠 IA toma decisões mais inteligentes

---

## 📊 MUDANÇAS NO BANCO DE DADOS

### Resumo Consolidado

| Tabela | Colunas Adicionadas | Versão |
|--------|---------------------|--------|
| `custom_workouts` | 13 | v2.0.0 |
| `athlete_profiles` | 8 | v3.0.0 |
| **TOTAL** | **21** | **v2+v3** |

### Detalhamento Técnico

#### custom_workouts (+13 colunas)
```sql
-- Estrutura
warmUpStructure      JSONB    -- Aquecimento fase 1
mainWorkoutStruct    JSONB    -- Principal fase 2
coolDownStructure    JSONB    -- Desaquecimento fase 3

-- Educacional
objective            TEXT     -- Objetivo fisiológico
scientificBasis      TEXT     -- Fundamento científico
tips                 JSONB    -- Dicas práticas
commonMistakes       JSONB    -- Erros comuns
successCriteria      JSONB    -- Critérios sucesso

-- Métricas
intensityLevel       INTEGER  -- 1-5 (leve → intenso)
expectedRPE          INTEGER  -- 1-10 (RPE esperado)
heartRateZones       JSONB    -- Zonas FC por fase
intervals            JSONB    -- Estrutura intervalos
expectedDuration     INTEGER  -- Duração total (min)
```

#### athlete_profiles (+8 colunas)
```sql
hasRunBefore         BOOLEAN  -- CRÍTICO: iniciante absoluto
currentlyInjured     BOOLEAN  -- Flag lesão ativa
avgSleepHours        FLOAT    -- Horas sono/noite
tracksMenstrualCycle BOOLEAN  -- Tracking ciclo (women)
avgCycleLength       INTEGER  -- Duração ciclo (dias)
lastPeriodDate       TIMESTAMP -- Última menstruação
workDemand           TEXT     -- sedentary/moderate/physical
familyDemand         TEXT     -- low/moderate/high
```

---

## 🔄 FLUXO COMPLETO DO SISTEMA

### Como Funciona Agora (v3.0.0)

```
1. ONBOARDING
   ↓
   - Usuário preenche perfil completo
   - v3.0.0 coleta: hasRunBefore, sono, lesões, ciclo, etc
   ↓
2. GERAÇÃO DE ESTRATÉGIA (IA)
   ↓
   - OpenAI recebe perfil multi-dimensional
   - Prompt v3.0.0 considera TUDO:
     * Nível + experiência + lesões
     * Sono + recuperação
     * Ciclo hormonal (se aplicável)
     * Demanda trabalho/família
   ↓
3. VALIDAÇÃO
   ↓
   - Sistema valida estratégia vs regras críticas
   - Auto-corrige se necessário (ex: taper mínimo)
   ↓
4. EXPANSÃO DE SEMANAS
   ↓
   - Distribui treinos nos dias disponíveis
   - Respeita preferências (longão no domingo, etc)
   ↓
5. ENRIQUECIMENTO (v2.0.0)
   ↓
   - Cada treino recebe estrutura 3 fases
   - Adiciona objetivo, ciência, dicas
   - Calcula intensidade, RPE, zonas FC
   ↓
6. SALVA NO BANCO
   ↓
   - custom_training_plans (plano)
   - custom_weeks (semanas)
   - custom_workouts (treinos com v2.0.0 data)
   ↓
7. FRONTEND RENDERIZA
   ↓
   - Dashboard mostra semana atual
   - Detalhes do treino com abas:
     * Visão Geral
     * Aquecimento
     * Treino Principal
     * Desaquecimento
     * Objetivo & Ciência
     * Dicas
```

---

## 📚 DOCUMENTAÇÃO CRIADA

### Guias de Implementação
- ✅ `ANALYSIS_PLAN_GENERATION.md` (813 linhas) - Análise inicial
- ✅ `DEEP_RESEARCH_TRAINING_SCIENCE.md` (1,387 linhas) - Pesquisa científica
- ✅ `PROMPT_COMPARISON_v2_vs_v3.md` (684 linhas) - Comparação prompts
- ✅ `IMPLEMENTATION_V3_CHECKLIST.md` - Checklist completo v3.0.0

### Guias de Migration (Hoje)
- ✅ `NEON_MIGRATION_GUIDE.md` - Passo-a-passo visual
- ✅ `prisma/APPLY_MIGRATIONS_NEON.sql` - SQL consolidado
- ✅ `prisma/VERIFY_MIGRATIONS_NEON.sql` - Validação automática
- ✅ `MIGRATION_EXECUTIVE_SUMMARY.md` - Resumo executivo

### Changelog
- ✅ `CHANGELOG.md` - v3.0.1 documentado

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Hoje) ⚡
- [ ] **Aplicar migration no Neon** (5 min) ← **VOCÊ FAZ AGORA**
- [ ] Testar geração de plano
- [ ] Validar logs Vercel (sem erro P2022)
- [ ] Confirmar treinos enriquecidos aparecem

### Curto Prazo (Esta Semana) 📅
- [ ] Coletar feedback de usuários reais
- [ ] Criar 3 cenários de teste:
  * Iniciante absoluto (hasRunBefore=false)
  * Intermediário lesionado (currentlyInjured=true)
  * Avançado normal
- [ ] Validar personalização vs casos reais
- [ ] Ajustar prompts se necessário

### Médio Prazo (v3.1.0) 🚀
- [ ] UI para workDemand/familyDemand (Settings)
- [ ] Dashboard: mostrar classificação perfil
- [ ] Adaptive training em tempo real:
  * Ajustar plano baseado em feedbacks
  * Auto-detect fadiga/overtraining
  * Sugerir ajustes de ritmo
- [ ] Wearables integration (Garmin, Polar, Apple Watch)

---

## 🆘 SE ALGO DER ERRADO

### Erro Atual: "column warmUpStructure does not exist"
✅ **RESOLUÇÃO:** Aplicar `prisma/APPLY_MIGRATIONS_NEON.sql` no Neon

### Se migration falhar
```sql
-- 1. Verificar se está no database correto
SELECT current_database();

-- 2. Verificar se tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('custom_workouts', 'athlete_profiles');

-- 3. Se retornar vazio = banco errado ou tabelas deletadas
```

### Se precisar reverter (NÃO RECOMENDADO)
```sql
-- Reverter v3.0.0
ALTER TABLE athlete_profiles 
DROP COLUMN IF EXISTS hasRunBefore,
DROP COLUMN IF EXISTS currentlyInjured,
DROP COLUMN IF EXISTS avgSleepHours,
DROP COLUMN IF EXISTS tracksMenstrualCycle,
DROP COLUMN IF EXISTS avgCycleLength,
DROP COLUMN IF EXISTS lastPeriodDate,
DROP COLUMN IF EXISTS workDemand,
DROP COLUMN IF EXISTS familyDemand;

-- Reverter v2.0.0
ALTER TABLE custom_workouts
DROP COLUMN IF EXISTS warmUpStructure,
DROP COLUMN IF EXISTS mainWorkoutStruct,
DROP COLUMN IF EXISTS coolDownStructure,
-- ... (resto das colunas)
```

---

## 📞 SUPORTE

### Arquivos de Referência Rápida
- **Schema completo:** `prisma/schema.prisma`
- **Migration v2:** `prisma/migrations/20251110_workout_structure_v2_0_0/`
- **Migration v3:** `prisma/migrations/20251113144016_add_v3_profile_fields/`
- **System Prompt:** `src/lib/ai/prompts/strategy-prompt-v3.ts`

### Logs Úteis
```bash
# Ver logs Vercel
# https://vercel.com/[seu-projeto]/logs

# Testar geração local
npm run dev
# Acessar: http://localhost:3000/pt-BR/dashboard
```

---

## ✅ STATUS ATUAL

### Código ✅
- [x] Schema atualizado
- [x] Migrations criadas
- [x] API routes atualizadas
- [x] Frontend pronto
- [x] Prompt v3.0.0 implementado
- [x] Onboarding atualizado

### Banco de Dados ⏳
- [ ] **Migration v2.0.0 aplicada no Neon** ← PENDENTE
- [ ] **Migration v3.0.0 aplicada no Neon** ← PENDENTE

### Deploy ✅
- [x] Vercel build sucesso
- [x] Código em produção
- [x] Prisma Client gerado

---

## 🎉 QUANDO MIGRATION FOR APLICADA

### Você Verá
- ✅ Geração de planos funciona
- ✅ Treinos com estrutura 3 fases
- ✅ Objetivo e base científica em cada treino
- ✅ Dicas e erros comuns
- ✅ Personalização real baseada em perfil completo

### Usuários Verão
- 🎯 Planos personalizados (não genéricos)
- 📚 Conteúdo educacional em cada treino
- 💪 Progressão segura e eficiente
- 🛡️ Prevenção de lesões e overtraining

---

**⚠️ AÇÃO IMEDIATA:**  
👉 **Aplicar `prisma/APPLY_MIGRATIONS_NEON.sql` no Neon Console!**

**Guia Completo:** `NEON_MIGRATION_GUIDE.md`  
**Resumo Executivo:** `MIGRATION_EXECUTIVE_SUMMARY.md`

---

*Última atualização: 13/NOV/2025*  
*Próxima atualização: Após aplicar migration (marcar data/hora)*
