# ⚠️ CONTEXTO DE DEPLOYMENT - LEIA SEMPRE!

**Data de criação:** 01/11/2025  
**Última atualização:** 01/11/2025 21:18 UTC

---

## 🖥️ AMBIENTE DE PRODUÇÃO

### ⚠️ IMPORTANTE - MUDANÇA CRÍTICA:

```
🚀 AGORA USAMOS VERCEL!
✅ Deploy automático via GitHub
✅ Git push atualiza aplicação automaticamente
❌ NÃO USAMOS MAIS PM2
❌ NÃO fazemos build local
```

### Configuração Atual:

- **Plataforma:** Vercel (deploy automático)
- **Repositório:** github.com/maurillio/athera-run
- **Branch:** main
- **Root Directory:** nextjs_space
- **Deploy:** Automático a cada push no GitHub
- **Build:** Feito pelo Vercel (não local)

### ❗ NUNCA MAIS:

```
❌ PM2 - NÃO USAMOS MAIS
❌ Build local - Vercel faz isso
❌ npm run start local - Não é necessário
❌ Deploy manual - Tudo automático agora
```

---

## 🔄 PROCESSO DE DEPLOY (VERCEL)

### ✅ Deploy Automático - Novo Workflow:

```bash
# 1. Fazer mudanças localmente
# Editar arquivos normalmente

# 2. Commitar mudanças
git add .
git commit -m "sua mensagem"

# 3. Push para GitHub
git push origin main

# 4. PRONTO! Vercel faz o resto automaticamente:
#    - Detecta o push
#    - Instala dependências
#    - Faz build
#    - Deploy em produção (2-5 min)
```

### 📊 Monitorar Deploy:

1. Acessar: https://vercel.com/dashboard
2. Ver status do deployment em tempo real
3. Verificar logs se houver erro
4. Testar aplicação após deploy

### ⚠️ NÃO É MAIS NECESSÁRIO:

- ❌ Build local
- ❌ PM2 restart
- ❌ npm install manual
- ❌ Deploy manual

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

## 📊 VERCEL - COMANDOS E MONITORAMENTO

### Dashboard Vercel:
- **URL:** https://vercel.com/dashboard
- **Projeto:** athera-run
- **Status:** Deploy automático ativo

### Verificar Status:
```bash
# Ver deployments recentes (se tiver CLI instalado)
vercel ls

# Ou acessar dashboard web
# https://vercel.com/dashboard
```

### Ver Logs:
- Acessar Vercel Dashboard
- Clicar no deployment
- Ver logs completos do build
- Ver logs de runtime (se houver erros)

### ⚠️ PM2 NÃO É MAIS USADO
```
Todos os comandos PM2 foram substituídos pelo Vercel.
Não há mais necessidade de gerenciar processos localmente.
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

## ⚠️ LEMBRETES IMPORTANTES (VERCEL)

1. ✅ **SEMPRE** testar com `npm run dev` antes de commitar
2. ✅ **SEMPRE** verificar logs no Vercel Dashboard após deploy
3. ✅ **SEMPRE** testar aplicação após deploy
4. ✅ **Vercel faz build automaticamente** - não precisa fazer local
5. ❌ **NUNCA** commitar arquivos .env ou secrets
6. ❌ **NUNCA** tentar fazer build local para produção
7. ❌ **NUNCA** usar PM2 - não existe mais no workflow

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
