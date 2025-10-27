# 🌐 Configuração do Domínio atherarun.com

Data: 27 de outubro de 2025

---

## ✅ Mudanças Realizadas no Código

Todas as referências foram atualizadas de:
- ❌ `Maratona Training` / `RunCoach` → ✅ `Athera Run`
- ❌ `42maurillio.abacusai.app` → ✅ `atherarun.com`

### Arquivos Atualizados:
- ✅ `package.json` - Nome do projeto
- ✅ `app/layout.tsx` - Metadados e SEO
- ✅ `app/page.tsx` - Landing page e header
- ✅ `components/header.tsx` - Logo e nome
- ✅ `README.md` - Documentação
- ✅ `.env.example` - Template de variáveis

---

## 🔧 Próximos Passos Necessários

### 1. Configurar DNS do Domínio

Acesse o painel do seu provedor de domínio e configure:

#### **Opção A: Apontando para IP da VM**

```
Tipo: A
Nome: @
Valor: 45.232.21.67
TTL: 3600

Tipo: A
Nome: www
Valor: 45.232.21.67
TTL: 3600
```

#### **Opção B: Usando Cloudflare (Recomendado)**

1. Adicione o domínio no Cloudflare
2. Configure os nameservers no registrador
3. No Cloudflare, adicione:
   ```
   Tipo: A
   Nome: @
   Valor: 45.232.21.67
   Proxy: ✅ Ativado (laranja)

   Tipo: A
   Nome: www
   Valor: 45.232.21.67
   Proxy: ✅ Ativado (laranja)
   ```

**Vantagens do Cloudflare:**
- ✅ SSL/HTTPS gratuito automático
- ✅ CDN global
- ✅ DDoS protection
- ✅ Cache inteligente

---

### 2. Configurar SSL/HTTPS na VM

#### **Opção A: Com Cloudflare (Mais Fácil)**

Se usar Cloudflare com proxy ativado, o SSL é automático! Nada a fazer.

#### **Opção B: Sem Cloudflare - Let's Encrypt**

```bash
# Instalar Certbot
apt-get update
apt-get install -y certbot

# Parar aplicação temporariamente
pm2 stop maratona-app

# Gerar certificado SSL
certbot certonly --standalone -d atherarun.com -d www.atherarun.com

# Configurar Nginx como reverse proxy
apt-get install -y nginx

# Criar configuração
cat > /etc/nginx/sites-available/atherarun << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name atherarun.com www.atherarun.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name atherarun.com www.atherarun.com;

    ssl_certificate /etc/letsencrypt/live/atherarun.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atherarun.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/atherarun /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar aplicação
pm2 restart maratona-app

# Configurar renovação automática
certbot renew --dry-run
```

---

### 3. Atualizar Variáveis de Ambiente na VM

```bash
# Conectar na VM
ssh -p 61089 root@45.232.21.67

# Atualizar .env
cd ~/athera-run/nextjs_space

cat > .env << 'EOF'
DATABASE_URL='postgresql://maratona_user:MRT2025_Secure!Pass@localhost:5432/maratona'
ABACUSAI_API_KEY=84f67058354e486bbaf43894f35f79c0
STRAVA_CLIENT_ID=182213
STRAVA_CLIENT_SECRET=c1dd28f0e5511821e251e56de9bacd19daa686ca
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
STRAVA_VERIFY_TOKEN=marathon_webhook_2025_secure_token
NEXTAUTH_SECRET=3FjBUl7l2NmofpGJWccUuhc08hlizPAJ
NEXTAUTH_URL=https://atherarun.com
GOOGLE_CLIENT_ID=758125025535-677gg04ripanm44iav7ikg44db0v1jfc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NODE_ENV=production
EOF

# Reiniciar aplicação
pm2 restart maratona-app
```

---

### 4. Atualizar Configuração do Strava ⚠️ CRÍTICO

Acesse: https://www.strava.com/settings/api

#### **Atualizar na aplicação existente:**

1. **Authorization Callback Domain:**
   ```
   atherarun.com
   ```

2. **Website:**
   ```
   https://atherarun.com
   ```

3. **Application Description:**
   ```
   Athera Run - Plataforma inteligente de treinamento de corrida com IA.
   Sincronize seus treinos automaticamente e receba planos personalizados.
   ```

**IMPORTANTE:** Após salvar, pode levar até 10 minutos para as mudanças propagarem.

---

### 5. Atualizar Google OAuth (Opcional)

Se usar login com Google, acesse: https://console.cloud.google.com

1. Vá em **APIs & Services** → **Credentials**
2. Edite o OAuth 2.0 Client
3. Adicione em **Authorized redirect URIs:**
   ```
   https://atherarun.com/api/auth/callback/google
   ```

---

## 🧪 Testes Após Configuração

### 1. Testar DNS
```bash
# Linux/Mac
nslookup atherarun.com
dig atherarun.com

# Windows
nslookup atherarun.com
```

Deve retornar: `45.232.21.67`

### 2. Testar HTTPS
```bash
curl -I https://atherarun.com
```

Deve retornar: `HTTP/2 200` (ou HTTP/1.1 200)

### 3. Testar Aplicação

1. Acesse: https://atherarun.com
2. Crie uma conta
3. Complete o onboarding
4. Gere um plano
5. Teste integração Strava

---

## 📋 Checklist Completo

### DNS e Domínio
- [ ] DNS configurado (registros A)
- [ ] Propagação DNS completa (24-48h)
- [ ] www.atherarun.com redirecionando para atherarun.com

### SSL/HTTPS
- [ ] Certificado SSL instalado
- [ ] HTTPS funcionando
- [ ] HTTP redirecionando para HTTPS
- [ ] Cadeado verde no navegador

### Aplicação
- [ ] .env atualizado na VM
- [ ] Aplicação reiniciada
- [ ] Landing page carregando
- [ ] Cadastro funcionando
- [ ] Login funcionando
- [ ] Dashboard acessível

### Integrações
- [ ] Strava callback atualizado
- [ ] OAuth Strava funcionando
- [ ] Sincronização de treinos OK
- [ ] Google OAuth funcionando (se aplicável)

### SEO e Metadados
- [ ] Título aparece como "Athera Run"
- [ ] Open Graph tags corretas
- [ ] Twitter cards funcionando
- [ ] Favicon carregando

---

## 🚨 Problemas Comuns

### DNS não propaga
**Solução:** Aguarde 24-48h. Teste com: https://dnschecker.org

### SSL não funciona
**Solução:**
1. Verifique certificado: `certbot certificates`
2. Teste Nginx: `nginx -t`
3. Verifique logs: `tail -f /var/log/nginx/error.log`

### Strava não conecta
**Solução:**
1. Verifique callback URL no Strava
2. Aguarde 10 minutos após salvar
3. Limpe cache do navegador
4. Teste em aba anônima

### Aplicação não carrega
**Solução:**
```bash
# Ver logs
pm2 logs maratona-app

# Reiniciar
pm2 restart maratona-app

# Ver status
pm2 status
```

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique logs: `pm2 logs maratona-app`
2. Teste DNS: https://dnschecker.org
3. Verifique SSL: https://www.ssllabs.com/ssltest/

---

## 🎉 Próximos Passos Após Tudo Funcionar

1. **Monitoramento:** Configure Uptime Robot para monitorar disponibilidade
2. **Analytics:** Adicione Google Analytics ou Plausible
3. **Backup:** Configure backup automático do banco
4. **CDN:** Otimize assets estáticos
5. **Email:** Configure email transacional (SendGrid, Resend)

---

**Status:** Código atualizado ✅ | Aguardando configuração de DNS e SSL ⏳
