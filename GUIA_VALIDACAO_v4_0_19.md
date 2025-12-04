# ✅ Guia Rápido de Validação - v4.0.19

## 🎯 Objetivo
Validar 4 correções implementadas no Athera Flex

---

## ⏱️ Tempo Total: 10 minutos

**1. Aguardar Deploy (2-3 min)**
**2. Teste Domingo (3 min)**
**3. Teste Sábado (2 min)**
**4. Teste Modal (2 min)**

---

## 🚀 1. Aguardar Deploy Vercel (2-3 min)

**URL:** https://vercel.com/dashboard

**Verificar:**
- ✅ Build iniciado automaticamente
- ✅ Status: "Building..."
- ✅ Logs sem erros
- ✅ Deploy successful

**Tempo:** ~2-3 minutos após push

---

## 📅 2. Teste Domingo - Treino Substituído (3 min)

**URL:** https://atherarun.com/plano

**Semana:** 30/11 - 06/12  
**Dia:** Domingo 30/11

### Checklist Visual

**Badge Superior:**
- [ ] Verde "✓ Concluído" visível
- [ ] Badge secundário "Executado no sábado 29/11"
- [ ] OU badge "Executado em 29/11/2025"

**Botão de Ação:**
- [ ] Botão "Desfazer" visível
- [ ] Ícone de desfazer presente
- [ ] Hover funciona (cor muda)

**Detalhes do Treino:**
- [ ] Título visível (ex: "Longão Regenerativo")
- [ ] Distância visível (ex: "20km")
- [ ] Pace visível (se houver)

### Se Falhar
- Abrir DevTools (F12)
- Verificar Console (erros React?)
- Verificar Network (API weeks retornou dados?)
- Copiar erro e reportar

---

## 🏃 3. Teste Sábado - Treino Executado (2 min)

**URL:** https://atherarun.com/plano

**Semana:** 30/11 - 06/12  
**Dia:** Sábado 29/11

### Checklist Visual

**Card Principal:**
- [ ] Card AZUL (não cinza!)
- [ ] Texto "16.2km executados" OU "16km executados"
- [ ] Card expandido (não colapsado)

**Dados do Strava:**
- [ ] Pace visível (ex: "5:30/km")
- [ ] Duração visível (ex: "1h30min")
- [ ] FC visível (se disponível)
- [ ] Calorias visíveis (se disponível)

**Badge de Substituição:**
- [ ] Badge "Substituiu treino de domingo"
- [ ] OU "Este treino substituiu: Longão..."

### Se Falhar
- Verificar se `week.orphanWorkouts` existe na resposta API
- Verificar console do browser
- Reportar qual dado está faltando

---

## 🔍 4. Teste Modal - Filtro Correto (2 min)

**URL:** https://atherarun.com/plano

**Semana:** Qualquer  
**Ação:** Clicar em treino NÃO feito

### Checklist Modal

**Abrir Modal:**
- [ ] Clicar em qualquer treino não concluído
- [ ] Modal "Marcar como Executado" abre
- [ ] Lista de corridas aparece

**Verificar Lista:**
- [ ] Corrida de 16km (ID 1230, sábado 29/11) **NÃO** aparece
- [ ] Só mostra corridas ainda não vinculadas
- [ ] Cada corrida tem: data, distância, pace

**Fechar Modal:**
- [ ] Clicar "X" ou fora do modal
- [ ] Modal fecha corretamente

### Se Falhar
- Abrir Network tab no DevTools
- Filtrar por "completed-runs"
- Verificar resposta da API
- Reportar se corrida 1230 apareceu

---

## ✅ Resultado Esperado

### Cenário Ideal (100% Funcionando)
```
✅ Domingo: Badge "Executado em..." + Botão "Desfazer"
✅ Sábado: Card azul + Dados completos do Strava
✅ Modal: Corrida 1230 não aparece
```

### Progresso: 95% → 100%

---

## 🐛 Se Algo Falhar

### Problema 1: Domingo sem badge
**Investigar:**
```javascript
// No browser console
const workout = document.querySelector('[data-workout-id="18229"]');
console.log(workout.dataset);
```

**Verificar:**
- API retornou `executedWorkoutId`?
- API retornou `wasSubstitution: true`?

### Problema 2: Sábado cinza
**Investigar:**
```javascript
// No browser console
fetch('/api/plan/[planId]/weeks')
  .then(r => r.json())
  .then(d => console.log(d.weeks[0].orphanWorkouts));
```

**Verificar:**
- API retornou `orphanWorkouts[]`?
- Array contém treino do sábado?

### Problema 3: Modal mostra 1230
**Investigar:**
```javascript
// No browser console
fetch('/api/workouts/completed-runs?days=7')
  .then(r => r.json())
  .then(d => console.log(d.workouts));
```

**Verificar:**
- Array contém ID 1230?
- Se sim: filtro `customWorkout: null` não está funcionando

---

## 📊 Relatório Final

### Template de Resposta

**Status Geral:** [✅ OK / ⚠️ Parcial / ❌ Falhou]

**Teste 1 - Domingo:**
- Badge "Executado em...": [✅ / ❌]
- Botão "Desfazer": [✅ / ❌]
- Detalhes treino: [✅ / ❌]

**Teste 2 - Sábado:**
- Card azul: [✅ / ❌]
- Dados Strava: [✅ / ❌]
- Badge substituição: [✅ / ❌]

**Teste 3 - Modal:**
- Filtro correto: [✅ / ❌]
- Corrida 1230 ausente: [✅ / ❌]

**Observações:**
[Escrever aqui qualquer problema encontrado]

**Prints:**
[Anexar screenshots se possível]

---

## 🎯 Próximos Passos

### Se 100% OK (melhor cenário)
1. ✅ Marcar versão v4.0.19 como ESTÁVEL
2. ✅ Atualizar CONTEXTO.md com status 100%
3. ✅ Criar tag Git `v4.0.19`
4. ✅ Fechar issue do Athera Flex v5.0.0

### Se Falhas Encontradas (precisar correção)
1. 🔍 Debug conforme guia acima
2. 🛠️ Corrigir frontend se necessário
3. 🔄 Novo commit + push
4. 🧪 Validar novamente

---

**Guia criado:** 04/DEZ/2025 21:05 UTC  
**Versão testada:** v4.0.19  
**Deploy esperado:** 21:08 UTC  
**Validação deve iniciar:** 21:10 UTC
