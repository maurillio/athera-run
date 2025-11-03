# Checklist de Variáveis de Ambiente - Vercel

## ✅ Variáveis Obrigatórias para IA/LLM

Estas variáveis **DEVEM** estar configuradas no Vercel (Settings > Environment Variables):

### OpenAI Configuration
```
OPENAI_API_KEY=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
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
```

### Database
```
DATABASE_URL=postgresql://maratona_user:MRT2025_Secure!Pass@localhost:5432/maratona
```

### Authentication
```
NEXTAUTH_SECRET=3FjBUl7l2NmofpGJWccUuhc08hlizPAJ
NEXTAUTH_URL=https://atherarun.com
GOOGLE_CLIENT_ID=758125025535-677gg04ripanm44lav7ikg44db0v1jfc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Strava Integration
```
STRAVA_CLIENT_ID=182213
STRAVA_CLIENT_SECRET=c1dd28f0e5511821e251e56de9bacd19daa686ca
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
STRAVA_VERIFY_TOKEN=marathon_webhook_2025_secure_token
```

### Other
```
NODE_ENV=production
```

## 🔍 Como Verificar no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Verifique se **todas** as variáveis acima estão presentes
3. Certifique-se de que estão disponíveis para os ambientes: **Production, Preview, Development**

## 📝 Funcionalidades que Usam OpenAI

Todas estas funcionalidades dependem da `OPENAI_API_KEY`:

- ✅ Geração de planos de treino com IA
- ✅ Análise de corridas
- ✅ Ajuste automático de treinos
- ✅ Chat com assistente de corrida
- ✅ Análise de objetivos de corrida
- ✅ Planos multi-corrida

## ⚙️ Como o Sistema Funciona

O arquivo `lib/llm-client.ts` centraliza todas as chamadas de IA:
- Lê `LLM_PROVIDER` para saber qual provedor usar (openai, openrouter, abacusai)
- Usa `OPENAI_API_KEY` quando `LLM_PROVIDER=openai`
- Usa `LLM_MODEL` para definir qual modelo usar (padrão: gpt-4o-mini)

## 🚨 Troubleshooting

Se a geração de planos falhar:
1. Verifique se `OPENAI_API_KEY` está no Vercel
2. Verifique se `LLM_PROVIDER=openai`
3. Verifique se a chave OpenAI não expirou
4. Verifique os logs no Vercel para detalhes do erro
