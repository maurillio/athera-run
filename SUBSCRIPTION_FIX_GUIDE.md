# 🔧 GUIA DE CORREÇÃO - SUBSCRIPTION E LOGIN

**Data:** 01/11/2025 21:25 UTC  
**Usuário:** mmaurillio2@gmail.com

---

## 📊 DIAGNÓSTICO

### ✅ O que está FUNCIONANDO:
- isPremium: `true` ✅
- Subscription Status: `ACTIVE` ✅
- Plan: `PREMIUM_ANNUAL` ✅
- Stripe Customer ID: `cus_TLQNdenKg5e0WH` ✅
- Stripe Subscription ID: `sub_1SOmE1Rpe0rXdwl5yAFDbuYc` ✅
- Google OAuth: Configurado ✅

### ⚠️ PROBLEMAS IDENTIFICADOS:

#### 1. Login com Google não funciona
**Causa possível:**
- NEXTAUTH_URL pode estar com URL errada
- Callback do Google pode estar configurado para URL antiga

#### 2. stripeCurrentPeriodEnd está NULL
**Impacto:** Baixo (subscription está ativa)
**Necessita:** Atualização no banco

---

## 🔧 SOLUÇÕES

### 1. Corrigir NEXTAUTH_URL no Vercel

1. Acessar Vercel Dashboard: https://vercel.com/dashboard
2. Ir em Settings > Environment Variables
3. Verificar/Atualizar:
   ```
   NEXTAUTH_URL=https://SUA-URL-VERCEL.vercel.app
   ```
4. Salvar e fazer redeploy

### 2. Atualizar Google OAuth Callback

1. Acessar: https://console.cloud.google.com/
2. Selecionar projeto
3. APIs & Services > Credentials
4. Editar OAuth 2.0 Client
5. Authorized redirect URIs:
   ```
   https://SUA-URL-VERCEL.vercel.app/api/auth/callback/google
   ```

### 3. Corrigir stripeCurrentPeriodEnd no banco

Execute no servidor:

```bash
cd /root/athera-run/nextjs_space
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  await prisma.subscription.update({
    where: { userId: 'cmhck8yvh00000k8mot91yoje' },
    data: { 
      stripeCurrentPeriodEnd: oneYearFromNow,
      status: 'ACTIVE',
      plan: 'PREMIUM_ANNUAL'
    }
  });
  
  console.log('✅ Subscription atualizada!');
  await prisma.\$disconnect();
})();
"
```

---

## 🎯 PASSOS PARA O USUÁRIO

### Para testar se está Premium:

1. **Fazer logout completo**
   - Clicar em perfil > Logout
   - Ou limpar cookies do browser

2. **Fazer login novamente**
   - Pode usar email/senha ou Google

3. **Verificar Premium Badge**
   - Deve aparecer badge "Premium" no dropdown do usuário
   - Todas as features premium devem estar desbloqueadas

### Para testar Google Login:

1. Ir para /login
2. Clicar em "Login com Google"
3. Se der erro, verificar se NEXTAUTH_URL está correto no Vercel

---

## 📋 VERIFICAÇÕES

### No Stripe Dashboard:
1. Ir para: https://dashboard.stripe.com/test/subscriptions/sub_1SOmE1Rpe0rXdwl5yAFDbuYc
2. Verificar se subscription está ativa
3. Ver data "Current period end"
4. Copiar timestamp e atualizar no banco se necessário

### No Banco de Dados:
```sql
-- Verificar usuário
SELECT id, email, isPremium FROM "User" WHERE email = 'mmaurillio2@gmail.com';

-- Verificar subscription
SELECT * FROM "Subscription" WHERE userId = 'cmhck8yvh00000k8mot91yoje';
```

---

## 🆘 TROUBLESHOOTING

### Problema: "Usuário ainda aparece como FREE"

**Solução:**
1. Verificar se `isPremium = true` no banco
2. Fazer logout e login novamente
3. Limpar cache do browser
4. Verificar se sessão está pegando o valor correto

### Problema: "Google Login dá erro 400"

**Causas possíveis:**
1. NEXTAUTH_URL incorreto no Vercel
2. Callback URL não autorizado no Google Console
3. Client ID/Secret incorretos

**Solução:**
1. Verificar variáveis de ambiente no Vercel
2. Verificar authorized redirect URIs no Google Console
3. Fazer redeploy no Vercel após mudanças

### Problema: "Session não persiste"

**Solução:**
1. Verificar se NEXTAUTH_SECRET está configurado
2. Verificar cookies no browser (não pode ter SameSite=Strict)
3. Limpar todos os cookies do site
4. Fazer login novamente

---

## ✅ CHECKLIST FINAL

Após correções, verificar:

- [ ] isPremium = true no banco
- [ ] Subscription status = ACTIVE
- [ ] stripeCurrentPeriodEnd tem data válida
- [ ] NEXTAUTH_URL correto no Vercel
- [ ] Google OAuth callback configurado
- [ ] Usuário consegue fazer login com Google
- [ ] Badge Premium aparece após login
- [ ] Features premium estão desbloqueadas

---

## 📊 DADOS DO USUÁRIO

```json
{
  "email": "mmaurillio2@gmail.com",
  "userId": "cmhck8yvh00000k8mot91yoje",
  "isPremium": true,
  "stripeCustomerId": "cus_TLQNdenKg5e0WH",
  "stripeSubscriptionId": "sub_1SOmE1Rpe0rXdwl5yAFDbuYc",
  "plan": "PREMIUM_ANNUAL",
  "status": "ACTIVE"
}
```

---

**Criado em:** 01/11/2025 21:25 UTC  
**Última atualização:** 01/11/2025 21:25 UTC
