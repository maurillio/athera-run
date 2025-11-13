# 🎯 PRÓXIMOS PASSOS - v3.0.0

**Data:** 13/NOV/2025 17:15 UTC  
**Status v3.0.0:** ✅ 85% COMPLETO - Backend funcional, IA ativa

---

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### Backend (100%)
- ✅ Migration aplicada no Neon
- ✅ Prisma Client gerado com novos campos
- ✅ API salvando todos os campos (create/update)
- ✅ System Prompt v2.5.0 ativo (linha 917 do ai-plan-generator.ts)

### Frontend (80%)
- ✅ Step 2: hasRunBefore (já correu antes?)
- ✅ Step 4: currentlyInjured (lesão ativa?)
- ✅ Step 4: avgSleepHours (horas de sono)
- ✅ Step 4: tracksMenstrualCycle (ciclo menstrual - mulheres)
- ⏸️ Step 4: workDemand (opcional - não implementado)
- ⏸️ Step 4: familyDemand (opcional - não implementado)

---

## 🧪 TESTE IMEDIATO (AGORA)

### 1. Verificar Se Prompt v2.5 Está Ativo

```bash
cd /root/athera-run
grep -n "buildAISystemPromptV25" lib/ai-plan-generator.ts
# Deve retornar: 19:import { buildAISystemPromptV25 } from './ai-system-prompt-v2.5';
#                917:  const systemPrompt = buildAISystemPromptV25(profile);
```

Se não retornar linha 917, precisa corrigir!

---

### 2. Criar Usuário Teste - Iniciante Absoluto

**Acessar:** https://atherarun.com/signup

**Dados:**
```
Email: teste-iniciante-absoluto-v3@teste.com
Senha: Teste123!

Step 1 - Perfil:
- Nome: Teste Iniciante V3
- Idade: 28
- Gênero: Masculino
- Peso: 75kg
- Altura: 175cm

Step 2 - Experiência:
- 🎯 "Você já correu antes?" → NÃO ✅
- Anos correndo: (não aparece pois hasRunBefore=false)
- Km por semana atual: 0
- Maior corrida: 0km
- Outros esportes: Futebol (opcional)

Step 3 - Objetivos:
- Distância: 5km
- Data da prova: +12 semanas (calcular)
- Tempo desejado: (deixar em branco)

Step 4 - Saúde:
- Lesão nos últimos 6 meses? NÃO
- 🎯 Lesão ativa agora? NÃO ✅
- 🎯 Horas de sono/noite: 7h ✅
- (Se mulher: tracking ciclo)
- Frequência cardíaca repouso: (opcional)
- Qualidade sono: 3/5
- Stress: 3/5

Step 5 - Disponibilidade:
- Dias: Segunda, Quarta, Sábado (3x/semana)
- Dia do longão: Sábado
- Atividades extras: Nenhuma

Step 6 - Gerar Plano!
```

---

### 3. Verificar Logs no Vercel

**Acessar:** Vercel Dashboard → atherarun → Functions → Logs

**Procurar por:**
```
[AI PLAN] Profile classification: ABSOLUTE_BEGINNER
[AI PLAN] Special adjustments:
  - hasRunBefore: false → Walk/run protocol
  - currentlyInjured: false
  - avgSleepHours: 7 → normal
  - age: 28 → normal
```

---

### 4. Validar Plano Gerado

**Checklist Iniciante Absoluto:**
```
✅ Semana 1-2: 
   - Treinos devem mencionar "Walk/run"
   - Ex: "1 min corrida / 2 min caminhada x 10 repetições"
   
✅ Volume total semana 1:
   - Deve ser BAIXO: ~6-10km total
   
✅ Sem treinos de qualidade:
   - ZERO intervalos, tempos, fartlek nas primeiras 4-6 semanas
   - Apenas: easy runs + walk/run
   
✅ Progressão gradual:
   - Semana 1: 8km
   - Semana 2: 9km (+12%)
   - Semana 3: 10km (+11%)
   - Semana 4: 8km (recovery)
   
✅ Longão razoável:
   - Semana 1: 3-4km
   - Não deve começar com 10km longão!
   
✅ Mensagens no plano:
   - "Você está iniciando na corrida..."
   - "Protocolo walk/run..."
   - Tom encorajador
```

---

### 5. Teste 2 - Masters com Sono Ruim

**Email:** teste-masters-sono-v3@teste.com

```
Step 1:
- Idade: 52 ✅ (Masters)
- Gênero: Masculino
- Peso: 78kg

Step 2:
- Já correu? SIM
- Anos: 8 anos
- Km/semana: 40km
- Longão: 15km

Step 3:
- Distância: 10km
- Data: +16 semanas

Step 4:
- Lesão ativa? NÃO
- 🎯 Horas sono: 5h ✅ (sono insuficiente)
- Stress: 4/5 (alto)

Step 5:
- Dias: 4x/semana
```

**Validar Plano:**
```
✅ Volume reduzido:
   - Masters 50+: -10%
   - Sono <6h: -15%
   - Total: -25% do volume "normal"
   
✅ Recovery weeks:
   - A cada 2-3 semanas (vs 3-4 normal)
   
✅ Força obrigatória:
   - 2x/semana mínimo
   
✅ Mensagens:
   - "Masters 50+ - ajustes aplicados"
   - "Sono insuficiente detectado - volume reduzido"
   - "Recomendamos melhorar qualidade do sono"
```

---

### 6. Teste 3 - Mulher com Tracking Ciclo

**Email:** teste-ciclo-v3@teste.com

```
Step 1:
- Idade: 30
- Gênero: Feminino ✅
- Peso: 60kg

Step 2:
- Já correu? SIM
- Anos: 3 anos
- Km: 35km/semana
- Longão: 12km

Step 3:
- Distância: 21km
- Data: +20 semanas

Step 4:
- Lesão? NÃO
- Sono: 8h
- 🎯 Tracking ciclo? SIM ✅
- 🎯 Última menstruação: 01/11/2025 ✅
- 🎯 Duração ciclo: 28 dias ✅

Step 5:
- Dias: 5x/semana
```

**Validar Plano:**
```
✅ IA calcula fase do ciclo:
   - Hoje: 13/11/2025
   - Última: 01/11/2025
   - Dia do ciclo: 12
   - Fase: Folicular (ótima para intensidade)
   
✅ Treinos intensos agendados:
   - Dias 7-14 do ciclo (fase folicular)
   - Intervalos, tempos, quality runs
   
✅ Treinos moderados:
   - Dias 15-28 (fase lútea)
   - Foco em volume e técnica
   
✅ Flexibilidade menstrual:
   - Dias 1-5: opção de easy runs
   - Sem cobrar performance
```

---

## 📊 TROUBLESHOOTING

### Problema: Planos ainda genéricos

**Causa 1:** Prompt v2.5 não está ativo
```bash
# Verificar:
cd /root/athera-run
cat lib/ai-plan-generator.ts | grep -A 5 "systemPrompt ="

# Deve mostrar:
const systemPrompt = buildAISystemPromptV25(profile);

# Se mostrar outra coisa:
# Editar linha 917 para usar buildAISystemPromptV25
```

**Causa 2:** Campos não estão sendo enviados
```bash
# Verificar logs API:
# Vercel → Functions → /api/profile/create
# Deve mostrar:
{
  hasRunBefore: false,
  currentlyInjured: false,
  avgSleepHours: 7,
  // ...
}
```

**Causa 3:** Migration não aplicada
```bash
cd /root/athera-run
source .env.local
npx prisma migrate status
# Deve mostrar: No pending migrations

# Se tiver pendente:
npx prisma migrate deploy
```

---

### Problema: Erro ao gerar plano

**Erro comum:** "Column does not exist"
```
Causa: Migration não aplicada no banco
Solução:
cd /root/athera-run
source .env.local
npx prisma generate
npx prisma migrate deploy
```

**Erro:** "hasRunBefore is not defined"
```
Causa: Frontend não está enviando campo
Solução: Verificar Step2SportBackground.tsx linha 64-68
```

---

## 🎯 PRÓXIMOS PASSOS

### Curto Prazo (Hoje)
1. ✅ Testar 3 cenários acima
2. ✅ Verificar logs no Vercel
3. ✅ Validar personalização dos planos
4. ✅ Se funcionar: COMEMORAR! 🎉

### Médio Prazo (Esta Semana)
1. ⏸️ Adicionar workDemand/familyDemand UI (opcional)
2. ⏸️ Melhorar mensagens visuais no plano
3. ⏸️ Dashboard: mostrar classificação do corredor
4. ⏸️ Settings: permitir editar campos v3.0

### Longo Prazo (v3.1.0 futuro)
1. ⏸️ Adaptive training (ajusta em tempo real)
2. ⏸️ Fatigue monitoring
3. ⏸️ Auto-adjust paces baseado em completions
4. ⏸️ Integration com wearables (Garmin, Polar)

---

## 📝 COMANDOS ÚTEIS

```bash
# Ver status das migrations
cd /root/athera-run
source .env.local
npx prisma migrate status

# Aplicar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Verificar prompt ativo
grep -n "buildAISystemPromptV25" lib/ai-plan-generator.ts

# Build local
npm run build

# Deploy Vercel (se tiver CLI)
vercel --prod
```

---

## 🎉 CRITÉRIOS DE SUCESSO

**v3.0.0 está funcionando se:**

✅ Logs mostram:
- "Profile classification: ABSOLUTE_BEGINNER" (para iniciante)
- "Special adjustments: hasRunBefore: false"
- "Walk/run protocol activated"

✅ Planos gerados mostram:
- Iniciante: walk/run primeiras semanas
- Masters: recovery weeks mais frequentes  
- Sono <6h: volume reduzido visível
- Mulheres: treinos ajustados por ciclo

✅ Planos diferentes entre perfis:
- Iniciante absoluto ≠ Intermediário
- Masters ≠ Jovem
- Sono 5h ≠ Sono 9h
- Personalização CLARA

---

## 📚 DOCUMENTAÇÃO COMPLETA

**Leia para detalhes:**
- `V3_0_0_STATUS_IMPLEMENTACAO.md` - Status completo
- `ANALYSIS_PLAN_GENERATION.md` - Análise do problema
- `DEEP_RESEARCH_TRAINING_SCIENCE.md` - Pesquisa 8 metodologias
- `PROMPT_COMPARISON_v2_vs_v3.md` - Comparação prompts
- `CHANGELOG.md` - Histórico de mudanças
- `CONTEXTO.md` - Contexto geral atualizado

---

**🚀 TUDO PRONTO! Agora é só testar!**
