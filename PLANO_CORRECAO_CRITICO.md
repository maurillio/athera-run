# 🚨 PLANO DE CORREÇÃO CRÍTICA - Sistema i18n

## 📊 SITUAÇÃO ATUAL

**Auditoria completa revelou:**
- **29 arquivos** com problemas de i18n
- **1 arquivo CRÍTICO**: login/page.tsx (navegação de objeto)
- **28 arquivos com fallbacks**: diversos componentes

---

## 🎯 PRIORIDADE 1 - CORRIGIR AGORA (15min)

### app/[locale]/login/page.tsx

**Problema:** Usa `t.auth?.login?.key ||` em TODO o arquivo

**Padrão atual:**
```typescript
const t = useTranslations();
{t.auth?.login?.title || 'Welcome back!'}
```

**Correção:**
```typescript
const t = useTranslations('auth.login');
{t('title')}
```

**Total de linhas a corrigir:** ~50

---

## 📋 PRÓXIMOS ARQUIVOS (Prioridade 2-3)

### Alta Prioridade:
1. app/[locale]/perfil/page.tsx
2. app/[locale]/pricing/page.tsx  
3. app/[locale]/admin/page.tsx

### Média Prioridade:
- APIs (não afetam UI diretamente)
- Libs de serviço

---

## 🔧 SCRIPT DE CORREÇÃO

```bash
# Para cada arquivo:
1. Trocar: const t = useTranslations();
   Por: const t = useTranslations('namespace');

2. Trocar: t.auth?.login?.key || 'fallback'
   Por: t('key')

3. Adicionar keys faltando nas traduções
```

---

## ⏱️ ESTIMATIVA

- Login: 15 minutos
- Perfil: 10 minutos
- Pricing: 10 minutos
- Admin: 10 minutos
- APIs: 30 minutos (opcional)

**Total:** 45-75 minutos

---

## ✅ CHECKLIST

- [ ] Corrigir login/page.tsx
- [ ] Testar login em produção
- [ ] Corrigir perfil/page.tsx
- [ ] Corrigir pricing/page.tsx
- [ ] Corrigir admin/page.tsx
- [ ] Commit e deploy
- [ ] Teste completo

