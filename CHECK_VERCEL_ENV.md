# 🔍 DIAGNÓSTICO - Variáveis de Ambiente Strava

## ❌ Problema Identificado
A variável `STRAVA_REDIRECT_URI` não está sendo reconhecida no Vercel em produção.

### Debug Response:
```json
{
  "hasClientId": true,
  "hasClientSecret": true,
  "hasRedirectUri": false  // ❌ NÃO ENCONTRADA
}
```

## ✅ Soluções Possíveis

### 1. Verificar nome EXATO da variável no Vercel Dashboard
Acesse: https://vercel.com/your-team/athera-run/settings/environment-variables

Confirme que o nome está **EXATAMENTE**:
- `STRAVA_REDIRECT_URI` (sem espaços, case-sensitive)

### 2. Valor correto da variável
```
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
```

### 3. Verificar Environment
Certifique-se que está marcado:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. Redeploy após adicionar
Após adicionar/corrigir a variável:
```bash
vercel --prod
```

## 🔧 Comandos de Verificação

### Via Vercel Dashboard (Recomendado)
1. Vá em: Settings → Environment Variables
2. Busque por "STRAVA"
3. Verifique se todas as 3 variáveis existem:
   - STRAVA_CLIENT_ID
   - STRAVA_CLIENT_SECRET
   - STRAVA_REDIRECT_URI

### Via CLI (se tiver acesso)
```bash
vercel env pull .env.local
cat .env.local | grep STRAVA
```

## 📝 Checklist

- [ ] STRAVA_CLIENT_ID existe no Vercel
- [ ] STRAVA_CLIENT_SECRET existe no Vercel  
- [ ] STRAVA_REDIRECT_URI existe no Vercel (⚠️ FALTANDO)
- [ ] Todas marcadas para Production
- [ ] Fazer redeploy após adicionar

## 🎯 Valor que deve ser configurado

```env
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
```

⚠️ **IMPORTANTE**: Após adicionar, faça um novo deploy para aplicar as mudanças!
