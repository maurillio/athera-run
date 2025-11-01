# 🚀 GUIA DE SETUP VERCEL - PASSO A PASSO

**Tempo estimado:** 10-15 minutos  
**Dificuldade:** ⭐ Fácil

---

## �� PRÉ-REQUISITOS

- [x] Código no GitHub (já está!)
- [x] Conta Google/GitHub (você já tem)
- [ ] Conta Vercel (vamos criar)

---

## 🎯 PASSO A PASSO

### 1. Criar Conta no Vercel (2 min)

1. Acesse: **https://vercel.com/signup**
2. Clique em **"Continue with GitHub"**
3. Faça login com sua conta GitHub
4. Autorize o Vercel

✅ **Conta criada!**

---

### 2. Importar Repositório (1 min)

1. Na dashboard do Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Clique em **"Import Git Repository"**
4. Procure por: **athera-run**
5. Clique em **"Import"**

✅ **Repositório importado!**

---

### 3. Configurar Projeto (3 min)

Na tela de configuração:

#### Framework Preset:
- Selecione: **Next.js**

#### Root Directory:
- Defina como: **nextjs_space**
  *(IMPORTANTE: não deixe vazio!)*

#### Build and Output Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install --legacy-peer-deps`

✅ **Configurações definidas!**

---

### 4. Adicionar Variáveis de Ambiente (5 min)

Na seção **"Environment Variables"**, adicione TODAS as variáveis do seu .env:

```env
DATABASE_URL=postgresql://maratona_user:MRT2025_Secure!Pass@<SEU_IP_PUBLICO>:5432/maratona

NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://seu-projeto.vercel.app

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=https://seu-projeto.vercel.app/api/strava/callback
STRAVA_VERIFY_TOKEN=your_webhook_verify_token

OPENAI_API_KEY=your_openai_api_key
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ANNUAL=price_your_annual_price_id

NODE_ENV=production
```

⚠️ **IMPORTANTE:** 
- Troque `<SEU_IP_PUBLICO>` pelo IP público do servidor onde está o PostgreSQL
- Depois do deploy, atualize `NEXTAUTH_URL` e `STRAVA_REDIRECT_URI` com o domínio do Vercel

✅ **Variáveis configuradas!**

---

### 5. Deploy! (2 min)

1. Clique no botão **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ **Deploy concluído!**

Você verá uma URL como: **https://athera-run-xxxx.vercel.app**

---

### 6. Configurar Domínio Personalizado (OPCIONAL - 5 min)

Se quiser usar atherarun.com no Vercel:

1. No projeto Vercel, vá em **"Settings" > "Domains"**
2. Adicione: **atherarun.com**
3. Vercel mostrará registros DNS para configurar
4. Adicione esses registros no Cloudflare:
   - Tipo: **CNAME**
   - Nome: **@** (ou www)
   - Valor: **cname.vercel-dns.com**
5. Aguarde propagação (~5-10 min)

✅ **Domínio configurado!**

---

## 🔄 ATUALIZAÇÕES FUTURAS

Vercel faz deploy automático a cada push no GitHub! 🎉

```bash
git add .
git commit -m "feat: nova feature"
git push origin main
# Vercel faz deploy automaticamente!
```

---

## ⚠️ IMPORTANTE: BANCO DE DADOS

O PostgreSQL está no servidor local. Para Vercel acessar:

**OPÇÃO A:** Permitir acesso externo ao PostgreSQL
```bash
# Editar postgresql.conf
listen_addresses = '*'

# Editar pg_hba.conf
host all all 0.0.0.0/0 md5

# Reiniciar
sudo systemctl restart postgresql
```

**OPÇÃO B:** Migrar para banco em nuvem (RECOMENDADO)
- Supabase (PostgreSQL gerenciado, grátis)
- Neon (PostgreSQL serverless, grátis)
- Railway (PostgreSQL + deploy, fácil)

---

## 📊 COMPARAÇÃO: PM2 vs VERCEL

| Feature | PM2 (Atual) | Vercel |
|---------|-------------|---------|
| Deploy | Manual | Automático |
| Build | Local | Cloud |
| Dependências | Problemático | Funciona |
| SSL | Manual | Automático |
| CDN | Não | Sim (global) |
| Logs | Terminal | Dashboard |
| Rollback | Manual | 1 clique |
| Custo | Servidor | Grátis (hobby) |

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Acessar URL do Vercel
2. ✅ Testar /pricing
3. ✅ Testar /login
4. ✅ Fazer checkout de teste
5. ✅ Configurar webhook do Stripe com nova URL
6. ✅ Atualizar OAuth callbacks (Google, Strava)

---

## 🆘 TROUBLESHOOTING

### Build falhando no Vercel?
- Verificar logs no dashboard
- Conferir variáveis de ambiente
- Verificar Root Directory = nextjs_space

### Erro de conexão com banco?
- Verificar DATABASE_URL
- Confirmar que PostgreSQL aceita conexões externas
- Testar conexão do Vercel para seu IP

### 404 em páginas?
- Verificar se build incluiu as páginas
- Checar logs de build
- Fazer redeploy

---

**🎉 TUDO PRONTO PARA COMEÇAR!**

Siga os passos acima e em 15 minutos terá:
- ✅ Deploy automático
- ✅ HTTPS automático
- ✅ Build funcionando
- ✅ Integração Stripe funcionando
- ✅ Página /pricing no ar!

