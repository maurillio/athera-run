# ⚡ GUIA RÁPIDO - PRÓXIMA SESSÃO

**Data:** 13/NOV/2025 17:25 UTC  
**Tempo estimado:** 2-3 horas  
**Objetivo:** Implementar v2.5.1 - Personalização Extrema

---

## 🎯 AÇÃO IMEDIATA

### 1️⃣ LEIA ESTES 3 ARQUIVOS (15 minutos):

```
✅ STATUS_ATUAL_COMPLETO_13NOV2025.md
   → Entender estado atual (85% pronto)

✅ SYSTEM_PROMPT_v2.5.1_IMPROVEMENTS.md ⭐⭐⭐
   → Guia completo de implementação (12KB)

✅ PROBLEMAS_IDENTIFICADOS_E_SOLUCOES.md
   → Bugs conhecidos e soluções
```

---

## 2️⃣ ABRA ESTE ARQUIVO (5 minutos):

```bash
code lib/ai-system-prompt-v2.5.ts
```

**Tamanho atual:** 890 linhas  
**O que fazer:** Adicionar seções específicas (ver passo 3)

---

## 3️⃣ ADICIONE ESTAS SEÇÕES (2 horas):

### 🔴 SEÇÃO 1: Protocolo Walk/Run Detalhado
**Onde:** Após linha ~750 (após "DISTRIBUIÇÃO SEMANAL TÍPICA")

**O que adicionar:**
```typescript
### 📋 PROTOCOLO WALK/RUN PARA INICIANTE ABSOLUTO

**CRÍTICO:** Se hasRunBefore = false, OBRIGATÓRIO usar este protocolo!

**SEMANA 1-4: Walk/Run Adaptation**
Semana 1: 3-4x "Walk/Run Iniciante"
  - Estrutura: 10x (1min corrida leve + 2min caminhada) = 30min
  - Aquecimento: 5min caminhada leve
  - Pace corrida: "Confortável, conversação possível"
  - ZERO corrida contínua!
  - Volume total semana: 8-10km

Semana 2: Progressão +30seg corrida
  - 10x (1:30min corrida + 2min caminhada) = 35min
  - Volume: 9-11km

Semana 3: Ratio melhora
  - 10x (2min corrida + 1:30min caminhada) = 35min
  - Volume: 10-12km

Semana 4: Cutback + Teste
  - 8x (2min corrida + 2min caminhada) = 32min
  - Teste: tentar 5min contínuos ao final
  - Volume: 8-10km (-20%)

**SEMANA 5-8: Walk/Run Advanced**
... (copiar de SYSTEM_PROMPT_v2.5.1_IMPROVEMENTS.md)

**SEMANA 9-12: Building Continuous Base**
... (copiar de SYSTEM_PROMPT_v2.5.1_IMPROVEMENTS.md)

**LINGUAGEM:**
"Parabéns por começar! Esta semana é sobre ADAPTAÇÃO. 
Seu corpo está aprendendo a correr. Não tenha pressa!"
```

---

### 🟡 SEÇÃO 2: Progressão CLARA Obrigatória
**Onde:** Após a seção Walk/Run

**O que adicionar:**
```typescript
### ⚡ PROGRESSÃO CLARA - REGRAS OBRIGATÓRIAS

**ERRADO ❌:**
Semana 1: Easy 5km, Easy 6km, Easy 5km, Longão 10km = 26km
Semana 2: Easy 5km, Easy 6km, Easy 5km, Longão 10km = 26km (ZERO progressão!)
Semana 3: Easy 5km, Easy 6km, Easy 5km, Longão 10km = 26km (COPY-PASTE!)

**CORRETO ✅:**
Semana 1: 26km - FOCO: Adaptação inicial
  - Easy 5km, Easy 6km, Easy 5km, Longão 10km
  - "Primeira semana! Foque em terminar, não em pace."

Semana 2: 28km (+8%) - FOCO: Aumentar volume gradual
  - Easy 5km, Easy 6km, Easy 6km, Longão 11km
  - "Volume aumentou 8%. Sinta seu corpo se adaptando."

Semana 3: 29km (+4%) - FOCO: Introduzir variação
  - Easy 5km, Fartlek 6km (pickups leves), Easy 6km, Longão 12km
  - "Hoje experimentamos ritmos variados!"

Semana 4: 22km (-24% Cutback) - FOCO: Recuperação
  - Easy 4km, Easy 5km, Easy 4km, Longão 9km
  - "Semana de recuperação. Corpo está consolidando ganhos."

**REGRAS:**
1. Volume aumenta 5-10% por semana (não mais!)
2. Cutback week a cada 3-4 semanas (-20-30%)
3. Tipo de treinos MUDA semana a semana
4. Foco da semana SEMPRE explicado
5. Linguagem apropriada ao progresso
```

---

### 🟢 SEÇÃO 3: Detalhamento OBRIGATÓRIO
**Onde:** Após seção de Progressão

**O que adicionar:**
```typescript
### 📝 DETALHAMENTO COMPLETO - NÃO NEGOCIÁVEL

**TODOS os workouts DEVEM ter:**

✅ `warmUp`: Aquecimento específico
✅ `mainSet`: Descrição detalhada do principal
✅ `coolDown`: Volta à calma + alongamento
✅ `objective`: POR QUÊ fazer este treino (educação!)
✅ `tips`: 3-5 dicas práticas de execução
✅ `pace`: Pace/intensidade CLARA

**EXEMPLO COMPLETO:**
{
  "title": "Easy Run - 6km",
  "distance": 6,
  "duration": 42,
  "pace": "6:30-7:00/km",
  "intensity": "easy",
  "warmUp": "Não precisa aquecimento específico. Comece devagar nos primeiros 5-10min.",
  "mainSet": "6km em ritmo confortável. Você deve conseguir conversar tranquilamente. Se estiver ofegante, DIMINUA o ritmo. Easy = EASY!",
  "coolDown": "Últimos 5min ainda mais leves + caminhada 3min + alongamento (posterior de coxa, panturrilha, quadríceps - 30seg cada).",
  "objective": "Desenvolver capacidade aeróbica base. Aumentar densidade mitocondrial. Adaptar tendões e ligamentos ao impacto repetitivo. Recovery ativo de treinos mais duros.",
  "tips": [
    "Pare e caminhe se precisar - não tem problema!",
    "Hidrate antes (200-300ml)",
    "Corra em superfície macia se possível",
    "Foque em COMPLETAR, não em pace",
    "Este treino PARECE fácil demais. Confie no processo!"
  ]
}

**NUNCA ENVIE WORKOUT SEM DETALHAMENTO COMPLETO!**
```

---

### 🔵 SEÇÃO 4: Ajustes Especiais - Como Aplicar
**Onde:** Após seção de Detalhamento

**O que adicionar:**
```typescript
### 🛡️ AJUSTES ESPECIAIS - IMPLEMENTAÇÃO

**SE currentlyInjured = true:**
- Volume inicial: 50% do atual (ou 30% se lesão séria)
- ZERO qualidade por 4 semanas
- Progressão: MAX 5%/semana
- Força: 3x/sem (reabilitação + prevenção)
- Cross-training: 2-3x/sem (bike, swim, elíptico)
- Mensagem: "Lesão exige paciência. Vamos com calma."

**SE avgSleepHours < 6:**
- Volume: -20% do ideal
- Qualidade: -30% (menos sessões intensas)
- Recovery extra: +1 dia descanso completo
- Mensagem: "⚠️ CRÍTICO: Sono <6h prejudica recuperação. 
            Priorize dormir bem. Performance começa na cama!"

**SE workDemand = physical + familyDemand = high:**
- Volume: -30% do ideal
- Treinos: Curtos e eficientes (30-45min)
- Estratégia: QUALIDADE > Quantidade
- Foco: Consistência, não volume absurdo
- Mensagem: "Vida real importa. Este plano se ADAPTA a você, 
            não o contrário. Melhor treinar 30min SEMPRE 
            que 90min às vezes."

**SE tracksMenstrualCycle = true:**
- Agendar key workouts: dias 7-14 (fase folicular)
- Dias 1-5: Total flexibilidade, easy runs
- Dias 15-28: Priorizar volume, não intensidade
- Educação: "Seu corpo muda ao longo do mês. 
            Dias 7-14 = PODER! Aproveite para treinos chave.
            Dias 1-5 = Respeite seu corpo."

**SE idade 40-49 (Masters 1):**
- +1 dia recovery (ou cross-train)
- Força: 3x/sem NÃO-NEGOCIÁVEL
- Warm-up: 10-15min sempre
- Cutback: A cada 3 semanas (não 4)
- Mensagem: "Masters precisam trabalhar SMARTER, não HARDER."

**SE idade 50+ (Masters 2/3):**
- Recovery DOBRADO (2 dias/sem mínimo)
- Volume: -15% do equivalente <40 anos
- Força: PRIORIDADE #1
- Mensagem: "Você é inspiração! Treinar aos 50+ = sucesso!"
```

---

## 4️⃣ TESTE COM 5 PERFIS (1 hora):

### Perfil 1: Absolut Beginner
```typescript
{
  hasRunBefore: false,
  age: 35,
  goal: "5k em 12 semanas",
  currentWeeklyKm: 0
}
// ✅ DEVE gerar: Walk/Run semana 1-4
// ✅ DEVE ter: Progressão ultra lenta (5%)
// ✅ DEVE ter: Linguagem encorajadora
```

### Perfil 2: Beginner
```typescript
{
  hasRunBefore: true,
  currentWeeklyKm: 15,
  goal: "10k em 12 semanas"
}
// ✅ DEVE gerar: Easy running only 4 semanas
// ✅ DEVE adicionar: Qualidade semana 5
```

### Perfil 3: Intermediate
```typescript
{
  hasRunBefore: true,
  currentWeeklyKm: 35,
  goal: "10k em 10 semanas"
}
// ✅ DEVE gerar: Volume progressivo + qualidade moderada
```

### Perfil 4: Advanced
```typescript
{
  hasRunBefore: true,
  currentWeeklyKm: 65,
  bestTimes: { "10k": "42:00" },
  goal: "10k sub-40 em 8 semanas"
}
// ✅ DEVE gerar: Alta intensidade desde início
```

### Perfil 5: Special Case
```typescript
{
  hasRunBefore: true,
  currentlyInjured: true,
  avgSleepHours: 5.5,
  workDemand: "physical",
  familyDemand: "high",
  currentWeeklyKm: 30,
  goal: "10k em 12 semanas"
}
// ✅ DEVE gerar: Volume conservador (-50%)
// ✅ DEVE ter: Alertas sobre sono e lesão
```

---

## 5️⃣ COMMIT + DEPLOY (30 minutos):

```bash
# Commit
git add -A
git commit -m "feat(v2.5.1): Implement extreme personalization in AI system prompt

- Added detailed Walk/Run protocol (week-by-week)
- Added mandatory clear progression rules
- Added complete workout detailing requirements
- Added special adjustments implementation guide
- Tested with 5 different profiles
- All plans now truly personalized

Closes: Planos genéricos issue
Closes: Iniciante absoluto issue
Closes: Progressão não-visível issue"

# Push
git push origin main

# Vercel auto-deploy
# Aguardar 2-3 minutos
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após deploy, criar usuários e verificar:

- [ ] Iniciante absoluto recebe Walk/Run semana 1?
- [ ] Volume aumenta ~5-10% (não mais)?
- [ ] Cutback weeks presentes a cada 3-4 semanas?
- [ ] TODOS workouts têm warmUp, objective, tips?
- [ ] Planos VISIVELMENTE diferentes entre perfis?
- [ ] Linguagem apropriada ao nível?
- [ ] Ajustes especiais aplicados (lesão, sono, etc)?
- [ ] Progressão clara fase a fase?

**Se TODOS ✅ → v2.5.1 COMPLETO! 🎉**

---

## 📊 RESULTADO ESPERADO

### ANTES v2.5.0:
```
❌ Planos muito parecidos
❌ Progressão não-clara
❌ Iniciante com corrida contínua dia 1
❌ Treinos básicos sem detalhes
```

### DEPOIS v2.5.1:
```
✅ Planos únicos por perfil
✅ Progressão óbvia semana a semana
✅ Iniciante com Walk/Run gradual
✅ Treinos completamente detalhados
✅ Ajustes especiais aplicados
✅ Linguagem apropriada
```

---

## 🚨 SE ALGO DER ERRADO

### IA não segue instruções?
→ Verificar se prompt está claro e com EXEMPLOS

### Planos ainda genéricos?
→ Adicionar mais EXEMPLOS CONCRETOS no prompt

### Erro de geração?
→ Verificar logs: `/api/plan/create`

### Dúvidas?
→ Ler: `SYSTEM_PROMPT_v2.5.1_IMPROVEMENTS.md`

---

## 💪 VOCÊ CONSEGUE!

**Tempo total:** 3-4 horas  
**Dificuldade:** Média  
**Impacto:** 🔥 ALTO  
**Confiança:** 95% ✅

**Todo o trabalho de PESQUISA e PLANEJAMENTO já foi feito.**  
**Agora é só IMPLEMENTAR seguindo o guia!**

---

**Boa sorte! 🚀**
