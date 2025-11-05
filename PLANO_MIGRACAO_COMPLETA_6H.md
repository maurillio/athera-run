# 🚀 PLANO DE MIGRAÇÃO i18n COMPLETA - 6 HORAS

**Data:** 05/Nov/2025 14:30 UTC  
**Início:** AGORA  
**Término:** 20:30 UTC (estimado)  
**Objetivo:** 43% → 100% i18n  
**Status:** ⏳ PRONTO PARA EXECUÇÃO

---

## ⏰ CRONOGRAMA DETALHADO

### **FASE 0: PREPARAÇÃO (14:30 - 14:40) - 10 min**

#### Objetivos:
- Criar backup do código atual
- Validar sistema funcionando
- Preparar ambiente

#### Tarefas:
```bash
# 1. Criar branch de segurança
git checkout -b backup-pre-i18n-migration
git push origin backup-pre-i18n-migration
git checkout main

# 2. Verificar build atual
cd nextjs_space
npm run build  # Deve passar

# 3. Confirmar produção OK
curl -I https://atherarun.com/pt-BR/dashboard  # 200 OK
```

#### Checklist:
- [ ] Branch backup criado
- [ ] Build passando localmente
- [ ] Produção funcionando
- [ ] Café preparado ☕

---

### **FASE 1: LIMPEZA DE DUPLICATAS (14:40 - 14:50) - 10 min**

#### Objetivos:
- Remover 6 rotas duplicadas
- Prevenir confusão
- Limpar código

#### Rotas a DELETAR:
```bash
rm -rf app/dashboard
rm -rf app/login
rm -rf app/signup
rm -rf app/onboarding
rm -rf app/plano
rm -rf app/perfil
```

#### Commit:
```bash
git add .
git commit -m "chore(i18n): remove duplicated routes from app root

Deleted 6 duplicated routes that already exist in app/[locale]/:
- dashboard, login, signup, onboarding, plano, perfil

These routes now exist ONLY in app/[locale]/ with i18n support.
Old versions in app/ root were causing confusion and code duplication.

Part of: Complete i18n migration (Phase 1/5)"

git push origin main
```

#### Teste:
- [ ] Build passa após deletar
- [ ] `/pt-BR/dashboard` funciona
- [ ] Deploy automático iniciado

**⏱️ Checkpoint 1: 14:50**

---

### **FASE 2: MIGRAÇÃO CORE - PARTE A (14:50 - 16:00) - 70 min**

#### 2.1 - TRACKING (14:50 - 15:50) - 60 min

**Por que primeiro:** Feature mais usada, crítica

**Passo 1: Copiar estrutura (5 min)**
```bash
cp -r app/tracking app/[locale]/tracking
```

**Passo 2: Adicionar i18n hooks (5 min)**
```typescript
// app/[locale]/tracking/page.tsx
import { useLocale, useTranslations } from '@/lib/i18n/hooks';

export default function TrackingPage() {
  const locale = useLocale();
  const t = useTranslations('tracking');
  // ...
}
```

**Passo 3: Extrair e substituir textos (30 min)**

Textos a extrair:
- Título da página
- Labels de formulário
- Botões
- Mensagens de validação
- Tooltips
- Estados vazios
- Mensagens de erro/sucesso

**Passo 4: Criar traduções (15 min)**
```json
// lib/i18n/translations/pt-BR.json
{
  "tracking": {
    "title": "Registro de Treinos",
    "subtitle": "Acompanhe seus treinos completados",
    "form": {
      "date": "Data do treino",
      "distance": "Distância (km)",
      "duration": "Duração (min)",
      "notes": "Observações"
    },
    "buttons": {
      "save": "Salvar Treino",
      "cancel": "Cancelar"
    },
    "messages": {
      "success": "Treino registrado com sucesso!",
      "error": "Erro ao registrar treino"
    }
  }
}

// Traduzir para EN e ES usando ChatGPT
```

**Passo 5: Atualizar links internos (3 min)**
```typescript
// Buscar e substituir
router.push('/tracking') → router.push(`/${locale}/tracking`)
href="/tracking" → href={`/${locale}/tracking`}
```

**Passo 6: Testar (2 min)**
```
/pt-BR/tracking ✓
/en/tracking ✓
/es/tracking ✓
```

**⏱️ Checkpoint 2: 15:50**

---

#### 2.2 - TRAINING (15:50 - 16:00) - 10 min (PAUSA)

**Apenas copiar estrutura, migrar depois da pausa**
```bash
cp -r app/training app/[locale]/training
```

**⏱️ PAUSA: 16:00 - 16:10 (10 min)** 🍕

---

### **FASE 3: MIGRAÇÃO CORE - PARTE B (16:10 - 17:30) - 80 min**

#### 3.1 - TRAINING continuação (16:10 - 16:50) - 40 min

Similar a tracking, mas mais simples:
- Adicionar hooks (5 min)
- Extrair textos (20 min)
- Traduzir (10 min)
- Links internos (3 min)
- Testar (2 min)

**⏱️ Checkpoint 3: 16:50**

---

#### 3.2 - CALCULATOR (16:50 - 17:15) - 25 min

Página simples, pública:
- Copiar (2 min)
- Hooks (3 min)
- Extrair textos (12 min)
- Traduzir (5 min)
- Links (1 min)
- Testar (2 min)

---

#### 3.3 - CHAT (17:15 - 17:30) - 15 min (preparação)

**Apenas copiar, migrar depois**
```bash
cp -r app/chat app/[locale]/chat
```

**⏱️ PAUSA: 17:30 - 17:40 (10 min)** ☕

---

### **FASE 4: MIGRAÇÃO SECUNDÁRIA (17:40 - 19:00) - 80 min**

#### 4.1 - CHAT continuação (17:40 - 18:20) - 40 min

Interface conversacional:
- Hooks (5 min)
- Extrair textos (20 min)
- Traduzir (10 min)
- Links (3 min)
- Testar (2 min)

**⏱️ Checkpoint 4: 18:20**

---

#### 4.2 - SUBSCRIPTION (18:20 - 18:45) - 25 min

Gerenciar assinatura:
- Copiar (2 min)
- Hooks (3 min)
- Extrair textos (12 min)
- Traduzir (5 min)
- Links (1 min)
- Testar (2 min)

---

#### 4.3 - NUTRITION (18:45 - 19:00) - 15 min (preparação)

```bash
cp -r app/nutrition app/[locale]/nutrition
```

**⏱️ PAUSA: 19:00 - 19:10 (10 min)** 🥤

---

### **FASE 5: MIGRAÇÃO FINAL (19:10 - 20:00) - 50 min**

#### 5.1 - NUTRITION continuação (19:10 - 19:40) - 30 min

Guia nutricional:
- Hooks (4 min)
- Extrair textos (15 min)
- Traduzir (8 min)
- Links (1 min)
- Testar (2 min)

---

#### 5.2 - ROTAS SIMPLES EM BATCH (19:40 - 20:00) - 20 min

**Migrar 6 rotas simples rapidamente:**

```bash
# Copiar todas
for route in prevention glossary overtraining pricing admin; do
  cp -r app/$route app/[locale]/$route
done

# Adicionar hooks em cada uma (2 min cada)
# Extrair/traduzir textos (10 min total - são simples)
# Testar (2 min)
```

**⏱️ Checkpoint 5: 20:00**

---

### **FASE 6: FINALIZAÇÃO (20:00 - 20:30) - 30 min**

#### 6.1 - Atualizar Middleware (20:00 - 20:05) - 5 min

```typescript
// nextjs_space/middleware.ts
const i18nRoutes = [
  '/dashboard',
  '/login',
  '/signup',
  '/onboarding',
  '/plano',
  '/perfil',
  '/tracking',      // ← NOVO
  '/training',      // ← NOVO
  '/calculator',    // ← NOVO
  '/chat',          // ← NOVO
  '/subscription',  // ← NOVO
  '/nutrition',     // ← NOVO
  '/prevention',    // ← NOVO
  '/glossary',      // ← NOVO
  '/overtraining',  // ← NOVO
  '/pricing',       // ← NOVO
  '/admin',         // ← NOVO
  '/'
];
```

---

#### 6.2 - Deletar Rotas Antigas (20:05 - 20:10) - 5 min

```bash
# Deletar TODAS as versões antigas
rm -rf app/tracking
rm -rf app/training
rm -rf app/calculator
rm -rf app/chat
rm -rf app/subscription
rm -rf app/nutrition
rm -rf app/prevention
rm -rf app/glossary
rm -rf app/overtraining
rm -rf app/pricing
rm -rf app/admin
```

---

#### 6.3 - Build Final (20:10 - 20:15) - 5 min

```bash
cd nextjs_space
npm run build  # Deve passar sem erros
```

---

#### 6.4 - Commit Final (20:15 - 20:20) - 5 min

```bash
git add .
git commit -m "feat(i18n): complete migration to 100% i18n support

COMPLETE MIGRATION - All routes now support 3 languages (PT-BR, EN, ES)

Migrated routes (11):
- tracking, training, calculator, chat, subscription
- nutrition, prevention, glossary, overtraining
- pricing, admin

Changes:
- Added i18n hooks to all pages
- Extracted 882+ new translation keys
- Total: ~1800 keys × 3 languages = 5400+ translations
- Updated middleware with all routes
- Deleted old routes from app/ root
- 100% code consistency

Progress: 43% → 100% ✅

Translation coverage:
- PT-BR: ~1800 keys
- EN: ~1800 keys  
- ES: ~1800 keys

Testing:
- All routes work in 3 languages ✓
- Auto-redirect working ✓
- Dates localized ✓
- No broken links ✓

Part of: Complete i18n migration (Phase 6/6 - FINAL)"

git push origin main
```

---

#### 6.5 - Testes de Produção (20:20 - 20:30) - 10 min

```bash
# Aguardar deploy Vercel (~3 min)

# Testar rotas críticas em 3 idiomas
curl -I https://atherarun.com/pt-BR/tracking  # 200
curl -I https://atherarun.com/en/tracking     # 200
curl -I https://atherarun.com/es/tracking     # 200

curl -I https://atherarun.com/pt-BR/calculator
curl -I https://atherarun.com/en/calculator
curl -I https://atherarun.com/es/calculator

# Testar redirect
curl -I https://atherarun.com/tracking  # 307 → /pt-BR/tracking
```

**✅ FIM: 20:30 UTC**

---

## 📊 PROGRESSO POR FASE

```
14:30 ███░░░░░░░░░░░░░░░░░░  5%  Preparação
14:50 █████░░░░░░░░░░░░░░░░  10% Limpeza
16:00 ████████████░░░░░░░░░  35% Tracking migrado
17:30 ████████████████░░░░░  60% Core completo
19:00 ████████████████████░  85% Secundárias completas
20:30 ████████████████████  100% COMPLETO! ✅
```

---

## 🎯 MÉTRICAS FINAIS

### **Translation Keys:**
```
Antes:  ~918 keys × 3 idiomas = 2,754 keys
Depois: ~1,800 keys × 3 idiomas = 5,400 keys
Aumento: +882 keys por idioma (+96%)
```

### **Rotas i18n:**
```
Antes:  6/17 rotas (35%)
Depois: 17/17 rotas (100%)
```

### **Código:**
```
Arquivos migrados: 11
Arquivos deletados: 17 (duplicatas + antigas)
Código limpo: 100%
```

---

## 🛡️ PLANO DE CONTINGÊNCIA

### **Se algo quebrar:**

1. **Rollback imediato:**
```bash
git checkout backup-pre-i18n-migration
git push origin main --force
```

2. **Identificar rota problema:**
```bash
# Reverter apenas 1 rota
git checkout main -- app/[locale]/ROTA_PROBLEMA
git checkout backup-pre-i18n-migration -- app/ROTA_PROBLEMA
git commit -m "revert: rollback ROTA_PROBLEMA"
```

3. **Build falhou:**
- Verificar erros TypeScript
- Verificar imports faltando
- Verificar translation keys faltando

---

## ☕ PAUSAS PROGRAMADAS

```
14:30 ----[INÍCIO]----
16:00 🍕 PAUSA 10min
17:30 ☕ PAUSA 10min
19:00 🥤 PAUSA 10min
20:30 ----[FIM]----
```

**Total efetivo:** 6h - 30min pausas = 5h30min de trabalho

---

## 📋 CHECKLIST GLOBAL

### **Antes de começar:**
- [ ] Backup branch criado
- [ ] Build local funcionando
- [ ] Produção estável
- [ ] Café/água preparado
- [ ] Ambiente sem distrações

### **Durante migração:**
- [ ] Fase 0: Preparação
- [ ] Fase 1: Limpeza duplicatas
- [ ] Fase 2: tracking + training
- [ ] Fase 3: calculator + chat (parte)
- [ ] Fase 4: chat (cont.) + subscription + nutrition (parte)
- [ ] Fase 5: nutrition (cont.) + batch de rotas simples
- [ ] Fase 6: middleware + deletar antigas + build + commit

### **Depois de concluir:**
- [ ] Build passou localmente
- [ ] Deploy concluído no Vercel
- [ ] Testar 3 rotas × 3 idiomas = 9 URLs
- [ ] Verificar redirects automáticos
- [ ] Confirmar datas localizadas
- [ ] Celebrar! 🎉

---

## 🚨 ALERTAS IMPORTANTES

⚠️ **NÃO pular fases** - seguir ordem exata  
⚠️ **SEMPRE testar** antes de deletar rota antiga  
⚠️ **COMMITAR incrementalmente** (não tudo no final)  
⚠️ **PAUSAS são obrigatórias** - evita erros por fadiga  
⚠️ **Build local** antes de cada commit grande  

---

## 🎉 RESULTADO ESPERADO

### **Às 20:30 UTC:**

✅ **100% das rotas** com i18n  
✅ **5,400+ traduções** (3 idiomas)  
✅ **Zero duplicatas** de código  
✅ **Middleware completo** (17 rotas)  
✅ **Sistema consistente** em tudo  
✅ **Produção estável** e testada  
✅ **Athera Run internacional!** 🌎🌍🌏  

---

## 🚀 COMANDO PARA INICIAR

```bash
# Quando estiver pronto, execute:
cd /root/athera-run
git checkout -b backup-pre-i18n-migration
git push origin backup-pre-i18n-migration
git checkout main

echo "✅ Backup criado! Iniciando migração em 3... 2... 1... GO! 🚀"
```

---

**Documento criado:** 05/Nov/2025 14:30 UTC  
**Status:** PRONTO PARA EXECUÇÃO  
**Próxima ação:** AGUARDANDO SEU "GO!" 🚀  

**Você está pronto para começar?** 💪
