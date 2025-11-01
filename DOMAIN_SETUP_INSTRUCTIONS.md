# Configuração de Domínios no Vercel

## Status Atual
✅ Build bem-sucedido no Vercel
✅ Domínios apontados para o Vercel no GoDaddy/Cloudflare

## Próximos Passos

### 1. Adicionar Domínios no Vercel

Acesse o painel do Vercel:
1. Vá para https://vercel.com/dashboard
2. Selecione seu projeto "athera-run"
3. Clique na aba "Settings"
4. Clique em "Domains"

### 2. Adicionar os Domínios

Adicione os seguintes domínios:
- `atherarun.com`
- `www.atherarun.com`

Para cada domínio:
1. Digite o domínio no campo "Add Domain"
2. Clique em "Add"
3. O Vercel irá detectar automaticamente os registros DNS

### 3. Configuração DNS Recomendada

Se você ainda não configurou, use estas configurações no Cloudflare/GoDaddy:

**Para atherarun.com (apex domain):**
```
Type: A
Name: @
Value: 76.76.19.19
```

**Para www.atherarun.com:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Configurar Redirecionamento

No Vercel, configure para redirecionar automaticamente:
- `www.atherarun.com` → `atherarun.com` (ou vice-versa)

### 5. SSL/HTTPS

O Vercel irá automaticamente:
- Provisionar certificado SSL (Let's Encrypt)
- Configurar HTTPS
- Isso leva de 5-10 minutos

### 6. Verificação

Após a propagação DNS (pode levar até 48h, geralmente 15-30 min):
- Acesse https://atherarun.com
- Acesse https://www.atherarun.com
- Verifique se ambos carregam o site
- Verifique se o SSL está ativo (cadeado verde)

## Troubleshooting

### Se o domínio não conectar:
1. Verifique os registros DNS no Cloudflare
2. Use o comando: `nslookup atherarun.com`
3. Aguarde a propagação DNS

### Se o SSL não funcionar:
1. Aguarde alguns minutos
2. O Vercel provisiona SSL automaticamente
3. Pode levar até 10 minutos

### Comandos úteis:
```bash
# Verificar DNS
nslookup atherarun.com
nslookup www.atherarun.com

# Verificar propagação
dig atherarun.com
dig www.atherarun.com
```

## Próximos Passos Após Domínio Configurado

1. **Configurar Variáveis de Ambiente de Produção**
   - DATABASE_URL (produção)
   - NEXTAUTH_URL=https://atherarun.com
   - Todas as API keys

2. **Executar Migrations no Banco de Produção**
   ```bash
   npx prisma migrate deploy
   ```

3. **Testar Funcionalidades**
   - Autenticação
   - Criação de planos
   - Integração Strava
   - Pagamentos Stripe

4. **Monitoramento**
   - Configurar Vercel Analytics
   - Configurar logs de erro
   - Monitorar performance

## Contato Vercel Support

Se tiver problemas:
- https://vercel.com/support
- Documentação: https://vercel.com/docs/concepts/projects/domains
