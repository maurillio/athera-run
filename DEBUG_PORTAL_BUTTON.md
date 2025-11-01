# 🐛 DEBUG: Botão Gerenciar Assinatura

**Data:** 01/11/2025 21:48 UTC  
**Problema:** Botão não funciona

---

## 🔍 POSSÍVEIS CAUSAS

### 1. **Stripe não configurado no Vercel**
   - STRIPE_SECRET_KEY não está nas variáveis de ambiente
   - STRIPE_WEBHOOK_SECRET incorreto

### 2. **Customer ID não existe**
   - Subscription tem `stripeCustomerId` null
   - Usuário não foi criado no Stripe corretamente

### 3. **Stripe API com erro**
   - Secret key inválida
   - API retornando erro

### 4. **JavaScript não executando**
   - Erro de console bloqueando
   - Event listener não atachado

---

## 🧪 TESTES PARA FAZER

### Teste 1: Verificar console do navegador

```
1. Abrir site: https://atherarun.com/subscription
2. Pressionar F12 (abre DevTools)
3. Ir na aba "Console"
4. Clicar em "Gerenciar Assinatura"
5. Ver logs:

Esperado:
[Card] Tentando abrir portal...
[Card] Response status: 200
[Card] Portal URL recebida: https://...

Se aparecer erro:
[Card] Response status: 400/500
[Card] Erro da API: {...}
```

### Teste 2: Verificar Network

```
1. F12 → aba "Network"
2. Clicar no botão
3. Procurar requisição: create-portal-session
4. Ver detalhes:
   - Status: 200? 400? 500?
   - Response: {...}
   - Headers: {...}
```

### Teste 3: Verificar banco de dados

```sql
SELECT 
  u.email,
  s.stripeCustomerId,
  s.stripeSubscriptionId,
  s.status
FROM "User" u
JOIN "Subscription" s ON u.id = s.userId
WHERE u.email = 'mmaurillio2@gmail.com';
```

Deve retornar:
- stripeCustomerId: `cus_TLQNdenKg5e0WH` ✅
- stripeSubscriptionId: `sub_...` ✅
- status: `TRIAL` ✅

---

## 🔧 SOLUÇÕES POSSÍVEIS

### Solução 1: Verificar variáveis Vercel

```bash
# No Vercel Dashboard:
Settings → Environment Variables

Verificar se existem:
✅ STRIPE_SECRET_KEY
✅ STRIPE_PUBLISHABLE_KEY
✅ STRIPE_WEBHOOK_SECRET
✅ NEXTAUTH_URL
```

### Solução 2: Adicionar botão de debug

Criar um botão que mostra o erro na tela:

```typescript
<Button onClick={async () => {
  const response = await fetch('/api/stripe/create-portal-session', { 
    method: 'POST' 
  });
  const data = await response.json();
  alert(JSON.stringify(data, null, 2));
}}>
  Debug Portal
</Button>
```

### Solução 3: Verificar se Stripe está inicializado

No arquivo `lib/stripe.ts`:
```typescript
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}
```

---

## 📊 CHECKLIST DE DEBUG

- [ ] Console mostra logs quando clica no botão?
- [ ] Network mostra requisição sendo feita?
- [ ] Qual o status code? (200, 400, 500)
- [ ] Qual a mensagem de erro?
- [ ] stripeCustomerId está no banco?
- [ ] STRIPE_SECRET_KEY está no Vercel?
- [ ] Deploy mais recente já está no ar?

---

## 🎯 PRÓXIMOS PASSOS

1. **Abra o console** (F12)
2. **Clique no botão**
3. **Me envie os logs** que aparecerem
4. **Com os logs** vou identificar o problema exato

---

## 💡 WORKAROUND TEMPORÁRIO

Enquanto não funciona, usuário pode:
1. Ir direto no Stripe Dashboard
2. Ou usar link direto:
   ```
   https://billing.stripe.com/p/login/test_...
   ```

---

**Status:** 🟡 Em investigação  
**Prioridade:** Alta  
**Bloqueador:** Sim (usuário não consegue cancelar)

---

## ✅ VERIFICAÇÕES FEITAS

- [x] stripeCustomerId existe: `cus_TLQNdenKg5e0WH`
- [x] Código do botão está correto
- [x] API endpoint está funcionando
- [x] Mensagens de erro melhoradas
- [ ] **Aguardando:** Logs do console do navegador

---

## 🚀 ÚLTIMA ATUALIZAÇÃO (01/11/2025 21:56 UTC)

**Deploy realizado com melhorias:**
- Adicionado Content-Type header na requisição
- Melhorado tratamento de erros
- Mensagens de erro mais claras
- Mais logs para debugging

**Aguardando deploy no Vercel completar...**

Após deploy, testar:
1. Abrir https://atherarun.com/subscription
2. Abrir F12 (Console)
3. Clicar em "Gerenciar Assinatura"
4. Enviar screenshot dos logs
