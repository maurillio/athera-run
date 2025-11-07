# ⚠️ Fix do Strava - STRAVA_REDIRECT_URI Faltando

## Problema
A variável `STRAVA_REDIRECT_URI` não está configurada no Vercel, causando o erro ao conectar com Strava.

## Solução Rápida (via Dashboard Vercel)

1. Acesse: https://vercel.com/athera-labs/athera-run/settings/environment-variables

2. Adicione a variável:
   - **Key**: `STRAVA_REDIRECT_URI`
   - **Value**: `https://atherarun.com/api/strava/callback`
   - **Environment**: Production + Preview

3. Faça o redeploy (ou aguarde próximo deploy)

## Verificar após adicionar

```bash
curl https://atherarun.com/api/strava/debug-env
```

Deve retornar `hasRedirectUri: true`

## Nota
As outras variáveis (STRAVA_CLIENT_ID e STRAVA_CLIENT_SECRET) já estão configuradas corretamente.
