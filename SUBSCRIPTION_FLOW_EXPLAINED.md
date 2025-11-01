# 🔄 FLUXO DE ASSINATURA - ATHERA RUN

**Data:** 01/11/2025 21:43 UTC

---

## 📋 FLUXO ATUAL (COMO ESTÁ)

### 1. **Usuário clica em "Assinar Premium"**
   - Vai para `/pricing`
   - Escolhe plano: Mensal ou Anual
   - Clica em "Assinar"

### 2. **Checkout do Stripe**
   - Abre página de pagamento do Stripe
   - Usuário preenche dados do cartão
   - **ATENÇÃO:** Não tem trial configurado no checkout!

### 3. **Pagamento confirmado**
   - Stripe envia webhook
   - Sistema cria subscription no banco
   - Status: `ACTIVE` (não `TRIAL`)
   - Usuário já é cobrado imediatamente

### 4. **Portal de Gerenciamento**
   - Usuário pode acessar via botão "Gerenciar Assinatura"
   - Redireciona para Stripe Customer Portal
   - Lá pode:
     - ✅ Cancelar assinatura
     - ✅ Atualizar método de pagamento
     - ✅ Ver histórico de faturas
     - ✅ Atualizar plano (mensal ↔ anual)

---

## 🎯 FLUXO RECOMENDADO (COMO DEVERIA SER)

### Opção 1: Trial de 7 dias (RECOMENDADO)

```
1. Usuário assina
   ↓
2. Checkout com trial_period_days: 7
   ↓
3. Cartão é autorizado MAS não cobrado
   ↓
4. Status: TRIAL por 7 dias
   ↓
5. Após 7 dias → Cobra automaticamente
   ↓
6. Status: ACTIVE
```

**Vantagens:**
- ✅ Menor fricção para conversão
- ✅ Usuário pode testar sem pagar
- ✅ Cancela sem ser cobrado se desistir nos 7 dias
- ✅ Conversão automática após trial

### Opção 2: Pagamento imediato (ATUAL)

```
1. Usuário assina
   ↓
2. Cobra imediatamente
   ↓
3. Status: ACTIVE
   ↓
4. Pode cancelar (mas já foi cobrado)
```

**Desvantagens:**
- ❌ Maior fricção (pagar antes de testar)
- ❌ Menor taxa de conversão
- ✅ Mas recebe pagamento imediatamente

---

## 🔧 O QUE PRECISA MUDAR

### Para implementar Trial de 7 dias:

**1. No checkout (create-checkout-session/route.ts):**

```typescript
const session = await stripe.checkout.sessions.create({
  customer,
  line_items: [{
    price: priceId,
    quantity: 1,
  }],
  mode: 'subscription',
  
  // ADICIONAR ESTAS LINHAS:
  subscription_data: {
    trial_period_days: 7,
    trial_settings: {
      end_behavior: {
        missing_payment_method: 'cancel', // Cancela se não tiver cartão
      },
    },
  },
  
  payment_method_collection: 'always', // Exige cartão no trial
  success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true`,
  cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
});
```

**2. No webhook (webhook/route.ts):**

Já está tratando corretamente os eventos:
- ✅ `customer.subscription.created` → Cria com status TRIAL
- ✅ `customer.subscription.trial_will_end` → Notifica usuário
- ✅ `customer.subscription.updated` → TRIAL → ACTIVE
- ✅ `customer.subscription.deleted` → Cancela

---

## 💳 CANCELAMENTO

### Como o usuário cancela:

1. **Durante o trial (7 dias):**
   - Vai em "Gerenciar Assinatura"
   - Abre portal do Stripe
   - Clica em "Cancelar assinatura"
   - **NÃO É COBRADO** nada
   - Acesso Premium termina no fim do trial

2. **Após o trial (já pagou):**
   - Vai em "Gerenciar Assinatura"
   - Cancela no portal do Stripe
   - **Opções:**
     - Cancelar imediatamente (perde acesso)
     - Cancelar no fim do período (mantém até data de renovação)
   - Não tem reembolso automático

### No sistema:

Quando usuário cancela:
```typescript
// Webhook: customer.subscription.deleted
subscription.status = 'CANCELED'
subscription.cancelAtPeriodEnd = true
user.isPremium = false
```

---

## 🎯 RECOMENDAÇÃO

### Implementar Trial de 7 dias:

**Motivos:**
1. ✅ **Maior conversão** - Pessoas testam sem pagar
2. ✅ **Experiência melhor** - Trial é padrão no mercado
3. ✅ **Menor risco** - Usuário pode cancelar grátis
4. ✅ **Automático** - Stripe gerencia tudo

**Como fazer:**
1. Adicionar `trial_period_days: 7` no checkout
2. Atualizar textos na UI:
   - "Experimente 7 dias grátis"
   - "Cancele quando quiser"
3. Webhook já trata tudo corretamente

---

## 📊 COMPARAÇÃO

| Feature | Sem Trial | Com Trial (7 dias) |
|---------|-----------|-------------------|
| **Conversão** | Média | Alta ✅ |
| **Fricção** | Alta | Baixa ✅ |
| **Receita imediata** | Sim ✅ | Não (7 dias depois) |
| **Chargeback** | Maior risco | Menor risco ✅ |
| **Experiência** | Ruim | Ótima ✅ |
| **Padrão mercado** | Não | Sim ✅ |

---

## ✅ PRÓXIMOS PASSOS

1. **Decidir:** Trial de 7 dias ou pagamento imediato?
2. **Se trial:** Implementar mudanças no checkout
3. **Testar:** Criar assinatura teste e verificar fluxo
4. **Documentar:** Atualizar página de pricing com info do trial

---

## 🔐 SEGURANÇA

### Trial com cartão obrigatório:

**Vantagens:**
- ✅ Evita abuso (não podem criar infinitas contas trial)
- ✅ Conversão automática após trial
- ✅ Menor fraude

**Como funciona:**
1. Usuário precisa cadastrar cartão
2. Cartão é **autorizado** (não cobrado)
3. Trial inicia por 7 dias
4. Se não cancelar → Cobra automaticamente
5. Se cancelar → Não cobra nada

---

**Criado em:** 01/11/2025 21:43 UTC  
**Autor:** GitHub Copilot  
**Status:** 📋 Documentação
