# 🔍 Debug: Erro ao Criar Perfil

**Data:** 07/Nov/2025 14:47 UTC  
**Erro:** "Erro ao criar perfil"  
**Contexto:** Usuário preencheu onboarding mas falhou no submit

---

## 📊 Dados Visíveis no Step 7

Segundo screenshot do usuário, o Step 7 Review mostra:

✅ **Dados exibidos corretamente:**
- 👤 30 anos
- 👨 Masculino  
- ⚖️ 70kg
- 📏 175cm
- ❤️ FC Repouso: 60 bpm
- 🏃‍♂️ Longão de 19km
- 🎯 Completar primeira corrida
- **🏁 Meta: 10km** ← PRESENTE
- **📅 Data da prova: 29/11/2025** ← PRESENTE
- 📅 3 dias de treino por semana
- 😴 Qualidade do sono: 3/5
- 😰 Nível de estresse: 3/5
- Academia / Musculação

---

## ❌ Problema Identificado

A API está rejeitando com erro de campos obrigatórios faltando (`goalDistance` e `targetRaceDate`), MAS esses dados aparecem no Step 7.

**Hipóteses:**

### 1. Problema de Auto-Save ⚠️ MAIS PROVÁVEL
O Step5Goals tem auto-save implementado, mas pode estar acontecendo:
- Auto-save não está executando antes do submit
- Debounce de 500ms não completou
- useEffect não está sendo chamado corretamente

### 2. Problema de Formato de Dados
- `goalDistance` pode estar como "10k" mas API espera "10km"
- `targetRaceDate` pode estar em formato incorreto

### 3. Problema de Estado do Form
- `formData` não está sendo atualizado corretamente
- `onUpdate()` não está sendo chamado

---

## 🔧 Correções Aplicadas

### 1. Logging Detalhado ✅
```typescript
// app/[locale]/onboarding/page.tsx - handleSubmit
console.log('🔍 [ONBOARDING] formData completo:', formData);
console.log('🔍 [ONBOARDING] goalDistance:', formData.goalDistance);
console.log('🔍 [ONBOARDING] targetRaceDate:', formData.targetRaceDate);
```

### 2. Mensagem de Erro Melhorada ✅
```typescript
const missingFields = [];
if (!formData.goalDistance) missingFields.push('Distância da corrida');
if (!formData.targetRaceDate) missingFields.push('Data da prova');

const errorMsg = `Dados incompletos no Step 5. Faltam: ${missingFields.join(', ')}`;
```

---

## 📝 Próximas Ações

### Para o Usuário Testar:
1. **Abrir Console do Navegador** (F12)
2. **Voltar ao Step 5**
3. **Selecionar distância e data novamente**
4. **Aguardar 1 segundo** (para auto-save completar)
5. **Avançar ao Step 7**
6. **Tentar finalizar** e ver logs no console

### Logs Esperados:
```
🔍 [ONBOARDING] formData completo: {goalDistance: "10k", targetRaceDate: "2025-11-29", ...}
🔍 [ONBOARDING] goalDistance: 10k
🔍 [ONBOARDING] targetRaceDate: 2025-11-29
📊 Dados do onboarding: {...}
📡 Resposta da API: {status: 200, data: {...}}
```

Se aparecer:
```
❌ [ONBOARDING] Validação falhou: Dados incompletos no Step 5. Faltam: Distância da corrida, Data da prova
```

Significa que o **auto-save não está funcionando** para Step5.

---

## 🛠️ Correção Potencial Necessária

Se auto-save não está funcionando no Step5, pode ser que o `useEffect` não está sendo executado porque:

1. **Dependências incorretas** no useEffect
2. **onUpdate não está no array de dependências**
3. **Valores iniciais vazios não acionam o effect**

### Solução:
Forçar salvamento no **handleNext** do Step5 (que já existe):

```typescript
// Step5Goals.tsx - handleNext
const handleNext = () => {
  // ... validações ...
  
  const updateData = { 
    primaryGoal: goal, 
    goalDistance: goalDistance,  // ← Garante que é salvo
    targetRaceDate: targetRaceDate,  // ← Garante que é salvo
    targetTime: targetTime || undefined,
    // ...
  };
  
  onUpdate(updateData);  // ← Chama onUpdate explicitamente
  onNext();
};
```

Isso já está implementado, então o problema **não deveria acontecer**.

---

## 🧪 Testes para Validar

### Teste 1: Auto-Save Funciona?
1. Preencher Step5 (distância + data)
2. Esperar 1 segundo
3. Abrir DevTools → Console
4. Digitar: `console.log(formData.goalDistance, formData.targetRaceDate)`
5. **Esperado:** Ver valores (ex: "10k", "2025-11-29")
6. **Se vazio:** Auto-save não está funcionando

### Teste 2: handleNext Funciona?
1. Preencher Step5
2. Clicar "Próximo"
3. Ver console: `📤 Step5Goals - Sending data: {...}`
4. **Esperado:** Ver goalDistance e targetRaceDate no log
5. **Se faltando:** Bug no handleNext

### Teste 3: Dados Chegam na API?
1. Completar onboarding
2. Ver console: `📊 Dados do onboarding: {...}`
3. Verificar se `profilePayload.goalDistance` existe
4. **Se faltando:** Problema no mapeamento do handleSubmit

---

## 🎯 Próxima Iteração (Se Necessário)

Se o problema persistir, precisamos:

1. **Adicionar validação visual** no Step5
   - Mostrar checkmark ✅ quando campos preenchidos
   - Bloquear avanço se vazios

2. **Salvar em LocalStorage** como fallback
   - Garantir persistência mesmo se useEffect falhar

3. **Adicionar botão "Salvar"** explícito no Step5
   - Não depender só de auto-save

---

## 📚 Commits Relacionados

- `b4b4103a` - debug(onboarding): add detailed logging
- `375a25b7` - feat(onboarding): add auto-save to Steps 3, 4, and 6
- `f406fb1c` - fix: Correções críticas onboarding v1.5.5

---

## ⏳ Status

**Deploy:** ✅ Em produção  
**Logs:** ✅ Adicionados  
**Aguardando:** Teste do usuário com console aberto  

---

*Próxima ação: Aguardar feedback do usuário com logs do console*
