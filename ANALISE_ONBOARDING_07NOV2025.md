# Análise Completa - Problema Onboarding v1.4.0
**Data:** 07/11/2025 12:51 UTC
**Versão Atual:** v1.4.0 (multilíngue)
**Última Versão Funcional:** v1.3.0

## 🔴 PROBLEMA IDENTIFICADO

### 1. Erro Principal
```
Invalid `prisma.athleteProfile.create()` invocation:
Argument `goalDistance` is missing.
```

### 2. Contexto do Erro
- **Local:** `/api/profile/create`
- **Momento:** Ao finalizar onboarding (Step 7)
- **Impacto:** Usuário não consegue completar perfil
- **Status HTTP:** 500

### 3. Dados Enviados pelo Frontend
```javascript
{
  hasProfile: false,
  message: "Por favor, complete seu perfil",
  formData: {
    name: "Teste89",
    email: "teste89@teste.com",
    gender: "",
    age: "",
    weight: "",
    height: "",
    // ... outros campos vazios
    goalDistance: undefined,  // ❌ AUSENTE
    targetRaceDate: undefined, // ❌ AUSENTE
    longRunDay: null,
    trainingActivities: []
  }
}
```

## 📊 ANÁLISE COMPARATIVA

### v1.3.0 (Funcionava)
```typescript
// Step5Goals.tsx tinha todos os campos
goalDistance: string
targetRaceDate: string
targetTime: string

// schema.prisma
goalDistance: String  // OBRIGATÓRIO
```

### v1.4.0 (Atual - Quebrado)
```typescript
// Step5Goals.tsx tem os campos MAS:
// 1. Usuário pode pular sem preencher
// 2. Validação permite continuar vazio
// 3. API requer o campo

// schema.prisma
goalDistance: String?  // OPCIONAL (mudou em v1.5.2)
```

## 🎯 CAUSA RAIZ

### Problema 1: Schema Prisma Inconsistente
```prisma
model AthleteProfile {
  goalDistance String?  // OPCIONAL no schema
  // Mas API trata como obrigatório
}
```

### Problema 2: Validação Fraca no Step5
```typescript
// Step5Goals.tsx - linha 48-59
const handleNext = () => {
  if (!goal) {
    alert(t('selectGoalFirst'));
    return;
  }
  
  // ❌ PROBLEMA: Permite continuar sem goalDistance
  if (goalDistance && !targetRaceDate) {
    if (!confirm(t('confirmNoRaceDate'))) {
      return;
    }
  }
  // Deveria validar: if (!goalDistance) return;
}
```

### Problema 3: API Expect Dados Obrigatórios
```typescript
// /api/profile/create/route.ts - linha 213
profile = await prisma.athleteProfile.create({
  data: {
    userId: session.user.id,
    ...profileData  // goalDistance pode ser undefined
  }
});

// Mas Prisma Client espera string, não undefined
```

## 🔧 SOLUÇÕES PROPOSTAS

### Opção A: Tornar goalDistance Obrigatório (Recomendado)
**Vantagem:** Garante dados completos para geração de plano
**Desvantagem:** Usuário precisa ter uma corrida em mente

```typescript
// 1. Atualizar validação Step5
const handleNext = () => {
  if (!goal) {
    alert(t('selectGoalFirst'));
    return;
  }
  
  // ✅ NOVO: Validar goalDistance obrigatório
  if (!goalDistance) {
    alert('Por favor, selecione a distância da sua corrida alvo');
    return;
  }
  
  if (!targetRaceDate) {
    alert('Por favor, informe a data aproximada da sua prova');
    return;
  }
  
  onUpdate({ ... });
  onNext();
};
```

### Opção B: Permitir Criação Sem Corrida (Progressive)
**Vantagem:** Onboarding mais flexível
**Desvantagem:** Plano não pode ser gerado imediatamente

```typescript
// 1. API: Aceitar goalDistance opcional
const profileData = {
  // ... outros campos
  goalDistance: goalDistance || null,  // Explícito
  targetRaceDate: targetRaceDate ? new Date(targetRaceDate) : null,
};

// 2. Criar RaceGoal apenas se dados fornecidos
if (goalDistance && targetRaceDate) {
  await prisma.raceGoal.create({ ... });
} else {
  // Marcar que precisa completar depois
  profile.hasCustomPlan = false;
}

// 3. Dashboard: Detectar perfil incompleto
if (!profile.goalDistance) {
  showBanner('Complete seu perfil para gerar plano de treino');
}
```

### Opção C: Modo "Quero Começar a Correr" (UX Melhorada)
**Vantagem:** Melhor experiência para iniciantes
**Desvantagem:** Requer mais desenvolvimento

```typescript
// Step5: Adicionar opção especial
const specialGoals = [
  {
    value: 'start_running',
    label: '🏃 Quero começar a correr',
    desc: 'Não tenho corrida específica ainda',
    skipRaceInfo: true  // Flag especial
  },
  // ... outros goals
];

// Se skipRaceInfo: true
if (goal === 'start_running') {
  // Pular seleção de corrida
  // Gerar plano base de condicionamento
  goalDistance = 'base';  // Especial
  targetRaceDate = null;
}
```

## 📝 IMPLEMENTAÇÃO RECOMENDADA

### Fase 1: Fix Imediato (Opção A)
1. Tornar goalDistance **obrigatório** no Step5
2. Validar antes de permitir avançar
3. Manter schema como `String?` para flexibilidade futura

### Fase 2: UX Melhorada (Opção C)
1. Adicionar opção "Começar a correr"
2. Criar fluxo alternativo sem corrida
3. Permitir adicionar corrida depois no dashboard

### Fase 3: Progressive Onboarding (Opção B)
1. Permitir salvar perfil incompleto
2. Dashboard mostra tarefas pendentes
3. Plano só gera quando dados completos

## 🚀 PLANO DE AÇÃO

### AGORA (v1.5.4 - Critical Fix)
- [x] Analisar problema
- [ ] Implementar validação obrigatória Step5
- [ ] Testar fluxo completo
- [ ] Deploy hotfix

### PRÓXIMO (v1.6.0 - UX)
- [ ] Adicionar opção "Começar a correr"
- [ ] Implementar fluxo sem corrida
- [ ] Melhorar mensagens de erro

### FUTURO (v1.7.0 - Progressive)
- [ ] Perfil progressivo
- [ ] Dashboard com tarefas
- [ ] Plano adaptativo

## 🔒 SEGURANÇA - GitGuardian Alert

**Alerta Recebido:** PostgreSQL URI exposta
**Repositório:** maurillio/athera-run
**Data:** 07/11/2025 12:07 UTC

### Ação Necessária
```bash
# 1. Rotacionar credenciais Neon
# 2. Atualizar .env.local
# 3. Verificar .gitignore
# 4. Re-deploy com novas credenciais
```

### .gitignore Atual
```
✅ /.env
✅ /.env.local
✅ /.env.*.local
✅ .env*
✅ Database URLs e configurações sensíveis
```

**Status:** .gitignore está correto, mas credencial já foi exposta.
**Ação:** Rotacionar senha no Neon imediatamente.

## 📚 HISTÓRICO DE MUDANÇAS

### v1.3.0 → v1.4.0 (Multilíngue)
- Implementado sistema i18n
- Refatorado onboarding
- **PROBLEMA:** Validações ficaram mais fracas
- **PROBLEMA:** goalDistance virou opcional sem ajustar lógica

### v1.5.2 (Fix tentativa)
- goalDistance mudado para opcional no schema
- **PROBLEMA:** API não foi ajustada
- **PROBLEMA:** Validações não foram atualizadas

### v1.5.3 (Fix tentativa 2)
- Tentativa de fix com userConnect
- **PROBLEMA:** Não resolveu causa raiz
- **PROBLEMA:** Problema é validação, não schema

## 🎓 LIÇÕES APRENDIDAS

1. **Schema != Validação:** Schema opcional não significa lógica opcional
2. **Teste E2E:** Precisa testar fluxo completo após mudanças
3. **Versionamento:** Mudanças em i18n afetaram lógica de negócio
4. **Documentação:** Cada mudança deve documentar impacto

## 📞 PRÓXIMOS PASSOS

1. ✅ Análise completa finalizada
2. ⏳ Implementar fix validação Step5
3. ⏳ Testar com usuário real
4. ⏳ Rotacionar credenciais Neon
5. ⏳ Deploy v1.5.4
6. ⏳ Atualizar documentação

---

**Nota:** Este documento deve ser mantido no histórico do projeto para referência futura.
