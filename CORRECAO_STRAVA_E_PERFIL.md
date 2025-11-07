# 🔧 CORREÇÃO: Strava + Exclusão de Perfil

**Data:** 07/11/2025 20:06 UTC  
**Ambiente:** Vercel + Neon (Produção)

---

## ✅ CORREÇÃO APLICADA: Exclusão de Perfil

### Mudanças Implementadas:
```typescript
// app/[locale]/perfil/page.tsx - linha ~150

const handleDeleteProfile = async () => {
  // MELHORIAS:
  // 1. cache: 'no-store' na requisição
  // 2. window.location.replace() em vez de .href
  // 3. Limpeza específica de cookies do atleta
  
  const response = await fetch('/api/profile/delete', { 
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store' // ⭐ NOVO: Forçar sem cache
  });
  
  // ... limpeza de caches ...
  
  window.location.replace(redirectPath); // ⭐ NOVO: Hard redirect
}
```

### Status:
- ✅ **Backend**: Já estava correto (deleta tudo em transação)
- ✅ **Frontend**: Corrigido para forçar redirect limpo
- ✅ **Deploy**: Pronto para produção

---

## 🔴 PROBLEMA: Strava OAuth

### Erro Atual:
```json
{
  "error": "Credenciais do Strava não configuradas..."
}
```

### Diagnóstico:
As variáveis `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` e `STRAVA_REDIRECT_URI` **ESTÃO** no Vercel, mas a aplicação não consegue lê-las em runtime.

### Possíveis Causas:

#### 1. **Variáveis não expostas ao runtime**
No Vercel, variáveis precisam:
- Estar com prefixo `NEXT_PUBLIC_` (client-side), OU
- Ser usadas apenas server-side

**Verificar:**
```bash
# No Vercel Dashboard:
Settings > Environment Variables

Confirmar que:
✓ STRAVA_CLIENT_ID está presente
✓ STRAVA_CLIENT_SECRET está presente  
✓ STRAVA_REDIRECT_URI está presente
✓ Todas estão marcadas para Production
```

#### 2. **Redeploy necessário**
Após adicionar/modificar variáveis no Vercel:
```bash
# É necessário fazer redeploy
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

#### 3. **Verificação no código**
```typescript
// app/api/strava/auth/route.ts
export async function GET(request: NextRequest) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  // ⚠️ Se imprimir undefined, as variáveis não estão acessíveis
  console.log('CLIENT_ID:', clientId ? '✓' : '✗');
  console.log('REDIRECT_URI:', redirectUri ? '✓' : '✗');
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: '...' }, { status: 500 });
  }
  // ...
}
```

---

## 🎯 AÇÃO IMEDIATA

### 1. Testar Exclusão de Perfil (AGORA)
```bash
# Fazer deploy da correção
cd /root/athera-run
git add app/[locale]/perfil/page.tsx
git commit -m "fix: improve profile deletion with cache clearing and hard redirect"
git push

# Após deploy (2-3 min):
# Testar em https://atherarun.com/perfil
# 1. Clicar em "Excluir Perfil"
# 2. Confirmar
# 3. Verificar se redireciona para /onboarding
# 4. Verificar se dados foram removidos
```

### 2. Corrigir Strava (VERCEL DASHBOARD)

#### Passo 1: Verificar Variáveis
1. Acessar: https://vercel.com/[seu-projeto]/settings/environment-variables
2. Conferir se existem:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`
   - `STRAVA_REDIRECT_URI`

#### Passo 2: Se estiverem faltando
```
STRAVA_CLIENT_ID=<seu_client_id>
STRAVA_CLIENT_SECRET=<seu_client_secret>
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
```

#### Passo 3: Se já existirem, fazer redeploy
```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push
```

#### Passo 4: Testar
```
# Após deploy:
https://atherarun.com/api/strava/auth

# Deve redirecionar para Strava OAuth
# ✅ Sucesso: redireciona para strava.com/oauth/authorize
# ❌ Erro: retorna JSON com erro
```

---

## 🔍 DEBUG ADICIONAL (Se ainda não funcionar)

### Adicionar logs temporários:
```typescript
// app/api/strava/auth/route.ts
export async function GET(request: NextRequest) {
  // 🐛 DEBUG
  console.log('=== STRAVA AUTH DEBUG ===');
  console.log('CLIENT_ID exists:', !!process.env.STRAVA_CLIENT_ID);
  console.log('CLIENT_SECRET exists:', !!process.env.STRAVA_CLIENT_SECRET);
  console.log('REDIRECT_URI:', process.env.STRAVA_REDIRECT_URI);
  console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('STRAVA')));
  // 🐛 FIM DEBUG
  
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  // ... resto do código
}
```

Deploy e verificar logs no Vercel:
```
Vercel Dashboard > Deployments > [último deploy] > Functions > Logs
```

---

## 📊 STATUS ATUAL

### ✅ FUNCIONANDO:
- Onboarding (7 steps)
- Criação de perfil
- Salvamento no banco
- Geração de plano

### ✅ CORRIGIDO (Deploy Pendente):
- Exclusão de perfil

### 🔴 PENDENTE:
- Integração Strava (variáveis de ambiente)

---

## 🚀 PRÓXIMOS PASSOS

1. **Imediato (5 min):**
   - Deploy da correção de exclusão de perfil
   - Testar em produção

2. **Curto Prazo (15 min):**
   - Verificar variáveis Strava no Vercel
   - Fazer redeploy se necessário
   - Testar OAuth do Strava

3. **Médio Prazo (2-4h):**
   - Implementar melhorias visuais do PerformanceTab
   - Implementar melhorias visuais do AvailabilityTab
   - Adicionar PreferencesTab completo

---

## 📝 NOTAS IMPORTANTES

### Sobre Variáveis de Ambiente no Vercel:
- Variáveis server-side (API routes): Acessíveis via `process.env`
- Variáveis client-side: Precisam prefixo `NEXT_PUBLIC_`
- Mudanças requerem **REDEPLOY**
- Logs podem ser verificados no dashboard

### Sobre Exclusão de Perfil:
- Usa transação do Prisma (atomicidade garantida)
- Deleta em ordem correta (workouts → weeks → plan → profile)
- Frontend agora força redirect limpo
- Caches são limpos antes do redirect

---

**Documento gerado automaticamente**  
**Mantém histórico completo no Git**
