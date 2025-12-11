# 📱 ATHERA RUN - PWA MIGRATION MASTER CHECKLIST

**Data Início:** 11 de Dezembro de 2025  
**Versão Atual:** 3.2.10  
**Meta:** PWA instalável em iOS + Android  
**Prazo:** 10 dias (2 semanas)

---

## 📊 DOCUMENTOS PRINCIPAIS

- ✅ **[ANALISE_PROFUNDA_PWA_MIGRATION.md](./ANALISE_PROFUNDA_PWA_MIGRATION.md)** - Análise técnica completa (18KB)
- 📋 **[Este documento]** - Checklist operacional (você está aqui)

---

## 🎯 OVERVIEW RÁPIDO

### Estado Atual (100% mapeado)
```
✅ 21 páginas Next.js App Router
✅ 130+ componentes React + Shadcn UI
✅ 130+ APIs REST endpoints
✅ 50+ libs de lógica de negócio
✅ 6 hooks customizados
✅ Prisma ORM + Neon PostgreSQL
✅ NextAuth + Zustand + React Query
✅ TailwindCSS + Design system completo
✅ 470+ documentos markdown (histórico)
✅ 2.5MB de assets (/public/)
✅ Manifest básico existe (precisa correção)
✅ Icons PWA prontos (192px, 512px, apple-touch)
❌ Service Worker NÃO existe
❌ Offline support NÃO implementado
```

---

## 🔍 INVENTÁRIO COMPLETO (Zero Pontas Soltas)

### **1. FRONTEND (App Router Next.js 14)**

#### Páginas (21 totais)
```
□ / - Landing page (home)
□ /dashboard - Dashboard principal ⭐ CRÍTICO PWA
□ /plano - Visualização completa do plano ⭐ CRÍTICO PWA
□ /perfil - Perfil atleta (6 abas) ⭐ CRÍTICO PWA
□ /onboarding - Cadastro (7 steps)
□ /login - Autenticação
□ /signup - Cadastro
□ /tracking - Acompanhamento treinos
□ /chat - Treinador virtual IA
□ /calculator - VDOT + Nutrição
□ /athera-flex - IA adaptativa
□ /subscription - Gerenciar assinatura
□ /pricing - Planos e preços
□ /glossary - Glossário de termos
□ /nutrition - Guia nutrição
□ /prevention - Prevenção lesões
□ /overtraining - Overtraining
□ /training - Biblioteca treinos
□ /admin - Admin panel
□ /privacy-policy - Política privacidade
□ /terms-of-service - Termos de serviço
□ /privacy - LGPD (exportar dados)
```

#### Componentes (12 diretórios)
```
□ /components/ui/* - 26 componentes Radix UI (acessíveis)
□ /components/profile/* - Abas perfil v1.3.0
□ /components/dashboard/* - Widgets dashboard
□ /components/onboarding/* - Steps onboarding v1.3.0
□ /components/workout/* - Cards e logs de treinos
□ /components/subscription/* - Stripe + planos
□ /components/athera-flex/* - IA adaptativa
□ /components/ai-transparency/* - Tracking IA
□ /components/i18n/* - Internacionalização
```

---

### **2. BACKEND (API Routes Next.js)**

#### APIs Críticas para Offline (precisam IndexedDB)
```
□ /api/plan/current - Plano atual do usuário
□ /api/workouts/weekly - Treinos da semana
□ /api/profile - Dados do perfil
□ /api/workouts/complete - Marcar treino completo (sync)
□ /api/workouts/stats - Estatísticas
```

#### APIs Strava (apenas online)
```
□ /api/strava/auth - OAuth
□ /api/strava/callback - OAuth callback
□ /api/strava/sync-all - Sincronizar atividades
□ /api/strava/activities - Listar atividades
□ /api/strava/stats - Estatísticas Strava
□ /api/strava/webhook - Webhooks
□ /api/strava/disconnect - Desconectar
```

#### APIs IA (apenas online - requer backend)
```
□ /api/ai/chat - Chat treinador virtual
□ /api/ai/analyze - Análise progresso
□ /api/ai/plan-analysis - Análise plano
□ /api/plan/generate - Gerar plano (GPT-4)
□ /api/athera-flex/* - IA adaptativa (20+ endpoints)
```

#### APIs Stripe (apenas online)
```
□ /api/stripe/create-checkout-session - Checkout
□ /api/stripe/create-portal-session - Portal cliente
□ /api/stripe/webhook - Webhooks pagamentos
```

#### Total: 130+ endpoints REST mapeados ✅

---

### **3. LÓGICA DE NEGÓCIO (/lib/)**

#### Core Logic (100% PWA compatible)
```
□ /lib/vdot-calculator.ts - Cálculos VDOT ⭐
□ /lib/ai-plan-generator.ts - Geração planos IA ⭐
□ /lib/race-classifier.ts - Classificação corridas A/B/C ⭐
□ /lib/multi-race-plan-generator.ts - Multi-corrida ⭐
□ /lib/auto-adjust-service.ts - Auto-ajuste planos
□ /lib/planGenerator.ts - Gerador planos base
□ /lib/profileContextBuilder.ts - Contexto perfil IA
□ /lib/ai-context-builder.ts - Contexto IA
□ /lib/ai-workout-examples.ts - Exemplos treinos
□ /lib/workout-enhancer.ts - Enriquecimento treinos
□ /lib/recovery-adjuster.ts - Ajustes recuperação
□ /lib/injury-analyzer.ts - Análise lesões
□ /lib/onboarding-validator.ts - Validação onboarding
```

#### Integrações (requer network)
```
□ /lib/strava.ts - Cliente Strava API
□ /lib/strava-token.ts - Refresh token
□ /lib/strava-zones.ts - Zonas treino Strava
□ /lib/strava-stats.ts - Stats Strava
□ /lib/strava-race-detector.ts - Detector corridas
□ /lib/stripe.ts - Cliente Stripe
□ /lib/email.ts - Envio emails
□ /lib/llm-client.ts - Cliente LLM (OpenAI)
```

#### Utils e Helpers
```
□ /lib/utils.ts - Utilidades gerais
□ /lib/types.ts - TypeScript types
□ /lib/prisma.ts - Cliente Prisma
□ /lib/db.ts - Database helpers
□ /lib/auth.ts - Auth helpers
□ /lib/premium-check.ts - Verificação premium
```

#### Athera Flex (ML + IA adaptativa)
```
□ /lib/athera-flex/* - Sistema completo
□ /lib/ml/* - Machine Learning models
□ /lib/ai-transparency/* - Tracking IA
□ /lib/notifications/* - Sistema notificações
```

---

### **4. HOOKS CUSTOMIZADOS (/hooks/)**

```
□ /hooks/use-premium.ts - Check assinatura
□ /hooks/useFieldAnalysis.ts - Análise campos IA
□ /hooks/useFlexAnalytics.ts - Analytics Athera Flex
□ /hooks/use-toast.ts - Toast notifications
□ /hooks/useLocation.ts - Geolocalização
□ /hooks/useWorkoutMatcher.ts - Match Strava ↔ Plano
```

---

### **5. STATE MANAGEMENT**

#### Zustand Stores (precisam persist middleware)
```
□ Global state (identificar stores existentes)
□ Auth state (session + user)
□ Plan state (plano atual + progresso)
□ Profile state (perfil atleta)
```

#### React Query (já tem cache built-in)
```
□ Configuração atual OK
□ Adicionar persist plugin (opcional)
```

---

### **6. DATABASE (Prisma + Neon PostgreSQL)**

#### Schema Principal
```
□ /prisma/schema.prisma - Schema completo
□ AthleteProfile - 47 campos (perfil completo)
□ TrainingPlan - Planos de treino
□ Week - Semanas do plano
□ Workout - Treinos individuais
□ TrainingLog - Logs execução
□ Race - Corridas/provas
□ User - Usuários (NextAuth)
□ Account - OAuth accounts
□ Session - Sessions NextAuth
□ StravaActivity - Atividades Strava
□ AtheraFlexSuggestion - Sugestões IA
□ + 20 tabelas adicionais
```

#### Migrations
```
□ /prisma/migrations/* - Histórico completo
□ Sistema migração funcional ✅
```

---

### **7. ASSETS (/public/)**

#### Icons PWA (existem - precisam validação)
```
□ /public/android-chrome-192x192.png - 22KB ✅
□ /public/android-chrome-512x512.png - 94KB ✅
□ /public/apple-touch-icon.png - 20KB ✅
□ /public/favicon-16x16.png - 1.9KB ✅
□ /public/favicon-32x32.png - 2.8KB ✅
□ /public/favicon.ico - 64KB ✅
□ /public/favicon.svg - 512B ✅
```

#### Logos (precisam otimização)
```
□ /public/logo.png - 1.4MB ⚠️ MUITO GRANDE
□ /public/logo-complete.png - 240KB ⚠️ OTIMIZAR
□ /public/logo-icon.png - 499KB ⚠️ CRÍTICO - OTIMIZAR
□ /public/logo-name.png - 59KB ✅ OK
```

#### Open Graph
```
□ /public/og-image.png - 157KB ✅
```

#### Manifest
```
□ /public/site.webmanifest - Existe ⚠️ PRECISA CORREÇÃO
```

#### Assets Faltando (criar)
```
□ /public/maskable-icon-192x192.png - Criar
□ /public/maskable-icon-512x512.png - Criar
□ /public/splash/apple-*.png - Criar (5 tamanhos iOS)
□ /public/screenshots/*.png - Criar (2-8 imagens)
□ /public/sw.js - Service Worker (criar)
```

---

### **8. CONFIGS E SETUP**

#### Next.js Config
```
□ /next.config.js - OK, adicionar PWA plugin
□ distDir: '.next'
□ images: { unoptimized: true } - ⚠️ Remover se possível
□ webpack: custom alias (@/)
```

#### Tailwind Config
```
□ /tailwind.config.ts - OK
□ Athletic Performance theme ✅
□ Responsive breakpoints ✅
□ Design tokens ✅
```

#### PostCSS
```
□ /postcss.config.js - OK
```

#### TypeScript
```
□ /tsconfig.json - OK
□ Strict mode ✅
□ Path aliases (@/) ✅
```

#### Vercel
```
□ /vercel.json - OK
□ buildCommand: npm run build
□ framework: nextjs
□ installCommand: npm install --force
```

#### Git
```
□ /.gitignore - OK (secrets protegidos)
```

#### Env Variables
```
□ /.env.local - Existe ✅ (não commitado)
□ DATABASE_URL - Neon PostgreSQL
□ NEXTAUTH_SECRET
□ NEXTAUTH_URL
□ OPENAI_API_KEY
□ GOOGLE_CLIENT_ID/SECRET
□ STRAVA_CLIENT_ID/SECRET
□ STRIPE_SECRET_KEY
□ + ~15 variáveis adicionais
```

---

### **9. DEPENDENCIES (package.json)**

#### Core (já compatível PWA)
```
□ next: 14.2.28 ✅
□ react: 18.2.0 ✅
□ react-dom: 18.2.0 ✅
□ typescript: 5.9.3 ✅
```

#### UI/Styling (PWA ready)
```
□ tailwindcss: 3.4.18 ✅
□ @radix-ui/* (26 packages) ✅
□ lucide-react: 0.446.0 ✅
□ framer-motion: 10.18.0 ✅
```

#### State/Data
```
□ zustand: 5.0.3 ✅ (suporta persist)
□ @tanstack/react-query: 5.0.0 ✅
□ swr: 2.2.4 ✅
□ jotai: 2.6.0 ✅
```

#### Forms/Validation
```
□ react-hook-form: 7.53.0 ✅
□ zod: 3.23.8 ✅
□ yup: 1.3.0 ✅
```

#### Database/Auth
```
□ @prisma/client: 6.18.0 ✅
□ next-auth: 4.24.11 ✅
```

#### APIs/Integrations
```
□ openai: 6.9.1 ⚠️ Server-only
□ stripe: 19.2.0 ⚠️ Server-only
```

#### Charts (grandes - lazy load)
```
□ recharts: 2.15.3 ⚠️ 200KB+
□ chart.js: 4.4.9 ⚠️ 150KB+
□ plotly.js: 2.35.3 ⚠️ 400KB+ CRÍTICO
□ react-plotly.js: 2.6.0
```

#### Utils
```
□ dayjs: 1.11.13 ✅
□ lodash: 4.17.21 ✅
□ date-fns: 3.6.0 ✅
```

#### FALTAM (adicionar para PWA)
```
□ workbox-webpack-plugin: ^7.0.0 - Service Worker
□ workbox-window: ^7.0.0 - SW registration
□ idb: ^8.0.0 - IndexedDB wrapper
□ next-pwa: ^5.6.0 (opcional - considerar)
```

---

## 🚀 ROADMAP IMPLEMENTAÇÃO (10 DIAS)

### **FASE 1: FUNDAÇÃO PWA** ⏱️ 1-2 dias

#### Dia 1 - Manhã (4h)
```
□ 1.1. Git: Criar branch feat/pwa-implementation
□ 1.2. Renomear /public/site.webmanifest → manifest.json
□ 1.3. Corrigir manifest.json:
    □ Remover espaços do icon path
    □ Adicionar 192px e 512px separados
    □ Mudar start_url: "/" → "/pt-BR/"
    □ Adicionar scope: "/pt-BR/"
    □ Adicionar orientation: "portrait"
    □ Adicionar categories: ["health", "lifestyle"]
    □ Adicionar display_override: ["window-controls-overlay"]
□ 1.4. Atualizar /app/layout.tsx:
    □ Adicionar manifest: '/manifest.json'
    □ Adicionar meta theme-color
    □ Adicionar apple-mobile-web-app-capable
    □ Adicionar apple-mobile-web-app-status-bar-style
    □ Adicionar apple-mobile-web-app-title
```

#### Dia 1 - Tarde (4h)
```
□ 1.5. Otimizar imagens:
    □ logo-icon.png: 499KB → <100KB (tinypng.com)
    □ logo-complete.png: 240KB → <50KB
    □ logo.png: 1.4MB → <200KB (ou remover se não usado)
□ 1.6. Criar ícones maskable:
    □ Usar https://maskable.app/
    □ Exportar 192x192 e 512x512
    □ Salvar em /public/
□ 1.7. Adicionar shortcuts ao manifest:
    □ Dashboard
    □ Plano
    □ Perfil
□ 1.8. Testar manifest:
    □ Chrome DevTools → Application → Manifest
    □ Verificar erros
    □ Corrigir se necessário
```

#### Dia 2 - Manhã (4h)
```
□ 1.9. Criar splash screens iOS:
    □ 2048x2732 (iPad Pro 12.9")
    □ 1668x2388 (iPad Pro 11")
    □ 1536x2048 (iPad 10.2")
    □ 1242x2688 (iPhone 14 Pro Max)
    □ 1170x2532 (iPhone 14 Pro)
    □ Adicionar <link rel="apple-touch-startup-image">
□ 1.10. Criar screenshots PWA:
    □ Tirar 4-8 screenshots reais do app
    □ Dashboard, Plano, Perfil, Onboarding
    □ Dimensões: 540x720 (mobile) ou 1280x720 (desktop)
    □ Adicionar ao manifest.json
```

#### Dia 2 - Tarde (4h)
```
□ 1.11. Instalar dependências PWA:
    npm install --save-dev workbox-webpack-plugin workbox-window
    npm install idb
□ 1.12. Configurar next.config.js:
    □ Adicionar next-pwa config (ou workbox manual)
□ 1.13. Build de teste:
    npm run build
    □ Verificar sem erros
□ 1.14. Commit:
    git add .
    git commit -m "feat(pwa): Fase 1 - Fundação PWA completa"
```

**✅ RESULTADO FASE 1:**
- Manifest.json válido e completo
- Ícones otimizados e maskable
- Splash screens iOS
- Screenshots PWA
- Meta tags completas
- Pronto para Service Worker

---

### **FASE 2: SERVICE WORKER** ⏱️ 3-4 dias

#### Dia 3 - Manhã (4h)
```
□ 2.1. Criar /public/sw.js (Service Worker base):
    □ Cache name versioning (v1.0.0)
    □ Install event (precache assets críticos)
    □ Activate event (cleanup old caches)
    □ Fetch event (estratégias de cache)
□ 2.2. Estratégias de cache:
    □ Cache-first: /_next/static/*, /public/*
    □ Network-first: /api/*
    □ Stale-while-revalidate: /pt-BR/* (páginas)
□ 2.3. Offline fallback:
    □ Criar /app/[locale]/offline/page.tsx
    □ UI amigável "Você está offline"
    □ Listar funcionalidades disponíveis offline
□ 2.4. Testar Service Worker:
    □ Chrome DevTools → Application → Service Workers
    □ Verificar registration
    □ Testar cache
```

#### Dia 3 - Tarde (4h)
```
□ 2.5. Criar /lib/pwa/sw-register.ts:
    □ Registration logic
    □ Update detection
    □ Skip waiting
    □ Reload prompt (se novo SW disponível)
□ 2.6. Adicionar registration em app/layout.tsx:
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        registerServiceWorker();
      }
    }, []);
□ 2.7. Criar componente UpdatePrompt:
    □ /components/pwa/update-prompt.tsx
    □ "Nova versão disponível. Atualizar?"
□ 2.8. Testar update flow:
    □ Mudar cache version
    □ Build + deploy
    □ Verificar prompt de update
```

#### Dia 4 - Manhã (4h)
```
□ 2.9. Implementar cache de páginas críticas:
    □ /pt-BR/dashboard
    □ /pt-BR/plano
    □ /pt-BR/perfil
    □ /pt-BR/tracking
□ 2.10. Implementar cache de APIs:
    □ /api/plan/current
    □ /api/workouts/weekly
    □ /api/profile
    □ Network timeout: 3 segundos → fallback cache
□ 2.11. Criar /lib/pwa/cache-manager.ts:
    □ addToCache(key, data)
    □ getFromCache(key)
    □ removeFromCache(key)
    □ clearExpiredCache()
```

#### Dia 4 - Tarde (4h)
```
□ 2.12. Testar offline completo:
    □ Chrome DevTools → Network → Offline
    □ Navegar dashboard → OK
    □ Ver plano → OK
    □ Ver perfil → OK
    □ Marcar treino → Enfileirar (sync later)
□ 2.13. Logs e debug:
    □ Adicionar console.log estratégicos
    □ Workbox debug mode (development)
□ 2.14. Commit:
    git commit -m "feat(pwa): Fase 2 - Service Worker + offline"
```

**✅ RESULTADO FASE 2:**
- Service Worker funcionando
- Cache estratégico configurado
- Páginas principais offline
- APIs críticas cacheadas
- Update prompt implementado

---

### **FASE 3: OFFLINE SUPPORT** ⏱️ 5-6 dias

#### Dia 5 - Manhã (4h)
```
□ 3.1. Instalar IndexedDB wrapper:
    npm install idb
□ 3.2. Criar /lib/pwa/indexeddb.ts:
    □ openDB() - Criar database "athera-pwa"
    □ Stores: "plans", "workouts", "profile", "sync-queue"
    □ Version 1.0
□ 3.3. Schema IndexedDB:
    □ plans: { id, userId, data, lastSync }
    □ workouts: { id, userId, weekId, data, lastSync }
    □ profile: { userId, data, lastSync }
    □ sync-queue: { id, type, data, timestamp, retries }
□ 3.4. CRUD functions:
    □ savePlan(plan)
    □ getPlan(userId)
    □ saveWorkout(workout)
    □ getWorkouts(userId, weekId)
    □ saveProfile(profile)
    □ getProfile(userId)
```

#### Dia 5 - Tarde (4h)
```
□ 3.5. Integrar IndexedDB com React Query:
    □ Persistência automática de queries
    □ Fallback para IndexedDB quando offline
□ 3.6. Hook personalizado /hooks/useOfflineData.ts:
    const { data, isOffline } = useOfflineData('plan/current');
    □ Detecta online/offline
    □ Retorna dados cache se offline
    □ Atualiza quando volta online
□ 3.7. Indicador de status:
    □ /components/pwa/offline-indicator.tsx
    □ Badge no header: "🟢 Online" / "🔴 Offline"
    □ Tooltip: "Dados em cache, sincroniza ao reconectar"
```

#### Dia 6 - Manhã (4h)
```
□ 3.8. Criar /lib/pwa/sync-manager.ts:
    □ addToSyncQueue(action, data)
    □ processSyncQueue() - Quando volta online
    □ markWorkoutComplete(workoutId) - Enfileira
□ 3.9. Background Sync API (se suportado):
    □ Registrar sync tag: 'sync-workouts'
    □ Sync event listener no SW
    □ Fallback: sync manual ao voltar online
□ 3.10. UI de sincronização:
    □ Toast: "Sincronizando treinos..." quando volta online
    □ Progress: "3/5 treinos sincronizados"
```

#### Dia 6 - Tarde (4h)
```
□ 3.11. Testar fluxo completo offline:
    1. Offline: Marcar 3 treinos completos
    2. Verificar sync-queue no IndexedDB
    3. Online: Verificar sincronização automática
    4. Verificar treinos no backend
□ 3.12. Tratamento de conflitos:
    □ Se treino já marcado no backend (outro device)
    □ Mostrar dialog: "Treino já completo em outro dispositivo"
□ 3.13. Limpar dados antigos:
    □ Limpeza semanal de cache expirado
    □ Manter apenas última semana offline
□ 3.14. Commit:
    git commit -m "feat(pwa): Fase 3 - Offline support + IndexedDB"
```

**✅ RESULTADO FASE 3:**
- IndexedDB funcionando
- Plano, treinos e perfil offline
- Fila de sincronização
- Background Sync (se suportado)
- UI de status online/offline

---

### **FASE 4: MOBILE OPTIMIZATIONS** ⏱️ 7-8 dias

#### Dia 7 - Manhã (4h)
```
□ 4.1. Adicionar safe-area-insets em /app/globals.css:
    @supports (padding: env(safe-area-inset-top)) {
      body {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
      .header {
        padding-top: calc(1rem + env(safe-area-inset-top));
      }
    }
□ 4.2. Fix input zoom iOS:
    input, select, textarea {
      font-size: 16px !important;
      -webkit-appearance: none;
    }
□ 4.3. Smooth scroll:
    html {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
□ 4.4. Pull to refresh override:
    body {
      overscroll-behavior-y: contain;
    }
```

#### Dia 7 - Tarde (4h)
```
□ 4.5. Revisar touch targets (mínimo 44x44px):
    □ /components/ui/button.tsx - Verificar padding
    □ /components/dashboard/* - Verificar botões pequenos
    □ /components/workout/* - Verificar ações
□ 4.6. Otimizar modais mobile:
    □ Full-screen em mobile (<768px)
    □ Swipe down to close
□ 4.7. Testar gestos:
    □ Swipe entre semanas (plano)
    □ Pull to refresh (dashboard)
    □ Swipe actions (treinos)
□ 4.8. Keyboard handling:
    □ Input focus: scroll to view
    □ Submit on Enter
    □ Dismiss keyboard ao scroll
```

#### Dia 8 - Manhã (4h)
```
□ 4.9. Testar iPhone físico ou simulador:
    □ Safari: atherarun.com
    □ Add to Home Screen
    □ Testar notch/Dynamic Island (safe-area)
    □ Testar splash screen
    □ Testar orientação (portrait/landscape)
□ 4.10. Testar Android físico ou emulador:
    □ Chrome: atherarun.com
    □ Install prompt
    □ Testar maskable icons
    □ Testar navigation bar color
    □ Testar back button behavior
```

#### Dia 8 - Tarde (4h)
```
□ 4.11. Ajustes iOS específicos:
    □ Splash screen delay (se necessário)
    □ Status bar style (light/dark)
    □ Disable zoom em inputs
□ 4.12. Ajustes Android específicos:
    □ Maskable icons padding
    □ Navigation bar color
    □ Install banner timing
□ 4.13. Performance mobile:
    □ Lazy load de charts (Plotly, Recharts)
    □ Image optimization (next/image)
    □ Font loading strategy
□ 4.14. Commit:
    git commit -m "feat(pwa): Fase 4 - Mobile optimizations"
```

**✅ RESULTADO FASE 4:**
- Safe-area-insets (notch)
- Inputs sem zoom iOS
- Touch targets otimizados
- Testado em iOS + Android
- Performance mobile OK

---

### **FASE 5: TESTING & POLISH** ⏱️ 9-10 dias

#### Dia 9 - Manhã (4h)
```
□ 5.1. Lighthouse Audit (mobile):
    □ Performance: target 90+
    □ Accessibility: target 95+
    □ Best Practices: target 100
    □ SEO: target 100
    □ PWA: target 100 ⭐
□ 5.2. Corrigir issues Lighthouse:
    □ [Lista de issues encontrados]
□ 5.3. PWA Checklist (web.dev):
    https://web.dev/pwa-checklist/
    □ Verificar todos os itens
```

#### Dia 9 - Tarde (4h)
```
□ 5.4. Testes cross-browser:
    □ Chrome Android (último)
    □ Safari iOS (último)
    □ Samsung Internet
    □ Firefox Android
□ 5.5. Testes cross-device:
    □ iPhone 14 Pro (notch)
    □ iPhone SE (sem notch)
    □ Pixel 7
    □ Samsung Galaxy S23
    □ iPad Pro (tablet)
□ 5.6. Testes de conectividade:
    □ 4G lento (throttle)
    □ Offline total
    □ Intermitente (offline/online)
```

#### Dia 10 - Manhã (4h)
```
□ 5.7. Testes de instalação:
    □ iOS: Add to Home Screen (manual)
    □ Android: Install prompt (automático)
    □ Android: Menu → Install App
    □ Desktop: Chrome → Install
□ 5.8. Testes pós-instalação:
    □ App abre em standalone (sem browser UI)
    □ Splash screen aparece
    □ Ícone correto na home screen
    □ Nome correto embaixo do ícone
□ 5.9. Testes de update:
    □ Nova versão: Cache version++
    □ Deploy produção
    □ App detecta update
    □ Prompt "Atualizar"
    □ Atualização sem perder dados
```

#### Dia 10 - Tarde (4h)
```
□ 5.10. Documentação final:
    □ Atualizar README.md com instruções PWA
    □ Criar PWA_INSTALL_GUIDE.md (usuários)
    □ Criar PWA_DEVELOPER_GUIDE.md (devs)
□ 5.11. Changelog:
    □ Criar CHANGELOG_v3_3_0_PWA.md
    □ Listar todas as features PWA
□ 5.12. Deploy produção final:
    git merge feat/pwa-implementation → main
    git push origin main
    □ Vercel auto-deploy
    □ Verificar deploy bem-sucedido
□ 5.13. Testes produção:
    □ https://atherarun.com
    □ Lighthouse audit final
    □ Instalar e testar como usuário real
□ 5.14. Comunicação:
    □ Post redes sociais: "Athera Run agora é PWA!"
    □ Email usuários: Instalem o app
    □ Tutorial: Como instalar (iOS + Android)
```

**✅ RESULTADO FASE 5:**
- Lighthouse 90+ em todos os scores
- PWA 100%
- Testado em 4+ devices
- Instalável em iOS + Android
- Documentação completa
- Deploy produção ✅

---

## 📊 MÉTRICAS DE SUCESSO FINAL

### Performance (Lighthouse Mobile)
```
□ Performance: 90+ (atual: ~85)
□ Accessibility: 95+ (atual: ~92)
□ Best Practices: 100 (atual: ~95)
□ SEO: 100 (atual: 100)
□ PWA: 100 (atual: 0) ⭐
```

### Instalabilidade
```
□ Manifest válido (0 erros)
□ Service Worker registrado
□ HTTPS ativo
□ Icons corretos (192px, 512px, maskable)
□ Install prompt funciona (Android)
□ Add to Home Screen funciona (iOS)
```

### Offline
```
□ Dashboard offline 100%
□ Plano offline 100%
□ Perfil offline 100%
□ Treinos sincronizam ao voltar online
□ Cache < 50MB (limite iOS)
```

### UX Mobile
```
□ Safe-area-insets OK (notch)
□ Sem zoom inputs iOS
□ Touch targets ≥44px
□ Gestos funcionam (swipe, pull-to-refresh)
□ Performance fluida (60fps)
```

---

## 🚨 PONTOS CRÍTICOS (Não Esquecer!)

### 1. MIDDLEWARE + LOCALE
```
⚠️ start_url do manifest DEVE ser /pt-BR/
⚠️ scope do manifest DEVE ser /pt-BR/
⚠️ Caso contrário: loop infinito
```

### 2. CACHE VERSION
```
⚠️ Incrementar a cada deploy
⚠️ const CACHE_VERSION = 'v1.0.0';
⚠️ Senão: usuários ficam com versão antiga
```

### 3. HTTPS
```
⚠️ PWA só funciona em HTTPS
✅ Produção: atherarun.com (OK)
✅ Local: localhost (permitido)
❌ HTTP: Service Worker bloqueado
```

### 4. IOS QUIRKS
```
⚠️ Add to Home Screen é MANUAL (sem prompt)
⚠️ Cache limitado (~50MB)
⚠️ Splash screens precisam de 5 tamanhos
⚠️ Safe-area obrigatório (notch)
```

### 5. PLOTLY.JS
```
⚠️ 400KB+ (muito grande)
✅ SOLUÇÃO: Lazy load + code splitting
✅ const Plotly = dynamic(() => import('react-plotly.js'), { ssr: false });
```

---

## 🎯 VALIDAÇÃO FINAL (Antes de Marcar Completo)

### Checklist Pré-Deploy
```
□ Build produção sem erros
□ TypeScript sem erros
□ Service Worker registrando
□ Manifest sem erros (validator)
□ Lighthouse PWA 100%
□ Testado iPhone físico
□ Testado Android físico
□ Offline funciona 100%
□ Sync funciona ao voltar online
□ Cache < 50MB
□ Performance 90+
□ Documentação atualizada
```

### Validação Usuário Real
```
□ Usuário consegue instalar (iOS)
□ Usuário consegue instalar (Android)
□ Ícone aparece bonito na home
□ App abre sem browser UI
□ Splash screen aparece
□ Dashboard carrega rápido
□ Plano acessível offline
□ Marcar treino offline funciona
□ Sincroniza ao voltar online
```

---

## 📚 DOCUMENTOS COMPLEMENTARES

### Criados Durante Migração
```
□ ANALISE_PROFUNDA_PWA_MIGRATION.md (este é o técnico)
□ PWA_MIGRATION_MASTER_CHECKLIST.md (este aqui - operacional)
□ PWA_INSTALL_GUIDE.md (para usuários finais)
□ PWA_DEVELOPER_GUIDE.md (para devs futuros)
□ CHANGELOG_v3_3_0_PWA.md (changelog completo)
```

### Referências Técnicas
```
□ https://web.dev/progressive-web-apps/
□ https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
□ https://developer.chrome.com/docs/workbox/
□ https://ducanh-next-pwa.vercel.app/
□ https://maskable.app/
□ https://www.pwabuilder.com/
```

---

## ✅ COMO USAR ESTE CHECKLIST

1. **Imprimir ou abrir em tela secundária**
2. **Marcar □ → ☑ conforme completa**
3. **Anotar issues/dúvidas ao lado de cada item**
4. **Git commit a cada fase completa**
5. **Revisar métricas ao final**
6. **Celebrar quando tudo ☑** 🎉

---

## 📞 SUPORTE

Se ficar preso em algum ponto:
1. Revisar ANALISE_PROFUNDA_PWA_MIGRATION.md
2. Consultar documentação oficial (links acima)
3. Chrome DevTools → Application tab (debug)
4. Lighthouse (identificar problemas)

---

**ÚLTIMA ATUALIZAÇÃO:** 11/Dez/2025 12:15 UTC  
**STATUS:** 📋 Checklist completo, pronto para execução  
**PRÓXIMO PASSO:** ☑ Começar Fase 1 - Fundação PWA

---

## 🎉 BOA SORTE!

Este checklist foi criado após análise profunda de TODA a aplicação.  
Zero pontas soltas. Cada vírgula mapeada.  
Siga fase por fase e terá um PWA profissional em 10 dias.

**Vamos fazer o Athera Run brilhar no mobile! 🏃‍♂️📱✨**
