# 🔧 Configurar Stripe Customer Portal

## ❌ Problema Identificado

```
No configuration provided and your test mode default configuration 
has not been created.
```

O botão "Gerenciar Assinatura" não funciona porque o **Stripe Customer Portal** não está configurado.

---

## ✅ Solução: Configurar Portal no Stripe Dashboard

### Passo 1: Acessar Configurações do Portal

1. Acesse: https://dashboard.stripe.com/test/settings/billing/portal
2. Ou manualmente:
   - Vá para o [Stripe Dashboard](https://dashboard.stripe.com)
   - Clique em **Settings** (canto superior direito)
   - No menu lateral, procure **"Billing"**
   - Clique em **"Customer Portal"**

### Passo 2: Ativar o Portal

Na página do Customer Portal, você verá:

```
┌─────────────────────────────────────────────────┐
│  Customer portal                                │
│                                                 │
│  Let customers manage their subscriptions       │
│  and billing details                            │
│                                                 │
│  [Activate test mode link]                     │
└─────────────────────────────────────────────────┘
```

Clique em **"Activate test mode link"**

### Passo 3: Configurar Funcionalidades

Marque as opções que deseja permitir:

#### ✅ Recomendado Ativar:

- **✓ Cancel subscriptions** - Permitir cancelar assinatura
- **✓ Update payment methods** - Atualizar cartão de crédito
- **✓ Update billing email** - Atualizar email de cobrança
- **✓ View invoice history** - Ver histórico de faturas

#### Configurações de Cancelamento:

- **Cancellation behavior:**
  - ☑️ Cancel at period end (Recomendado)
  - ☐ Cancel immediately

- **Cancellation survey:**
  - ☑️ Ask customers why they're canceling (Opcional)

### Passo 4: Configurar Aparência (Opcional)

- **Business name:** Athera Run
- **Brand color:** #10b981 (verde do tema)
- **Logo:** Upload do logo da Athera (opcional)

### Passo 5: Salvar Configuração

Clique em **"Save"** ou **"Activate"**

---

## 🧪 Testar Após Configuração

1. Aguarde alguns segundos para Stripe processar
2. Acesse: https://atherarun.com/api/stripe/test-portal
3. Deve retornar: `"success": true`
4. Teste o botão "Gerenciar" em: https://atherarun.com/subscription

---

## 🔄 Repetir para Produção

Quando for lançar em produção:

1. Acesse: https://dashboard.stripe.com/settings/billing/portal
2. Repita os mesmos passos acima
3. Ative o Customer Portal em **modo LIVE**

---

## 📋 Checklist

- [ ] Acessar Stripe Dashboard → Settings → Billing → Customer Portal
- [ ] Clicar em "Activate test mode link"
- [ ] Marcar opções de cancelamento e atualização
- [ ] Definir "Cancel at period end"
- [ ] Salvar configuração
- [ ] Testar endpoint: `/api/stripe/test-portal`
- [ ] Testar botão "Gerenciar" na página `/subscription`

---

## 💡 Dica

O Customer Portal é uma página hospedada pelo Stripe onde os usuários podem:
- Ver detalhes da assinatura
- Atualizar forma de pagamento
- Ver faturas anteriores
- Cancelar assinatura
- Atualizar email de cobrança

É totalmente gerenciado pelo Stripe, você só precisa ativar! 🎉

---

**Status:** 🔴 Aguardando ativação no Stripe Dashboard  
**Link direto:** https://dashboard.stripe.com/test/settings/billing/portal
