# 🚨 Performance Regression Analysis - v5.1.1

**Data:** 11/DEZ/2025 17:14 UTC  
**Status:** ❌ REGRESSÃO DETECTADA  
**Ação:** INVESTIGAÇÃO URGENTE

---

## 📊 Comparação de Métricas

### Resultados ANTES (v5.1.0) vs DEPOIS (v5.1.1)

| Métrica | v5.1.0 (Antes) | v5.1.1 (Depois) | Variação | Status |
|---------|----------------|-----------------|----------|--------|
| **Performance Score** | 56 | **47** | **-9 pts** | 🔴 PIOR |
| **LCP** | 5.1s | **5.3s** | **+0.2s** | 🔴 PIOR |
| **CLS** | 0.328 | **0.35** | **+0.022** | 🔴 PIOR |
| **Speed Index** | 6.9s | **9.1s** | **+2.2s** | 🔴 MUITO PIOR |
| **TBT** | 150ms | **350ms** | **+200ms** | 🔴 MUITO PIOR |

**RESULTADO:** ❌ Todos os KPIs **PIORARAM** ao invés de melhorar!

---

## 🔍 Análise de Causa Raiz

### Warning Detectado no Teste
```json
"runWarnings": [
  "Pode haver dados armazenados afetando o desempenho de carregamento neste local: 
   IndexedDB. Examine esta página em uma janela anônima para evitar que esses recursos 
   afetem suas pontuações."
]
```

**CAUSA PROVÁVEL #1:** **IndexedDB do PWA está impactando o teste!**

### Hipóteses de Regressão

#### 1. IndexedDB/Service Worker (MAIS PROVÁVEL) ⚠️
**Evidências:**
- Warning explícito no Lighthouse sobre IndexedDB
- PWA v5.1.0 adicionou IndexedDB + Service Worker
- Service Worker pode estar interceptando requests
- Cache pode estar desatualizado

**Impacto:**
- Speed Index +2.2s: SW processando requests
- TBT +200ms: Operações IndexedDB bloqueando thread
- LCP +0.2s: Cache delay

**Validação necessária:**
- [ ] Rodar Lighthouse em **janela anônima** (sem SW/IndexedDB)
- [ ] Comparar resultados com/sem PWA

#### 2. Logo com Inline Styles (IMPROVÁVEL)
**Mudança:**
```tsx
// Adicionado inline style
<div style={{ width: '12rem', aspectRatio: '200/80' }}>
```

**Impacto esperado:** Mínimo (apenas CSS inline, não JS)

**Evidência contra:** CLS piorou (+0.022), mas esperávamos melhoria

#### 3. Fetches Paralelos (IMPROVÁVEL)
**Mudança:**
```tsx
Promise.all([fetchPlan(), syncStravaWorkouts()])
```

**Impacto esperado:** Positivo (reduzir tempo)

**Evidência contra:** Speed Index PIOROU massivamente (+2.2s)

#### 4. Preload de Logo (IMPROVÁVEL)
**Mudança:**
```tsx
<link rel="preload" href="/logo-complete.png" ... />
```

**Impacto esperado:** Positivo (LCP melhor)

**Evidência contra:** LCP PIOROU (+0.2s)

#### 5. Cache Inconsistente do Vercel (POSSÍVEL)
**Cenário:** Deploy ainda não propagou completamente
- Edge nodes com cache antigo
- Lighthouse pegou versão não otimizada

**Validação necessária:**
- [ ] Aguardar 5-10 min para propagação completa
- [ ] Limpar cache do Vercel
- [ ] Re-testar

---

## 🎯 Causa Raiz Identificada

### CULPADO: Service Worker do PWA! 🕵️

**Análise:**
1. PWA v5.1.0 adicionou Service Worker + IndexedDB
2. Service Worker intercepta TODOS os requests
3. IndexedDB operations bloqueiam main thread
4. Cache strategies podem estar mal configuradas

**Evidências:**
- Warning explícito do Lighthouse
- TBT subiu 233% (150ms → 350ms) - típico de operações síncronas pesadas
- Speed Index subiu 32% (6.9s → 9.1s) - SW processando

**Arquivos envolvidos:**
- `/public/sw.js` - Service Worker (287 linhas)
- `lib/pwa/indexeddb.ts` - IndexedDB wrapper
- `lib/pwa/sw-register.ts` - SW registration

---

## ✅ Plano de Ação IMEDIATO

### Opção A: Validar se é o PWA (5 min) ⚡

1. **Teste em Janela Anônima:**
   ```
   1. Abrir Chrome em modo anônimo
   2. Acessar https://atherarun.com/pt-BR/dashboard
   3. DevTools → Lighthouse → Run
   4. Comparar scores
   ```

2. **Se scores MELHORAREM em anônima:**
   - ✅ Confirma que PWA está causando regressão
   - Seguir para Opção B

3. **Se scores CONTINUAREM RUINS em anônima:**
   - Problema é nos fixes v5.1.1
   - Seguir para Opção C (rollback)

### Opção B: Otimizar Service Worker (30 min) 🔧

**Se PWA for o culpado:**

#### 1. Desabilitar IndexedDB operations na main thread
```typescript
// lib/pwa/indexeddb.ts
// Mover operações para Web Worker
```

#### 2. Otimizar SW caching strategy
```javascript
// public/sw.js
// Simplificar estratégias, evitar bloqueio
```

#### 3. Lazy register do Service Worker
```typescript
// Registrar SW DEPOIS do FCP
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js');
    }, 2000); // 2s delay
  });
}
```

### Opção C: Rollback Imediato (2 min) 🔄

**Se não for o PWA:**

```bash
git revert 9c52684a  # Reverter v5.1.1
git push origin main
```

**Rollback reverte:**
- Logo inline styles
- Skeleton heights
- Parallel fetches
- Logo preload

---

## 🧪 Testes de Validação

### 1. Teste Básico (Anônima)
- [ ] Lighthouse em janela anônima
- [ ] Performance > 50?
- [ ] Comparar com teste normal

### 2. Teste Sem PWA
- [ ] DevTools → Application → Service Workers → Unregister
- [ ] DevTools → Application → Clear storage
- [ ] Lighthouse novamente
- [ ] Performance melhorou?

### 3. Teste de Propagação
- [ ] Aguardar 10 minutos
- [ ] Limpar cache do browser
- [ ] Lighthouse novamente
- [ ] Performance melhorou?

---

## 📝 Lições Aprendidas

### Erro de Metodologia:

1. ❌ **Não testamos em janela anônima antes**
   - PWA já estava ativo desde v5.1.0
   - Baseline (56) pode estar ERRADO também

2. ❌ **Não consideramos impacto do PWA**
   - Service Worker introduzido em v5.1.0
   - Pode ter sido ele o causador do score 56 original

3. ❌ **Não aguardamos propagação do deploy**
   - Testamos ~3 min após deploy
   - Edge cache pode não ter atualizado

### Correções para Futuro:

1. ✅ **SEMPRE testar em janela anônima**
2. ✅ **Aguardar 5-10 min após deploy**
3. ✅ **Desabilitar PWA para baseline**
4. ✅ **Múltiplos runs do Lighthouse (média de 3)**
5. ✅ **Comparar com/sem PWA**

---

## 🎯 Próximo Passo AGORA

### EXECUTAR: Teste em Janela Anônima

**Comandos:**
1. Abrir Chrome Anônimo
2. https://atherarun.com/pt-BR/dashboard
3. F12 → Lighthouse → Device: Mobile → Run
4. Reportar scores aqui

**Se Performance > 60 em anônima:**
- ✅ PWA é o culpado
- Otimizar Service Worker

**Se Performance < 50 em anônima:**
- ❌ Fixes v5.1.1 são o culpado
- Rollback imediato

---

## 📊 Hipótese Alternativa

### E se o baseline 56 estava ERRADO?

**Cenário:**
- Teste v5.1.0 também tinha PWA ativo
- Score 56 JÁ estava impactado pelo PWA
- Fixes v5.1.1 não causaram regressão
- Apenas revelaram problema existente

**Validação:**
1. Testar v5.1.1 em anônima
2. Se score for ~70-75:
   - ✅ Fixes funcionaram!
   - ❌ PWA é o problema desde v5.1.0

**Ação:**
- Otimizar PWA (não rollback)
- Atualizar documentação

---

**Status:** 🔴 AGUARDANDO TESTE EM ANÔNIMA  
**Urgência:** ⚡ ALTA  
**Tempo estimado:** 5 minutos

**Próxima ação:** Executar Lighthouse em janela anônima AGORA
