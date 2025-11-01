# 🧪 GUIA DE TESTE DO STRIPE - ATHERA RUN

**Data:** 01/11/2025  
**Status:** ✅ Pronto para testar

---

## ✅ CONFIGURAÇÃO ATUAL

### Variáveis Configuradas no Vercel:
```
✅ STRIPE_SECRET_KEY=sk_test_51SOetzRpe0rXdwl5...
✅ STRIPE_PUBLISHABLE_KEY=pk_test_51SOetzRpe0rXdwl5...
✅ STRIPE_WEBHOOK_SECRET=whsec_4mx4SJNjHRDWi8klPRFq9oeDIvp9iFRg
✅ STRIPE_PRICE_MONTHLY=price_1SOfU1Rpe0rXdwl5Ds0rnnfo
✅ STRIPE_PRICE_ANNUAL=price_1SOfUVRpe0rXdwl5uOnZa3Wc
```

### Endpoints Implementados:
```
✅ GET  /pricing - Página de planos
✅ POST /api/stripe/create-checkout-session - Criar checkout
✅ POST /api/stripe/create-portal-session - Portal do cliente
✅ POST /api/stripe/webhook - Receber eventos do Stripe
✅ GET  /api/subscription/status - Status da assinatura
```

---

## 🧪 PASSO A PASSO PARA TESTAR

### **Teste 1: Página de Pricing**

1. Acesse: https://atherarun.com/pricing
2. Você deve ver 3 cards:
   - Free (gratuito)
   - Premium Mensal (R$ 29,90/mês)
   - Premium Anual (R$ 159,90/ano - 55% OFF)

✅ **Resultado esperado:** Página carrega sem erros

---

### **Teste 2: Fluxo de Checkout (Premium Mensal)**

1. Faça **login** na aplicação
2. Vá em: https://atherarun.com/pricing
3. Clique em **"Começar Trial de 7 Dias"** no card Premium Mensal
4. Você será redirecionado para o Stripe Checkout
5. **Preencha os dados:**
   - Email: qualquer email
   - Cartão: `4242 4242 4242 4242`
   - Data: qualquer data futura (ex: 12/25)
   - CVV: qualquer 3 dígitos (ex: 123)
   - Nome: qualquer nome
6. Complete o pagamento
7. Você será redirecionado para: `https://atherarun.com/dashboard?success=true`

✅ **Resultado esperado:** 
- Checkout completo com sucesso
- Usuário redirecionado para dashboard
- Mensagem de sucesso exibida

---

### **Teste 3: Verificar Assinatura Criada**

**No Stripe Dashboard:**
1. Acesse: https://dashboard.stripe.com/test/subscriptions
2. Você deve ver a assinatura criada
3. Status: `Active` ou `Trialing` (se tiver trial)

**Na Aplicação:**
1. Estando logado, verifique se aparece badge/indicação Premium
2. Acesse funcionalidades Premium (se houver)

✅ **Resultado esperado:**
- Assinatura aparece no Stripe
- Usuário tem acesso Premium na aplicação

---

### **Teste 4: Webhook Funcionando**

**Verificar no Stripe:**
1. Vá em: https://dashboard.stripe.com/test/webhooks
2. Clique no webhook configurado
3. Vá na aba **"Recent Events"**
4. Você deve ver eventos recebidos com sucesso (200 OK)

✅ **Resultado esperado:**
- Eventos `checkout.session.completed` com status 200
- Eventos processados sem erros

---

### **Teste 5: Customer Portal (Gerenciar Assinatura)**

1. Estando logado e com assinatura ativa
2. Acesse perfil ou configurações
3. Clique em **"Gerenciar Assinatura"**
4. Você será redirecionado para o Stripe Customer Portal
5. Lá você pode:
   - Ver detalhes da assinatura
   - Atualizar forma de pagamento
   - Cancelar assinatura
   - Ver faturas

✅ **Resultado esperado:**
- Portal abre corretamente
- Informações da assinatura aparecem

---

### **Teste 6: Cancelamento**

**No Customer Portal:**
1. Acesse o portal (teste 5)
2. Clique em **"Cancel subscription"**
3. Escolha cancelar ao final do período ou imediatamente
4. Confirme

**Verifique:**
- No Stripe Dashboard, status muda para `Canceled` ou `Active (cancels at period end)`
- Na aplicação, usuário perde acesso Premium (se cancelou imediatamente)

✅ **Resultado esperado:**
- Cancelamento processado
- Status atualizado corretamente

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to create checkout session"
**Solução:**
- Verifique se `STRIPE_PRICE_MONTHLY` e `STRIPE_PRICE_ANNUAL` estão corretos
- Confirme que os Price IDs existem no Stripe Dashboard

### Erro: "Webhook signature verification failed"
**Solução:**
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que o endpoint está cadastrado no Stripe

### Checkout não redireciona de volta
**Solução:**
- Verifique se as URLs de sucesso/cancelamento estão corretas no código
- Confirme que o domínio está autorizado no Stripe

### Assinatura não aparece no banco
**Solução:**
- Verifique se o webhook está recebendo eventos
- Cheque logs do webhook no Stripe Dashboard
- Verifique conexão com banco de dados

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTES

### 1. **Modo Produção**
Quando estiver tudo funcionando em TEST:

1. No Stripe Dashboard, mude para modo **LIVE**
2. Crie novamente os produtos (Monthly e Annual)
3. Atualize as variáveis no Vercel com chaves LIVE:
   - `sk_live_...` (Secret Key)
   - `pk_live_...` (Publishable Key)
   - Novos Price IDs
   - Novo Webhook Secret

### 2. **Adicionar Features Premium na Aplicação**
- Bloquear features para usuários Free
- Mostrar badge Premium
- Adicionar botão "Upgrade" para usuários Free

### 3. **Emails e Notificações**
- Email de boas-vindas após assinatura
- Lembretes antes do fim do trial
- Notificações de pagamento

### 4. **Analytics**
- Rastrear conversões
- Monitorar churn
- Análise de revenue

---

## 📊 CARTÕES DE TESTE DO STRIPE

| Situação | Número do Cartão | Resultado |
|----------|-----------------|-----------|
| **Sucesso** | 4242 4242 4242 4242 | Pagamento aprovado |
| **Declined** | 4000 0000 0000 0002 | Pagamento recusado |
| **Insufficient Funds** | 4000 0000 0000 9995 | Saldo insuficiente |
| **3D Secure** | 4000 0027 6000 3184 | Requer autenticação |

**Todos os cartões:**
- Data: Qualquer data futura
- CVV: Qualquer 3 dígitos
- CEP: Qualquer CEP válido

---

## 🔗 LINKS ÚTEIS

- **Stripe Dashboard (Test):** https://dashboard.stripe.com/test/dashboard
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Customers:** https://dashboard.stripe.com/test/customers
- **Subscriptions:** https://dashboard.stripe.com/test/subscriptions
- **Logs:** https://dashboard.stripe.com/test/logs

---

## ✅ CHECKLIST FINAL

Antes de ir para produção:

- [ ] Teste completo de checkout funcionando
- [ ] Webhook recebendo eventos corretamente
- [ ] Dados salvando no banco
- [ ] Customer Portal funcionando
- [ ] Cancelamento funcionando
- [ ] Interface mostrando status Premium
- [ ] Emails configurados (opcional)
- [ ] Produtos criados no modo LIVE
- [ ] Variáveis atualizadas para LIVE
- [ ] Testado com cartão real (pequeno valor)

---

**Dúvidas ou problemas?**
- Email: mmaurillio2@gmail.com
- Docs Stripe: https://stripe.com/docs
