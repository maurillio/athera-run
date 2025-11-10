# 🔍 Debug: Detecção de Corridas Alvo no Plano

**Data:** 10/Nov/2025  
**Versão:** v2.0.0-debug  
**Problema:** Corrida alvo não aparece no dia correto do plano (aparece longão no lugar)

## 📋 Mudanças Implementadas

### 1. Logs Adicionados na API (`/api/plan/generate`)

- ✅ Log detalhado antes de chamar `generateAIPlan`
- ✅ Try-catch específico para capturar erro na geração
- ✅ Verificação se corrida alvo está no plano gerado
- ✅ Log de todos os workouts no dia da corrida alvo

### 2. Logs Adicionados no Gerador (`lib/ai-plan-generator.ts`)

- ✅ Log das corridas no perfil recebido pela função
- ✅ Log semana por semana verificando corridas
- ✅ Log detalhado da detecção de corrida em cada semana
- ✅ Log quando corrida é encontrada com todos os detalhes de data

## 🧪 Como Testar

### Passo 1: Criar Novo Usuário

```
Email: teste999999@teste.com
Senha: qualquer
```

### Passo 2: Completar Onboarding

1. Preencher dados básicos
2. Configurar disponibilidade de corrida
3. **IMPORTANTE:** Cadastrar corrida alvo com data específica
4. Finalizar onboarding

### Passo 3: Verificar Logs

Após finalizar o onboarding, o sistema tentará gerar o plano automaticamente.

**No console do navegador (F12):**
- Verificar se há erro 500
- Copiar mensagem de erro completa

**Nos logs do Vercel:**
1. Ir para https://vercel.com/maurilios-projects/athera-run
2. Abrir aba "Logs"
3. Filtrar por `/api/plan/generate`
4. Procurar por:
   - `[AI PLAN] 🚀 generateAIPlan INICIADO`
   - `[AI PLAN] Corridas no perfil recebido: X`
   - `[AI PLAN] Verificando corridas para semana`
   - `[AI PLAN DEBUG] Checando corrida`
   - `[AI PLAN DEBUG] ✅ Corrida encontrada na semana`

## 🔍 O Que Procurar nos Logs

### Logs Esperados (Sucesso)

```
[AI PLAN] 🚀 generateAIPlan INICIADO
[AI PLAN] Corridas no perfil recebido: 1
[AI PLAN]   1. A: "Meia Maratona de São Paulo" (Meia Maratona) em 2025-12-28
[AI PLAN] Verificando corridas para semana 1:
[AI PLAN DEBUG] Checando corrida "Meia Maratona de São Paulo":
  raceDate: 2025-12-28
  weekStart: 2025-11-10
  weekEnd: 2025-11-16
  isInWeek: false
...
[AI PLAN] Verificando corridas para semana 7:
[AI PLAN DEBUG] Checando corrida "Meia Maratona de São Paulo":
  raceDate: 2025-12-28
  weekStart: 2025-12-22
  weekEnd: 2025-12-28
  isInWeek: true
[AI PLAN DEBUG] ✅ Corrida "Meia Maratona de São Paulo" encontrada na semana 7!
[AI PLAN] ✅ Semana 7: Corrida A "Meia Maratona de São Paulo" (Meia Maratona) detectada na semana
[WORKOUT GEN] 🏁 CORRIDA A detectada!
[WORKOUT GEN]   Nome: "Meia Maratona de São Paulo"
[WORKOUT GEN]   Distância: Meia Maratona
[WORKOUT GEN]   Data: 2025-12-28T12:00:00.000Z
[WORKOUT GEN]   Dia da semana: 6 (0=Dom, 1=Seg, ..., 6=Sáb)
[WORKOUT GEN] 🏁 Criando workout de CORRIDA para dia 6
[AI PLAN] ✅ Encontrado workout no dia da corrida: race - 🏁 Meia Maratona de São Paulo - Meia Maratona
```

### Logs de Erro (Problema)

Se a corrida **NÃO** for encontrada:

```
[AI PLAN] Verificando corridas para semana X:
[AI PLAN DEBUG] Checando corrida "Nome da Corrida":
  raceDate: 2025-12-28
  weekStart: 2025-12-22
  weekEnd: 2025-12-28
  isInWeek: false  <-- PROBLEMA!
```

Ou:

```
[AI PLAN] ❌ CRÍTICO: Corrida alvo (2025-12-28) NÃO está no plano gerado!
```

## 🐛 Possíveis Causas do Bug

### 1. Problema de Timezone

- Data da corrida pode estar em UTC e datas do plano em horário local
- Normalização de datas pode estar incorreta

### 2. Problema de Lógica de Semana

- Semana pode não incluir o dia da corrida corretamente
- Cálculo de `weekEnd` pode estar errado

### 3. Corrida Não Salva Corretamente

- `raceGoals` pode estar vazio no momento da geração
- Status da corrida pode não ser 'active' ou 'upcoming'

### 4. Problema na Geração pela IA

- IA pode estar gerando número errado de semanas
- Data de início pode estar incorreta

## 📊 Dados para Análise

Com os logs adicionados, conseguiremos ver:

1. ✅ Quantas corridas o perfil tem
2. ✅ Detalhes de cada corrida (nome, data, prioridade)
3. ✅ Semana por semana: início, fim, e se corrida está nela
4. ✅ Quando a corrida é detectada e em qual semana
5. ✅ Se o workout da corrida é criado corretamente
6. ✅ Se o workout aparece no plano final

## 🎯 Próximos Passos

1. **Você:** Testar com usuário novo e copiar logs completos
2. **Eu:** Analisar logs e identificar exatamente onde falha
3. **Eu:** Implementar correção cirúrgica
4. **Você:** Testar novamente para confirmar correção

---

**Status:** ⏳ Aguardando teste e logs  
**Deploy:** ✅ Concluído - Vercel está atualizando
