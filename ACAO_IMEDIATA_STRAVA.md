# 🎯 AÇÃO IMEDIATA NECESSÁRIA - STRAVA OAUTH
**Data:** 07/11/2025 20:30  
**Prioridade:** 🔴 CRÍTICA  
**Tempo Estimado:** 5 minutos

---

## ⚡ PROBLEMA

Seu sistema está tentando conectar com o Strava, mas as credenciais não estão configuradas no Vercel.

**Erro Atual:**
```
GET https://atherarun.com/api/strava/auth
→ {"error": "Credenciais do Strava não configuradas..."}
```

---

## ✅ SOLUÇÃO RÁPIDA (5 MINUTOS)

### Passo 1: Obter Credenciais do Strava

1. **Acesse:** https://www.strava.com/settings/api

2. **Se já tem uma aplicação:**
   - Anote o `Client ID` e `Client Secret`
   - Pule para Passo 2

3. **Se NÃO tem aplicação, crie uma:**
   ```
   Nome: Athera Run
   Website: https://atherarun.com
   Authorization Callback Domain: atherarun.com
   Descrição: Plataforma de treinamento personalizado
   ```
   
4. **Após criar, anote:**
   ```
   Client ID: (número)
   Client Secret: (string longa)
   ```

### Passo 2: Configurar no Vercel

**MÉTODO A - Via Interface Web (RECOMENDADO):**

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto: `atherarun`
3. Vá em: `Settings` → `Environment Variables`
4. Adicione 3 variáveis:

| Nome | Valor | Environments |
|------|-------|--------------|
| `STRAVA_CLIENT_ID` | Seu Client ID | Production, Preview, Development |
| `STRAVA_CLIENT_SECRET` | Seu Client Secret | Production, Preview, Development |
| `STRAVA_REDIRECT_URI` | `https://atherarun.com/api/strava/callback` | Production, Preview, Development |

5. Clique em `Save` em cada uma
6. Vá em `Deployments` → Clique em `Redeploy` no último deployment

**MÉTODO B - Via Terminal:**

```bash
cd /root/athera-run

# Adicionar variáveis
vercel env add STRAVA_CLIENT_ID production
# Cole o Client ID quando solicitado

vercel env add STRAVA_CLIENT_SECRET production
# Cole o Client Secret quando solicitado

vercel env add STRAVA_REDIRECT_URI production
# Cole: https://atherarun.com/api/strava/callback

# Fazer deploy
vercel --prod
```

### Passo 3: Verificar

```bash
# Executar script de verificação
cd /root/athera-run
./check-strava-config.sh

# OU testar manualmente:
curl -I https://atherarun.com/api/strava/auth

# Resultado esperado:
# HTTP/2 307 (redirect para Strava)
```

---

## 📋 CHECKLIST

- [ ] Obtive Client ID do Strava
- [ ] Obtive Client Secret do Strava
- [ ] Adicionei STRAVA_CLIENT_ID no Vercel
- [ ] Adicionei STRAVA_CLIENT_SECRET no Vercel
- [ ] Adicionei STRAVA_REDIRECT_URI no Vercel
- [ ] Fiz redeploy no Vercel
- [ ] Testei o endpoint: https://atherarun.com/api/strava/auth
- [ ] Endpoint retorna HTTP 307 (redirect)

---

## 🆘 TROUBLESHOOTING

### "Não tenho conta no Strava"
```
1. Criar conta: https://www.strava.com/register
2. Após login, ir em: https://www.strava.com/settings/api
3. Criar aplicação (ver Passo 1 acima)
```

### "Não consigo acessar o Vercel"
```
Opção 1: Pedir acesso ao owner do projeto
Opção 2: Usar Vercel CLI (Método B acima)
Opção 3: Pedir para alguém com acesso adicionar as variáveis
```

### "Erro: Invalid client credentials"
```
Causa: Client ID ou Secret incorretos

Solução:
1. Verificar valores em: https://www.strava.com/settings/api
2. Copiar novamente (sem espaços extras)
3. Reconfigurar no Vercel
4. Redeploy
```

### "Erro: Redirect URI mismatch"
```
Causa: Callback domain não autorizado

Solução:
1. Ir em: https://www.strava.com/settings/api
2. Editar sua aplicação
3. Em "Authorization Callback Domain", adicionar:
   atherarun.com
4. Salvar
5. Aguardar 5 minutos
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Se precisar de mais detalhes:

1. **Guia Completo:**
   ```bash
   cat GUIA_CONFIGURACAO_STRAVA_VERCEL.md
   ```

2. **Diagnóstico Técnico:**
   ```bash
   cat DIAGNOSTICO_STRAVA_PROFILE_FINAL_07NOV2025.md
   ```

3. **Script de Verificação:**
   ```bash
   ./check-strava-config.sh
   ```

---

## ⏱️ TIMELINE

```
0min - Obter credenciais Strava (2min)
2min - Adicionar variáveis Vercel (2min)
4min - Redeploy (automático - 1min)
5min - Testar endpoint (1min)
```

**Total:** ~5 minutos

---

## 🎯 RESULTADO ESPERADO

**ANTES:**
```bash
$ curl https://atherarun.com/api/strava/auth
{"error":"Credenciais do Strava não configuradas..."}
```

**DEPOIS:**
```bash
$ curl -I https://atherarun.com/api/strava/auth
HTTP/2 307
Location: https://www.strava.com/oauth/authorize?client_id=...
```

---

## 💡 PRÓXIMOS PASSOS APÓS CONFIGURAR

1. **Testar integração completa:**
   - Ir em: https://atherarun.com/perfil
   - Clicar em "Conectar Strava"
   - Autorizar aplicação
   - Ver atividades importadas

2. **Validar sincronização:**
   - Fazer uma corrida no Strava
   - Verificar se aparece automaticamente no Athera Run
   - Confirmar webhook funcionando

---

## 🚨 IMPORTANTE

- ❌ **NÃO** commitar secrets no código
- ❌ **NÃO** compartilhar Client Secret publicamente
- ✅ **SEMPRE** usar variáveis de ambiente
- ✅ **VERIFICAR** callback domain no Strava

---

## 📞 PRECISA DE AJUDA?

Execute o script de verificação para diagnóstico automático:

```bash
cd /root/athera-run
./check-strava-config.sh
```

O script vai:
- ✅ Verificar se variáveis estão configuradas
- ✅ Testar endpoint em produção
- ✅ Mostrar próximos passos específicos
- ✅ Dar instruções personalizadas

---

**Status Atual:** 🔴 VARIÁVEIS FALTANDO  
**Ação Necessária:** Configurar 3 variáveis no Vercel  
**Urgência:** IMEDIATA (bloqueia integração Strava)  
**Dificuldade:** ⭐⭐ (Fácil - 5 minutos)

---

## 🎉 CONCLUSÃO

É só configurar as 3 variáveis no Vercel e está pronto! 

O código já está 100% funcional. Só falta a configuração.

**Comece agora:** https://vercel.com/dashboard 🚀
