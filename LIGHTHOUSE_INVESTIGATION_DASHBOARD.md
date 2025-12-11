# 🔍 Investigação Lighthouse - Dashboard (/pt-BR/dashboard)

**Data:** 11/DEZ/2025  
**Versão:** v5.1.0  
**Scope:** Identificar causas específicas dos problemas de performance

---

## 🎯 Problemas Críticos a Investigar

### 1. LCP 5.1s (Target: < 2.5s) - CRÍTICO ❌

**O que é LCP?**
- Largest Contentful Paint: tempo até o maior elemento visível na tela

**Possíveis causas no Dashboard:**

#### A) Imagem do Logo (Header)
- **Arquivo:** `/components/ui/logo.tsx`
- **Problema identificado:**
  ```tsx
  // ❌ Imagem SEM width/height explícito nas variantes
  <Image
    src="/logo-complete.png"
    alt="Athera Run"
    width={200}
    height={80}
    className={cn('object-contain', sizes.complete)}
    priority
  />
  ```
- **Impacto:** 
  - Imagem logo-complete.png tem 48KB (otimizada)
  - Mas falta `fetchpriority="high"` (já tem `priority`)
  - Pode estar bloqueando renderização

#### B) Cards do Dashboard
- **Arquivo:** `/app/[locale]/dashboard/page.tsx`
- **Problema:** Skeleton loaders podem estar atrasando FCP/LCP
- **Linhas 246-304:** Loading state muito extenso

#### C) Componentes Pesados
- Múltiplos componentes importados:
  - `WorkoutDetails`
  - `DashboardStravaWidget`
  - `AIAnalysisSection`
  - `TrainingChat`
- **Impacto:** Bundle JS grande, parsing demorado

#### D) Fontes Web
- Não há fontes customizadas explícitas no código
- Tailwind usa fontes do sistema
- ✅ Provavelmente NÃO é o problema

**Candidato mais provável:** Logo ou Cards estão sendo o LCP

---

### 2. CLS 0.328 (Target: < 0.1) - CRÍTICO ❌

**O que é CLS?**
- Cumulative Layout Shift: quanto o layout "pula" durante carregamento

**Problemas identificados:**

#### A) Logo SEM dimensões fixas no container
```tsx
// ❌ PROBLEMA: Container usa apenas classes de altura
<div className={cn('relative flex items-center', sizes.container, className)}>
  <Image
    src="/logo-complete.png"
    alt="Athera Run"
    width={200}  // ✅ Image tem width
    height={80}  // ✅ Image tem height
    className={cn('object-contain', sizes.complete)}
    priority
  />
</div>
```
- **Container:** `sizes.md.container = 'h-12'` (só altura, width depende de imagem)
- **Imagem:** ratio desconhecido até carregar
- **Resultado:** Logo "pula" quando carrega

#### B) Cards com Skeleton
```tsx
// Skeleton loaders NÃO reservam espaço exato
<div className="h-10 w-32 bg-slate-200 rounded-lg skeleton" />
```
- Skeleton pode ter altura diferente do conteúdo real
- Quando conteúdo carrega, layout shift

#### C) Strava Widget Dinâmico
```tsx
<DashboardStravaWidget compact={true} />
```
- Carregamento assíncrono de dados do Strava
- Pode causar shift ao exibir dados

#### D) Upcoming Workouts (Linhas 578-680)
- Conteúdo dinâmico que aparece após fetch
- Pode estar causando shift massivo

**Candidatos principais:**
1. Logo (shift pequeno mas em posição crítica - top da página)
2. Upcoming Workouts card (shift grande, conteúdo dinâmico)

---

### 3. Speed Index 6.9s (Target: < 3.4s) - CRÍTICO ❌

**O que é Speed Index?**
- Quão rápido o conteúdo aparece visualmente na tela

**Problemas identificados:**

#### A) Renderização Bloqueada
```tsx
export const dynamic = 'force-dynamic';
```
- Página é 100% dinâmica (não usa SSG)
- Precisa esperar auth + fetch de dados
- **Linhas 136-163:** Múltiplos fetches sequenciais

#### B) Skeleton Extenso
- Skeleton muito detalhado (linhas 246-304)
- Renderiza muitos elementos antes do conteúdo real
- Pode estar atrasando FCP

#### C) JavaScript Pesado
- Múltiplos imports:
  - dayjs + 4 plugins + 3 locales
  - lucide-react (muitos ícones)
  - Componentes complexos
- **Impacto:** Parsing + execução demorados

#### D) CSS Não Otimizado
- Tailwind classes inline
- Possível CSS não-crítico bloqueando renderização

**Candidato principal:** Fetches sequenciais + JS pesado

---

## 🔬 Análise de Componentes Críticos

### Logo Component (`/components/ui/logo.tsx`)

**Problemas:**
1. ❌ Container não tem `width` definido
2. ⚠️ `priority` presente, mas não `fetchpriority="high"`
3. ⚠️ Imagens diferentes para cada variant (não preload unificado)

**Fix recomendado:**
```tsx
// ✅ SOLUÇÃO 1: Container com width fixo
<div className="relative flex items-center h-12 w-48">
  <Image
    src="/logo-complete.png"
    alt="Athera Run"
    width={200}
    height={80}
    className="object-contain"
    priority
    fetchPriority="high"  // 🔥 ADICIONAR
  />
</div>

// ✅ SOLUÇÃO 2: Usar aspect-ratio CSS
<div className="relative flex items-center h-12" style={{ aspectRatio: '200/80' }}>
  ...
</div>
```

### Dashboard Page (`/app/[locale]/dashboard/page.tsx`)

**Problemas:**
1. ❌ Fetches sequenciais (linha 145-162)
2. ❌ Skeleton não reserva espaço exato
3. ❌ Sem preload de dados críticos

**Fix recomendado:**
```tsx
// ✅ SOLUÇÃO: Fetches paralelos
useEffect(() => {
  if (session?.user) {
    Promise.all([
      fetchPlan(),
      syncStravaWorkouts()
    ]);
  }
}, [session]);

// ✅ SOLUÇÃO: Skeleton com dimensões reais
// Medir altura do card real e aplicar no skeleton
<div className="h-[420px]">  // 🔥 Altura exata do card real
  {/* skeleton content */}
</div>
```

---

## 📊 Priorização de Fixes

### 🔥 URGENTE (Maior Impacto)

#### Fix #1: Logo com dimensões fixas
**Impacto no CLS:** -0.15 (redução de 45%)  
**Esforço:** 5 minutos  
**Arquivos:** `components/ui/logo.tsx`

#### Fix #2: Skeleton com alturas exatas
**Impacto no CLS:** -0.10 (redução de 30%)  
**Esforço:** 15 minutos  
**Arquivos:** `app/[locale]/dashboard/page.tsx`

#### Fix #3: Fetches paralelos
**Impacto no Speed Index:** -1.5s (redução de 22%)  
**Esforço:** 5 minutos  
**Arquivos:** `app/[locale]/dashboard/page.tsx`

### 🟡 ALTA PRIORIDADE

#### Fix #4: Preload de logo
**Impacto no LCP:** -0.5s (redução de 10%)  
**Esforço:** 2 minutos  
**Arquivos:** `app/layout.tsx`

#### Fix #5: Code splitting de componentes pesados
**Impacto no Speed Index:** -1.0s (redução de 15%)  
**Esforço:** 30 minutos  
**Arquivos:** Múltiplos

---

## 🎯 Estimativa de Melhoria

### Aplicando Fixes #1, #2, #3, #4:

| Métrica | Atual | Após Fixes | Melhoria |
|---------|-------|------------|----------|
| **LCP** | 5.1s | ~3.5s | -1.6s (-31%) |
| **CLS** | 0.328 | ~0.08 | -0.248 (-76%) |
| **Speed Index** | 6.9s | ~4.4s | -2.5s (-36%) |
| **Performance Score** | 56 | ~75 | +19 pontos |

**Meta Fase 1:** Performance Score 70+ (atingível!)

---

## 📝 Plano de Ação Imediato

### Ordem de Execução (próximos 30 minutos):

1. ✅ **Fix #1:** Logo dimensões fixas (5 min)
2. ✅ **Fix #3:** Fetches paralelos (5 min)
3. ✅ **Fix #4:** Preload logo (2 min)
4. ✅ **Fix #2:** Skeleton heights (15 min)
5. 🧪 **Teste:** Lighthouse local (3 min)

**Total estimado:** ~30 minutos  
**Performance esperada:** 70-75 pontos (+19 vs atual 56)

---

## 🔍 Outras Observações

### Plano Page (`/app/[locale]/plano/page.tsx`)

**Problemas similares:**
- Skeleton sem dimensões fixas (linhas 197-234)
- Logo compartilhado (Header)
- Fetches assíncronos

**Impacto:** Provavelmente mesmos problemas de performance

**Ação:** Aplicar mesmos fixes após validar no Dashboard

---

## ✅ Próximo Passo

**EXECUTAR FIX #1** - Logo com dimensões fixas  
**Arquivo:** `components/ui/logo.tsx`  
**Tempo:** 5 minutos  
**Impacto:** CLS -0.15, base para outros fixes

Executar agora?
