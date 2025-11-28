# 🗺️ LEIA PRIMEIRO - Separação de Ambientes Dev/Prod

**Data:** 28/Nov/2025 12:53 UTC  
**Versão:** v3.2.8 (Planejamento)  
**Status:** 📋 AGUARDANDO APROVAÇÃO

---

## ⚡ Resposta Rápida

### ✅ É possível separar os ambientes?
**SIM!** Production em `atherarun.com` e Development em `athera-run.vercel.app`

### 📚 Documentos Criados

| Arquivo | Descrição | Tamanho |
|---------|-----------|---------|
| **PLANO_AMBIENTES_DEV_PROD.md** | Guia completo de implementação | ~500 linhas |
| **RESUMO_SESSAO_28NOV2025_AMBIENTES.md** | Resumo desta sessão | ~300 linhas |

---

## 📖 Como Ler

### 1️⃣ Para entender O QUE será feito
👉 **Leia:** `PLANO_AMBIENTES_DEV_PROD.md` (seção "Objetivo")

### 2️⃣ Para entender COMO implementar
👉 **Leia:** `PLANO_AMBIENTES_DEV_PROD.md` (seções "Checklist")

### 3️⃣ Para entender QUANTO tempo leva
👉 **Leia:** `PLANO_AMBIENTES_DEV_PROD.md` (seção "Próximos Passos")

### 4️⃣ Para ver o que foi feito HOJE
👉 **Leia:** `RESUMO_SESSAO_28NOV2025_AMBIENTES.md`

---

## 🎯 Estrutura Proposta (Visual)

```
┌─────────────────────────────────────────┐
│  🔴 PRODUCTION                          │
│                                         │
│  Branch: main                           │
│  URL: atherarun.com                     │
│  Database: Neon Production              │
│  Strava: Production App                 │
│  Stripe: Live Keys                      │
│                                         │
│  ✅ Usuários reais                      │
│  ✅ Dados reais                         │
│  ✅ Pagamentos reais                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🟢 DEVELOPMENT                         │
│                                         │
│  Branch: develop                        │
│  URL: athera-run.vercel.app             │
│  Database: Neon Development (NOVO)      │
│  Strava: Development App (NOVO)         │
│  Stripe: Test Keys                      │
│                                         │
│  ✅ Testes seguros                      │
│  ✅ Dados de teste                      │
│  ✅ Sem afetar produção                 │
│  ✅ Badge "🚧 DEVELOPMENT"              │
└─────────────────────────────────────────┘
```

---

## ⏱️ Tempo Estimado

| Fase | Tempo | O que fazer |
|------|-------|-------------|
| **1. Preparação** | 15 min | Criar branch + banco Neon Dev |
| **2. Vercel** | 20 min | Configurar environment variables |
| **3. Strava** | 30 min | Criar app development |
| **4. Código** | 15 min | Ajustes mínimos (badge, config) |
| **5. Deploy** | 10 min | Primeiro teste |
| **TOTAL** | **1h30min** | Implementação completa |

---

## 🔒 Segurança (Garantida)

✅ **NENHUMA credencial** será commitada  
✅ **Todas variáveis** ficam apenas no Vercel  
✅ **Bancos separados** (zero risco de corromper produção)  
✅ **Apps Strava separados** (callbacks diferentes)  
✅ **Secrets diferentes** por ambiente  

---

## 🚀 Para Começar (quando aprovado)

### Passo 1: Criar Branch
```bash
git checkout -b develop
git push origin develop
```

### Passo 2: Criar Banco Dev
1. Acessar https://console.neon.tech
2. Criar novo projeto: `athera-run-dev`
3. Copiar connection string

### Passo 3: Configurar Vercel
1. Settings → Git → Production Branch: `main`
2. Settings → Environment Variables → Separar Production/Preview

### Passo 4: Validar
- [ ] athera-run.vercel.app acessível
- [ ] Badge "🚧 DEVELOPMENT" aparece
- [ ] Banco dev conectado

---

## ❓ FAQ Rápido

**P: Preciso de dois bancos mesmo?**  
R: ✅ Sim, para não misturar dados de teste com produção

**P: Vou perder os dados de produção?**  
R: ❌ Não, zero risco. Ambientes totalmente isolados.

**P: Quanto custa o banco dev no Neon?**  
R: 💰 Free tier (0.5 GB incluso no plano gratuito)

**P: E se algo der errado?**  
R: 🔄 Branch `main` não será tocada. Produção segura.

**P: Como promovo código de dev para prod?**  
R: 🔀 Merge da branch `develop` → `main` (com PR)

---

## 📊 O Que Foi Feito Hoje

✅ Análise da viabilidade  
✅ Criação do plano completo  
✅ Documentação de 5 fases  
✅ Atualização CONTEXTO.md  
✅ Atualização CHANGELOG.md  
✅ Atualização README.md  

❌ **Zero mudanças no código** de produção  
❌ **Zero commits** na branch main  

---

## 🎯 Próxima Ação

**AGUARDANDO APROVAÇÃO** para executar implementação

Quando aprovado, começar pela **Fase 1** (criar branch + banco dev)

---

## 📞 Precisa de Ajuda?

1. 📘 **Dúvidas gerais:** Ler `PLANO_AMBIENTES_DEV_PROD.md`
2. 🔧 **Dúvidas técnicas:** Ver seção "FAQ" no plano
3. 📊 **Ver resumo:** Ler `RESUMO_SESSAO_28NOV2025_AMBIENTES.md`

---

**Status:** 📋 PLANEJAMENTO 100% COMPLETO  
**Aprovação:** ⏳ AGUARDANDO  
**Implementação:** 🚀 PRONTA (após OK)
