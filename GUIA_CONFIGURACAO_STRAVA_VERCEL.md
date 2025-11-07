# 🔧 GUIA DE CONFIGURAÇÃO - STRAVA NO VERCEL
**Data:** 07/11/2025 20:20  
**Projeto:** Athera Run  
**Versão:** v1.6.3

## 📋 PROBLEMA IDENTIFICADO

```bash
GET https://atherarun.com/api/strava/auth
Response: {
  "error": "Credenciais do Strava não configuradas..."
}
```

**CAUSA:** Variáveis de ambiente do Strava não configuradas no Vercel

---

## 🎯 SOLUÇÃO: 3 MÉTODOS

### MÉTODO 1: Via Interface Web do Vercel (RECOMENDADO)

#### Passo 1: Acessar Dashboard
```
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: atherarun
3. Vá em: Settings → Environment Variables
```

#### Passo 2: Adicionar Variáveis
Adicione **3 variáveis** com os seguintes nomes e valores:

| Nome da Variável | Valor | Environment |
|------------------|-------|-------------|
| `STRAVA_CLIENT_ID` | Seu Client ID do Strava | Production, Preview, Development |
| `STRAVA_CLIENT_SECRET` | Seu Client Secret do Strava | Production, Preview, Development |
| `STRAVA_REDIRECT_URI` | `https://atherarun.com/api/strava/callback` | Production, Preview, Development |

#### Passo 3: Salvar e Redeployar
```
1. Clique em "Save" em cada variável
2. Aguarde a confirmação
3. Vai em: Deployments
4. Clique em "Redeploy" no último deployment
```

---

### MÉTODO 2: Via Vercel CLI

```bash
# 1. Fazer login
vercel login

# 2. Linkar o projeto
cd /root/athera-run
vercel link

# 3. Adicionar variáveis
vercel env add STRAVA_CLIENT_ID production
# Cole o valor quando solicitado

vercel env add STRAVA_CLIENT_SECRET production
# Cole o valor quando solicitado

vercel env add STRAVA_REDIRECT_URI production
# Cole: https://atherarun.com/api/strava/callback

# 4. Adicionar para Preview e Development (opcional)
vercel env add STRAVA_CLIENT_ID preview
vercel env add STRAVA_CLIENT_SECRET preview
vercel env add STRAVA_REDIRECT_URI preview

# 5. Verificar variáveis
vercel env ls

# 6. Redeployar
vercel --prod
```

---

### MÉTODO 3: Via Arquivo .env no Projeto

#### ⚠️ ATENÇÃO: NÃO COMMITAR ARQUIVO .env COM SECRETS

```bash
# 1. Criar .env.local (já existe)
cd /root/athera-run

# 2. Adicionar variáveis
cat >> .env.local << 'EOF'

# Strava OAuth
STRAVA_CLIENT_ID=seu_client_id_aqui
STRAVA_CLIENT_SECRET=seu_client_secret_aqui
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
EOF

# 3. VERIFICAR .gitignore
grep -E "\.env|\.env\.local" .gitignore

# 4. Deploy (Vercel vai ler do dashboard)
git add app/
git commit -m "fix: Strava OAuth configuration"
git push
```

---

## 📝 ONDE OBTER AS CREDENCIAIS DO STRAVA

### Criar Aplicação no Strava

1. **Acessar Portal de Desenvolvedores:**
   ```
   https://www.strava.com/settings/api
   ```

2. **Criar Aplicação:**
   - Nome: "Athera Run"
   - Website: https://atherarun.com
   - Authorization Callback Domain: `atherarun.com`
   
3. **Anotar Credenciais:**
   ```
   Client ID: 12345
   Client Secret: abc123def456...
   ```

4. **Configurar Callback URL:**
   ```
   https://atherarun.com/api/strava/callback
   ```

---

## ✅ VERIFICAÇÃO

### Teste 1: Verificar Variáveis no Vercel
```bash
vercel env ls

# Deve mostrar:
# STRAVA_CLIENT_ID        Production, Preview, Development
# STRAVA_CLIENT_SECRET    Production, Preview, Development
# STRAVA_REDIRECT_URI     Production, Preview, Development
```

### Teste 2: Testar Endpoint
```bash
# Deve redirecionar para Strava OAuth
curl -I https://atherarun.com/api/strava/auth

# Resposta esperada:
# HTTP/2 307
# Location: https://www.strava.com/oauth/authorize?client_id=...
```

### Teste 3: Verificar Logs
```bash
vercel logs --prod

# Procurar por:
# [STRAVA AUTH] Verificando variáveis de ambiente: { hasClientId: true, ... }
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Credenciais não configuradas"

**Solução:**
```bash
# 1. Verificar se variáveis existem
vercel env ls | grep STRAVA

# 2. Se não existirem, adicionar
vercel env add STRAVA_CLIENT_ID production
vercel env add STRAVA_CLIENT_SECRET production
vercel env add STRAVA_REDIRECT_URI production

# 3. Forçar redeploy
vercel --prod --force
```

### Erro: "Invalid client credentials"

**Causa:** Client ID ou Secret incorretos

**Solução:**
```bash
# 1. Verificar no Strava
# https://www.strava.com/settings/api

# 2. Remover variáveis antigas
vercel env rm STRAVA_CLIENT_ID production
vercel env rm STRAVA_CLIENT_SECRET production

# 3. Adicionar novamente com valores corretos
vercel env add STRAVA_CLIENT_ID production
vercel env add STRAVA_CLIENT_SECRET production

# 4. Redeploy
vercel --prod
```

### Erro: "Redirect URI mismatch"

**Causa:** URI de callback não autorizada no Strava

**Solução:**
```
1. Acessar: https://www.strava.com/settings/api
2. Ir em sua aplicação
3. Em "Authorization Callback Domain", adicionar:
   - atherarun.com
4. Salvar
5. Aguardar 5 minutos para propagação
```

---

## 📊 CHECKLIST DE DEPLOY

- [ ] Variáveis adicionadas no Vercel
- [ ] Verificado com `vercel env ls`
- [ ] Redeploy realizado
- [ ] Teste: `curl -I https://atherarun.com/api/strava/auth`
- [ ] Logs verificados: `vercel logs --prod`
- [ ] Callback Domain configurado no Strava
- [ ] Teste E2E: conectar Strava via UI

---

## 🔐 SEGURANÇA

### ✅ Boas Práticas
```bash
# NUNCA commitar secrets
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore

# Usar variáveis de ambiente do Vercel
# Rotacionar secrets periodicamente
# Limitar escopos do OAuth (apenas read,activity:read_all)
```

### ❌ NÃO FAZER
```bash
# NÃO commitar:
git add .env.local  # ❌
git commit -m "Add env vars"  # ❌

# NÃO colocar secrets em:
# - Código fonte
# - Comentários
# - Logs públicos
# - Issues do GitHub
```

---

## 📞 PRÓXIMOS PASSOS

1. **IMEDIATO** (5min):
   ```bash
   # Adicionar variáveis no Vercel (Método 1 ou 2)
   ```

2. **TESTE** (2min):
   ```bash
   # Testar OAuth
   # Abrir: https://atherarun.com/api/strava/auth
   ```

3. **VALIDAÇÃO** (3min):
   ```bash
   # Conectar conta Strava via UI
   # Importar atividades
   # Verificar sincronização
   ```

---

## 📄 ARQUIVOS RELACIONADOS

```
app/api/strava/auth/route.ts         ✅ Corrigido
app/api/strava/callback/route.ts     ✅ OK
lib/strava.ts                        ✅ OK
.env.local                           ⚠️ Não commitar
```

---

## 🎯 RESULTADO ESPERADO

### Antes:
```json
GET /api/strava/auth
{
  "error": "Credenciais do Strava não configuradas..."
}
```

### Depois:
```
HTTP/2 307
Location: https://www.strava.com/oauth/authorize?client_id=12345&...
```

---

## 💡 DICAS

1. **Variáveis no Vercel são imediatas**
   - Não precisa aguardar deploy
   - Basta redeploy após adicionar

2. **Teste em Preview primeiro**
   - Adicione variáveis em Preview
   - Teste antes de Production

3. **Use Vercel CLI para automação**
   ```bash
   # Script para configurar tudo
   #!/bin/bash
   vercel env add STRAVA_CLIENT_ID production
   vercel env add STRAVA_CLIENT_SECRET production
   vercel env add STRAVA_REDIRECT_URI production
   vercel --prod
   ```

4. **Monitore logs**
   ```bash
   # Em tempo real
   vercel logs --prod --follow
   ```

---

## 📚 REFERÊNCIAS

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Strava API Documentation](https://developers.strava.com/docs/getting-started/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Status:** 📖 GUIA PRONTO  
**Ação Requerida:** Adicionar variáveis no Vercel (5min)  
**Impacto:** 🔴 CRÍTICO - Bloqueia integração Strava
