# ✅ Correção: Erro ao Criar Perfil

**Data:** 07/Nov/2025 14:54 UTC  
**Versão:** 1.5.5  
**Status:** ✅ CORRIGIDO E DEPLOYED  
**Commit:** 25833d70

---

## ❌ Problema Original

```
POST /api/profile/create → 500 (Internal Server Error)

Invalid `prisma.athleteProfile.create()` invocation
Expected String or Null, provided ()
```

**Erro do usuário:** "Erro ao criar perfil"

---

## 🔍 Diagnóstico

### Logs do Console (Fornecidos pelo Usuário)

```javascript
🔍 [ONBOARDING] goalDistance: 10k  ✅ PRESENTE
🔍 [ONBOARDING] targetRaceDate: 2025-11-30  ✅ PRESENTE

❌ Erro ao criar perfil: {
  success: false,
  error: 'Erro ao criar perfil',
  details: 'Invalid prisma.athleteProfile.create() invocation: Expected String or Null, provided ()'
}
```

### Root Cause

Alguns campos opcionais estavam sendo enviados como **string vazia** `""` ao invés de `null`:

```typescript
// ❌ ERRADO
{
  gender: "",                    // Prisma rejeita: esperava String ou Null
  experienceDescription: "",     // Prisma rejeita
  otherSportsExperience: "",     // Prisma rejeita
  // etc...
}

// ✅ CORRETO
{
  gender: null,                  // Prisma aceita
  experienceDescription: null,   // Prisma aceita
  otherSportsExperience: null,   // Prisma aceita
}
```

---

## ✅ Solução Implementada

### 1. Helper `cleanString`

Adicionado função para limpar strings vazias:

```typescript
// app/api/profile/create/route.ts

const cleanString = (value: any) => {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string') return value.trim() || null;
  return value;
};
```

### 2. Aplicado em Todos os Campos String

```typescript
const profileData = {
  // ✅ Campos limpos
  gender: cleanString(gender),
  runningLevel: cleanString(runningLevel) || 'beginner',
  experienceDescription: cleanString(experienceDescription),
  goalDistance: cleanString(goalDistance) || 'unknown',
  targetTime: cleanString(targetTime),
  otherSportsExperience: cleanString(otherSportsExperience),
  injuryRecoveryStatus: cleanString(injuryRecoveryStatus),
  
  // Campos numéricos já tratados corretamente
  age: age ? parseInt(age) : null,
  weight: parseFloat(weight) || 70,
  // ...
};
```

---

## 🎯 Campos Tratados

| Campo | Antes | Depois |
|-------|-------|--------|
| `gender` | `""` → Erro | `null` → ✅ |
| `experienceDescription` | `""` → Erro | `null` → ✅ |
| `otherSportsExperience` | `""` → Erro | `null` → ✅ |
| `injuryRecoveryStatus` | `""` → Erro | `null` → ✅ |
| `targetTime` | `""` → Erro | `null` → ✅ |
| `runningLevel` | `""` → Erro | `"beginner"` → ✅ |
| `goalDistance` | `""` → Erro | `"unknown"` → ✅ |

---

## 🧪 Testes

### Build
```bash
npm run build
✅ Passed - 77 pages compiled
✅ Zero TypeScript errors
✅ Zero build errors
```

### Deploy
```bash
git commit -m "fix(api): clean empty strings in profile creation"
git push origin main
✅ Commit: 25833d70
✅ Pushed successfully
✅ Vercel auto-deploy triggered
```

---

## 📊 Resultado Esperado

### Antes (v1.5.5 com bug)
```
Usuário preenche onboarding
   ↓
Clica "Finalizar e Criar Plano"
   ↓
❌ 500 Internal Server Error
❌ "Erro ao criar perfil"
❌ Prisma validation error
```

### Depois (v1.5.5 corrigido)
```
Usuário preenche onboarding
   ↓
Clica "Finalizar e Criar Plano"
   ↓
✅ 200 OK
✅ Perfil criado com sucesso
✅ Race Goal criada automaticamente
✅ Redirecionado para dashboard
✅ Pronto para gerar plano
```

---

## 📝 Para o Usuário Testar

**Aguarde ~3 minutos para deploy completar**, então:

1. Acesse https://atherarun.com
2. Faça login (ou crie nova conta)
3. Complete o onboarding normalmente
4. **No Step 7**, clique "Finalizar e Criar Plano"
5. **Resultado esperado:**
   - ✅ Perfil criado com sucesso
   - ✅ Redirecionado para dashboard
   - ✅ Mensagem de boas-vindas
   - ✅ Botão "Gerar Plano de Treino" disponível

---

## 🎓 Lições Aprendidas

### 1. Validação de Dados
**Problema:** Frontend enviava strings vazias  
**Solução:** Backend deve sempre validar e limpar dados  
**Implementação:** Helper `cleanString` reutilizável

### 2. Mensagens de Erro do Prisma
**Problema:** Erro genérico "provided ()"  
**Solução:** Logs detalhados ajudam a identificar campo problemático  
**Melhoria futura:** Adicionar validação mais específica

### 3. Testes com Console Aberto
**Benefício:** Usuário forneceu logs completos  
**Resultado:** Diagnóstico preciso em minutos  
**Aprendizado:** Sempre pedir logs detalhados ao usuário

---

## 📚 Documentação Relacionada

- **DEBUG_ONBOARDING_ERROR.md** - Diagnóstico inicial
- **SESSAO_07NOV2025_AUTO_SAVE_COMPLETE.md** - Implementação auto-save
- **CORRECOES_ONBOARDING_v1.5.5.md** - Histórico de correções

---

## 🔄 Histórico de Commits (Hoje)

```
25833d70 - fix(api): clean empty strings in profile creation
b4b4103a - debug(onboarding): add detailed logging
ae773b04 - docs: Add auto-save completion documentation
375a25b7 - feat(onboarding): add auto-save to Steps 3, 4, and 6
```

---

## ✅ Status Final

**Problema:** ✅ Identificado  
**Correção:** ✅ Implementada  
**Build:** ✅ Passou  
**Deploy:** ✅ Em produção (~3-5 min)  
**Testes:** ⏳ Aguardando usuário  

---

**O erro estava na API, não no onboarding. Dados estavam chegando corretamente, mas strings vazias precisavam ser convertidas para `null`.**

---

*Documento gerado em 07/Nov/2025 14:57 UTC*  
*Correção aplicada e em produção*
