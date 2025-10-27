# 🌐 Configurar Cloudflare + GoDaddy para atherarun.com

## Passo 1: Configurar Cloudflare

### 1.1 Criar Conta Cloudflare
1. Acesse: https://dash.cloudflare.com/sign-up
2. Crie conta gratuita
3. Confirme email

### 1.2 Adicionar Domínio
1. No dashboard: "Add a Site"
2. Digite: `atherarun.com`
3. Escolha plano: **Free** (US$ 0/mês)
4. Clique "Continue"

### 1.3 Aguardar Scan DNS (30-60s)
Cloudflare vai detectar automaticamente registros DNS existentes

### 1.4 Configurar Registros DNS no Cloudflare

Certifique-se que tem estes registros (adicione se necessário):

```
┌──────┬──────┬────────────────┬─────────────────┬──────┐
│ Tipo │ Nome │ Conteúdo       │ Proxy Status    │ TTL  │
├──────┼──────┼────────────────┼─────────────────┼──────┤
│ A    │ @    │ 45.232.21.67   │ ✅ Proxied (🟠) │ Auto │
│ A    │ www  │ 45.232.21.67   │ ✅ Proxied (🟠) │ Auto │
└──────┴──────┴────────────────┴─────────────────┴──────┘
```

**CRÍTICO:**
- ✅ Proxy Status = **Proxied** (nuvem LARANJA)
- ❌ NÃO deixe "DNS only" (nuvem CINZA)

### 1.5 Anotar Nameservers
Cloudflare vai mostrar algo como:

```
Nameserver 1: noah.ns.cloudflare.com
Nameserver 2: uma.ns.cloudflare.com
```

**ANOTE ESTES!** (Os seus serão diferentes)

---

## Passo 2: Atualizar Nameservers na GoDaddy

### 2.1 Fazer Login na GoDaddy
1. Acesse: https://sso.godaddy.com
2. Login com sua conta

### 2.2 Ir para Gerenciar Domínios
1. No menu superior: **Domínios** → **Meus Domínios**
2. Ou acesse direto: https://account.godaddy.com/products

### 2.3 Selecionar atherarun.com
1. Encontre `atherarun.com` na lista
2. Clique nos **3 pontinhos** (⋮) ao lado do domínio
3. Selecione **Gerenciar DNS** ou **Manage DNS**

### 2.4 Alterar Nameservers
1. Role até a seção **Nameservers**
2. Clique em **Change** (ou **Alterar**)
3. Selecione **"I'll use my own nameservers"** (ou **"Vou usar meus próprios nameservers"**)

### 2.5 Inserir Nameservers do Cloudflare
```
Nameserver 1: [Cole o nameserver 1 do Cloudflare]
Nameserver 2: [Cole o nameserver 2 do Cloudflare]

Exemplo:
Nameserver 1: noah.ns.cloudflare.com
Nameserver 2: uma.ns.cloudflare.com
```

### 2.6 Salvar
1. Clique **Save** (Salvar)
2. Confirme se houver popup de confirmação

**⚠️ ATENÇÃO:** GoDaddy pode mostrar aviso dizendo que você perderá controle dos DNS. Isso é normal! Os DNS serão gerenciados pelo Cloudflare agora.

---

## Passo 3: Finalizar no Cloudflare

### 3.1 Voltar ao Cloudflare
1. No dashboard do Cloudflare
2. Clique **Done, check nameservers**

### 3.2 Aguardar Verificação
```
Status: "Pending nameserver update" (amarelo)
        ↓
        Aguarde 5 minutos a 24 horas
        ↓
Status: "Active" (verde) ✅
```

**Tempo médio:** 30 minutos a 2 horas

### 3.3 Verificar Email
Cloudflare enviará email quando ativar:
```
Subject: "atherarun.com is now active on a Cloudflare Free plan"
```

---

## Passo 4: Configurar SSL no Cloudflare

### 4.1 Acessar Configurações SSL
1. No dashboard do Cloudflare
2. Selecione `atherarun.com`
3. Vá em: **SSL/TLS** (menu lateral)

### 4.2 Escolher Modo SSL
Selecione: **Full** (não "Full (strict)")

```
┌─────────────────────────────────────┐
│ SSL/TLS encryption mode             │
├─────────────────────────────────────┤
│ ○ Off (not secure)                  │
│ ○ Flexible                          │
│ ● Full                             │ ← Selecione este!
│ ○ Full (strict)                     │
└─────────────────────────────────────┘
```

**Por quê "Full"?**
- VM tem auto-signed certificate ou HTTP
- Cloudflare → Visitante: HTTPS ✅
- Cloudflare → VM: HTTP (OK internamente)

### 4.3 Ativar "Always Use HTTPS"
1. Ainda em **SSL/TLS**
2. Aba **Edge Certificates**
3. Ative: **Always Use HTTPS** → ON (🟢)
4. Ative: **Automatic HTTPS Rewrites** → ON (🟢)

### 4.4 Aguardar Certificado SSL
```
Status: "Authorizing Certificate" (amarelo)
        ↓
        5-15 minutos
        ↓
Status: "Active Certificate" (verde) ✅
```

---

## Passo 5: Testar

### 5.1 Testar DNS
```bash
# Linux/Mac
nslookup atherarun.com

# Deve retornar IPs do Cloudflare (não direto da VM)
# Isso é normal! Cloudflare faz proxy.
```

### 5.2 Testar HTTPS
```
1. Abra: https://atherarun.com
2. Deve carregar com cadeado 🔒 verde
3. Certificado: emitido por "Cloudflare"
```

### 5.3 Verificar Redirecionamento HTTP → HTTPS
```
1. Acesse: http://atherarun.com (sem S)
2. Deve redirecionar automaticamente para: https://atherarun.com
```

---

## Passo 6: Atualizar Variáveis de Ambiente na VM

```bash
# Conectar na VM
ssh -p 61089 root@45.232.21.67

# Ir para o projeto
cd ~/athera-run/nextjs_space

# Editar .env
nano .env
```

**Alterar estas linhas:**
```bash
NEXTAUTH_URL=https://atherarun.com
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
NODE_ENV=production
```

**Salvar:** `Ctrl+X` → `Y` → `Enter`

```bash
# Reiniciar aplicação
pm2 restart maratona-app

# Ver logs
pm2 logs maratona-app --lines 30
```

---

## Passo 7: Atualizar Strava OAuth

### 7.1 Acessar Strava Settings
1. Login no Strava: https://www.strava.com
2. Vá em: **Settings** → **My API Application**
3. Ou direto: https://www.strava.com/settings/api

### 7.2 Editar Aplicação
```
Application Name: Athera Run

Category: Training

Website: https://atherarun.com

Authorization Callback Domain: atherarun.com
(SEM https://, SEM www, APENAS o domínio)

Application Description:
Athera Run - Plataforma inteligente de treinamento de corrida
com IA. Sincronize seus treinos automaticamente e receba planos
personalizados baseados em metodologia científica.
```

### 7.3 Salvar
1. Clique **Update**
2. Aguarde 5-10 minutos para propagar

---

## Passo 8: Otimizações Cloudflare (Opcional)

### 8.1 Speed → Optimization
```
Auto Minify:
✅ JavaScript
✅ CSS
✅ HTML

Brotli: ✅ ON
```

### 8.2 Caching → Configuration
```
Browser Cache TTL: 4 hours
```

### 8.3 Network
```
HTTP/2: ✅ ON
HTTP/3 (with QUIC): ✅ ON
0-RTT Connection Resumption: ✅ ON
WebSockets: ✅ ON
```

---

## ✅ Checklist Final

### Cloudflare
- [ ] Conta criada
- [ ] Domínio adicionado
- [ ] Registros DNS (A @ e www) configurados com Proxy ON
- [ ] Nameservers anotados

### GoDaddy
- [ ] Nameservers alterados para Cloudflare
- [ ] Salvo com sucesso

### Cloudflare (continuação)
- [ ] Status: Active (verde)
- [ ] SSL Mode: Full
- [ ] Always Use HTTPS: ON
- [ ] Certificado SSL: Active

### Testes
- [ ] https://atherarun.com carrega
- [ ] Cadeado verde (certificado válido)
- [ ] http:// redireciona para https://
- [ ] www.atherarun.com funciona

### Aplicação
- [ ] .env atualizado na VM
- [ ] App reiniciado (pm2 restart)
- [ ] Login funciona
- [ ] Cadastro funciona

### Strava
- [ ] Callback domain: atherarun.com
- [ ] Website: https://atherarun.com
- [ ] Integração Strava funciona

---

## 🚨 Troubleshooting

### "Nameserver update pending" há mais de 24h
```
1. Verifique se copiou nameservers corretamente
2. Na GoDaddy, certifique-se que salvou
3. Limpe cache DNS:
   - Windows: ipconfig /flushdns
   - Mac: sudo dscacheutil -flushcache
4. Aguarde mais 24h (pode levar até 48h)
```

### "Too many redirects" ao acessar site
```
Solução:
1. Cloudflare → SSL/TLS
2. Mude de "Flexible" para "Full"
3. Aguarde 5 minutos
4. Limpe cache do navegador (Ctrl+Shift+Del)
```

### Certificado SSL não ativa
```
1. Certifique-se que Proxy está ON (nuvem laranja)
2. Aguarde 15-30 minutos
3. SSL/TLS → Edge Certificates → "Disable Universal SSL" → Save → "Enable Universal SSL" → Save
```

### Site não carrega
```
1. Teste DNS: nslookup atherarun.com
2. Se não resolver: Nameservers ainda não propagaram
3. Se resolve mas não carrega:
   - Verifique se app está rodando na VM (pm2 status)
   - Verifique logs (pm2 logs maratona-app)
```

---

## 📊 Timeline Esperado

```
T+0min:    Adicionar domínio no Cloudflare
T+5min:    Alterar nameservers na GoDaddy
T+30min:   Nameservers propagam (pode levar até 24h)
T+35min:   Cloudflare ativa
T+40min:   Certificado SSL emitido
T+45min:   Site acessível via HTTPS ✅
```

**Total: 30 min a 24 horas** (média: 1-2 horas)

---

## 📞 Precisa de Ajuda?

1. Verifique status nameservers: https://www.whatsmydns.net
2. Teste SSL: https://www.ssllabs.com/ssltest/
3. Verifique DNS: https://dnschecker.org
4. Cloudflare Status: https://www.cloudflarestatus.com

---

**Status:** Pronto para configurar! 🚀
**Dificuldade:** ⭐⭐ (Fácil)
**Tempo:** 30 min - 2 horas
