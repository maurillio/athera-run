# ⚠️ CONTEXTO DE DEPLOYMENT - LEIA SEMPRE!

**Data de criação:** 01/11/2025  
**Última atualização:** 01/11/2025 15:07 UTC

---

## 🖥️ AMBIENTE DE PRODUÇÃO

### Configuração Atual:

- **Servidor:** Este servidor (/root/athera-run) é o servidor de produção
- **Domínio:** atherarun.com aponta para ESTE servidor
- **Process Manager:** PM2 (não Docker, não Vercel, não Netlify)
- **Modo:** Production (npm run start)
- **Build:** nextjs_space/.next/

### ❗ IMPORTANTE:

```
✅ Estamos NO SERVIDOR DE PRODUÇÃO
❌ NÃO HÁ deploy automático do GitHub
❌ Git push NÃO atualiza a aplicação automaticamente
```

---

## 🔄 PROCESSO DE DEPLOY

### Para atualizar em produção:

```bash
# 1. Pull das mudanças (se necessário)
cd /root/athera-run
git pull origin main

# 2. Instalar dependências (se houver novas)
cd nextjs_space
npm install --legacy-peer-deps

# 3. Fazer build
npm run build

# 4. Reiniciar PM2
pm2 restart athera-run

# 5. Verificar status
pm2 status
pm2 logs athera-run --lines 50
```

### ⚠️ NÃO ESQUECER:

- Build SEMPRE antes de restart
- Verificar logs após restart
- Testar no browser após deploy

---

## 📍 ESTRUTURA DO PROJETO

```
/root/athera-run/                    # Repositório Git
├── nextjs_space/                    # Aplicação Next.js
│   ├── .next/                       # Build de produção (gerado)
│   ├── app/                         # Pages e API routes
│   ├── components/                  # Componentes React
│   ├── lib/                         # Utilities e services
│   ├── prisma/                      # Schema e migrations
│   ├── ecosystem.config.js          # Config do PM2
│   ├── package.json
│   └── .env                         # Variáveis de ambiente
└── [docs]/                          # Documentação
```

---

## 🔧 PM2 - COMANDOS ÚTEIS

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs athera-run

# Reiniciar
pm2 restart athera-run

# Stop/Start
pm2 stop athera-run
pm2 start athera-run

# Ver informações detalhadas
pm2 show athera-run

# Ver monitoramento
pm2 monit
```

---

## 🗄️ BANCO DE DADOS

- **Tipo:** PostgreSQL local
- **Host:** localhost:5432
- **Database:** maratona
- **Conexão:** Via .env (DATABASE_URL)

### Migrations:

```bash
cd /root/athera-run/nextjs_space
npx prisma db push          # Aplicar mudanças no schema
npx prisma generate         # Gerar Prisma Client
npx prisma studio           # Abrir interface visual
```

---

## 🌐 DOMÍNIO E DNS

- **Domínio:** atherarun.com
- **Registro:** GoDaddy
- **DNS:** Cloudflare
- **SSL:** Cloudflare (proxy)
- **IP do servidor:** Apontado via Cloudflare

---

## 🔐 VARIÁVEIS DE AMBIENTE

**Localização:** `/root/athera-run/nextjs_space/.env`

### Principais variáveis:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://atherarun.com

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback

# OpenAI
OPENAI_API_KEY=...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini

# Stripe (TEST MODE)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

NODE_ENV=production
```

⚠️ **Nunca commitar o .env real!**

---

## 🐛 TROUBLESHOOTING

### Build falhando:

```bash
# 1. Limpar cache e reinstalar
cd /root/athera-run/nextjs_space
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run build

# 2. Verificar dependências específicas
npm list tailwindcss
npm list @prisma/client
```

### PM2 não reiniciando:

```bash
pm2 delete athera-run
pm2 start ecosystem.config.js
```

### Página dando 404:

- Verificar se build incluiu a página
- Verificar logs do PM2
- Verificar se .next/ existe

---

## 📊 MONITORAMENTO

### Status da aplicação:

```bash
# CPU e Memória
pm2 monit

# Logs em tempo real
pm2 logs athera-run --lines 100

# Uptime e restarts
pm2 status
```

### Health checks:

```bash
# Verificar se está respondendo
curl -I https://atherarun.com

# Verificar rotas específicas
curl -I https://atherarun.com/api/health
curl -I https://atherarun.com/pricing
```

---

## 🚀 WORKFLOW TÍPICO DE DESENVOLVIMENTO

1. **Fazer mudanças** no código
2. **Testar localmente** (npm run dev em outra porta)
3. **Commitar** e fazer push para GitHub
4. **No servidor de produção:**
   ```bash
   cd /root/athera-run
   git pull origin main
   cd nextjs_space
   npm install --legacy-peer-deps  # se houver deps novas
   npm run build
   pm2 restart athera-run
   pm2 logs athera-run --lines 50
   ```
5. **Testar** em https://atherarun.com

---

## ⚠️ LEMBRETES IMPORTANTES

1. ✅ **SEMPRE** fazer build antes de restart
2. ✅ **SEMPRE** verificar logs após restart
3. ✅ **SEMPRE** testar no browser após deploy
4. ❌ **NUNCA** fazer git pull sem backup
5. ❌ **NUNCA** fazer npm install sem --legacy-peer-deps
6. ❌ **NUNCA** commitar arquivos .env ou secrets

---

## 📝 HISTÓRICO DE DEPLOYS

### 01/11/2025 - Integração Stripe
- ✅ Adicionada integração completa do Stripe
- ✅ Página /pricing criada
- ✅ Fix login "Carregando..."
- ⚠️ Build falhando por problema de dependências
- Status: Aguardando correção de build

---

## 🆘 CONTATOS E RECURSOS

- **Repositório:** https://github.com/maurillio/athera-run
- **Documentação Stripe:** STRIPE_INTEGRATION_COMPLETA.md
- **Roadmap:** ROADMAP_MONETIZACAO_E_MOBILE.md
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/

---

**🎯 RESUMO PARA SEMPRE LEMBRAR:**

```
ESTE É O SERVIDOR DE PRODUÇÃO!
PM2 roda a aplicação em modo production.
Deploy = git pull + npm build + pm2 restart
Não há automação de deploy.
```
