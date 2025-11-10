# 🎯 CORREÇÃO CRÍTICA: Race Day Bug - v1.7.5

## ❌ Bug Crítico Identificado e Corrigido

### Sintoma
Corridas cadastradas no onboarding **não apareciam no dia da prova** - o plano mostrava treinos normais (longão, natação, etc.) ao invés do evento de corrida.

### 🔍 Causa Raiz

**INCOMPATIBILIDADE DE STATUS:**

1. **Onboarding** cria race goals com `status: 'upcoming'`
   - Arquivo: `app/api/profile/create/route.ts`, linha 309
   - Código: `status: 'upcoming'`

2. **Gerador de Plano** buscava apenas `status: 'active'`
   - Arquivo: `app/api/plan/generate/route.ts`, linha 128
   - Código: `status: 'active'`

**Resultado:** ❌ Todas as corridas criadas via onboarding eram **IGNORADAS** durante a geração do plano!

## ✅ Solução Implementada

### Alteração no Gerador de Plano

**ANTES:**
```typescript
const raceGoals = await prisma.raceGoal.findMany({
  where: {
    athleteId: profile.id,
    status: 'active'  // ❌ Ignorava 'upcoming'
  }
});
```

**DEPOIS:**
```typescript
const raceGoals = await prisma.raceGoal.findMany({
  where: {
    athleteId: profile.id,
    status: {
      in: ['active', 'upcoming']  // ✅ Inclui ambos
    }
  }
});
```

## 🧪 Casos de Teste

### Teste 1: teste020202@teste.com
- **Corrida:** 10km em 31/12/2025 (Quarta-feira)
- **Status no banco:** `upcoming`
- **Antes:** Natação + Musculação no dia da prova ❌
- **Depois:** Deve mostrar 🏁 Corrida 10km ✅

### Teste 2: teste47474@teste.com
- **Corrida:** 10km em 28/12/2025 (Domingo)
- **Status no banco:** `upcoming`
- **Antes:** Longão no dia da prova ❌
- **Depois:** Deve mostrar 🏁 Corrida 10km ✅

## 📊 Impacto

### Afetados
- **TODOS os usuários** que criaram perfil via onboarding (Step 1-7)
- Todos os planos gerados até agora **ignoraram as corridas alvo**
- Usuários achavam que tinham corridas cadastradas, mas os planos não consideravam

### Não Afetados
- Usuários que criaram race goals manualmente (se usaram status 'active')
- Planos sem corridas alvo

## 🚀 Deploy

- ✅ Commit: `53a74c2e`
- ✅ Push: GitHub → Vercel
- ✅ Versão: v1.7.5
- ✅ Data: 10/11/2025 18:05 UTC

## 📋 Ações Necessárias

### 1. Regenerar Planos Afetados
Todos os usuários que já criaram planos precisam **regenerar** seus planos para que as corridas sejam consideradas.

**Opções:**
- A) Forçar regeneração automática na próxima visita ao dashboard
- B) Mostrar aviso no dashboard: "Nova atualização! Regenere seu plano"
- C) Script para regenerar todos os planos automaticamente

### 2. Validar Correção
Criar novo usuário de teste e verificar:
1. ✅ Race goal criada no onboarding aparece nos logs
2. ✅ Plano gerado inclui race event no dia correto
3. ✅ Dia da corrida NÃO tem treino regular

## 🔍 Logs de Debug

Com os logs implementados na v1.7.4, agora veremos:

```
[AI PLAN] Corridas encontradas: 1
[AI PLAN] Detalhes das corridas:
  - A: Corrida 10km (10k) em 2025-12-28

[AI PLAN] ✅ Chamando generateAIPlan com:
[AI PLAN]   - 1 corridas no perfil
[AI PLAN]     • A: Corrida 10km em 2025-12-28

[AI PLAN] 🚀 generateAIPlan INICIADO
[AI PLAN] Corridas no perfil recebido: 1
[AI PLAN]   1. A: "Corrida 10km" (10k) em 2025-12-28

[AI PLAN DEBUG] Corrida "Corrida 10km" encontrada na semana 7
[AI PLAN] ✅ Semana 7: Corrida A "Corrida 10km" (10k) detectada

[WORKOUT GEN] 🏁 CORRIDA A detectada!
[WORKOUT GEN]   Nome: "Corrida 10km"
[WORKOUT GEN]   Distância: 10k
[WORKOUT GEN]   Data: 2025-12-28T00:00:00.000Z
[WORKOUT GEN]   Dia da semana: 0 (Dom)
[WORKOUT GEN]   ✅ Substituindo treino do dia 0 pela corrida

[WORKOUT GEN] 🏁 Criando workout de CORRIDA
[WORKOUT GEN] ✅ Workout de corrida criado: type=race
[WORKOUT GEN] ✅ CORRIDA(S) ENCONTRADA(S) NA SEMANA 7
```

## 📈 Próximas Melhorias (Opcional)

1. **Unificar Status**
   - Decidir se usar 'active' ou 'upcoming' como padrão
   - Ou criar enum no Prisma: `enum RaceStatus { UPCOMING, ACTIVE, COMPLETED, CANCELLED }`

2. **Migration Script**
   - Atualizar todos os race goals existentes para usar status consistente

3. **Validação no Onboarding**
   - Garantir que status seja sempre o mesmo usado pelo gerador

## ✅ Checklist de Validação

- [x] Bug identificado
- [x] Causa raiz encontrada
- [x] Correção implementada
- [x] Commit criado
- [x] Deploy realizado
- [ ] Teste com novo usuário
- [ ] Validação em produção
- [ ] Planos existentes regenerados

---

**Status:** ✅ CORREÇÃO CRÍTICA APLICADA  
**Prioridade:** 🔴 CRÍTICO - Afeta funcionalidade core  
**Versão:** v1.7.5  
**Commit:** 53a74c2e  
**Data:** 10/11/2025
