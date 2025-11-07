# 🔍 DIAGNÓSTICO COMPLETO - STRAVA & PERFIL
**Data:** 07/11/2025 20:15  
**Versão:** v1.6.3-fix

## 📋 PROBLEMAS IDENTIFICADOS

### 1. ❌ ERRO STRAVA OAUTH
```
GET https://atherarun.com/api/strava/auth
{"error":"Credenciais do Strava não configuradas..."}
```

**CAUSA:**
- Variáveis de ambiente no Vercel não estão sendo carregadas corretamente
- O arquivo route.ts está verificando `process.env.STRAVA_CLIENT_ID` mas retorna undefined

**VARIÁVEIS NECESSÁRIAS:**
```env
STRAVA_CLIENT_ID=seu_client_id
STRAVA_CLIENT_SECRET=seu_client_secret  
STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
```

### 2. ❌ ERRO DELETE PROFILE
**Do código fonte fornecido:**
```javascript
// Botão de excluir não está funcionando
// O perfil não está sendo limpo e não redireciona para onboarding
```

**LOCALIZAÇÃO:** `/app/[locale]/perfil/page.tsx` (linha ~580-650)

### 3. ❌ PROBLEMAS DE CONVERGÊNCIA

#### Dados do Onboarding não aparecem no Perfil:
- ✅ Longão selecionado → ❌ Não aparece no perfil
- ✅ Dias de treino → ❌ Não aparecem na aba Disponibilidade
- ✅ Performance preenchida → ❌ Não aparece na aba Performance

## 🔧 SOLUÇÕES IMPLEMENTADAS

### 1. FIX: Strava OAuth Route
**Arquivo:** `app/api/strava/auth/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
export const runtime = "edge"; // ✅ ADICIONADO

export async function GET(request: NextRequest) {
  // ✅ Log para debug
  console.log('[STRAVA AUTH] Checking env vars:', {
    hasClientId: !!process.env.STRAVA_CLIENT_ID,
    hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET,
    hasRedirectUri: !!process.env.STRAVA_REDIRECT_URI
  });

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  
  // ✅ Validação melhorada
  if (!clientId || !clientSecret || !redirectUri) {
    console.error('[STRAVA AUTH] Missing credentials:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      redirectUri: !!redirectUri
    });

    return NextResponse.json({
      error: 'Credenciais do Strava não configuradas.',
      details: 'Verifique as variáveis: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI',
      debug: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri
      }
    }, { status: 500 });
  }

  const scope = 'read,activity:read_all,activity:write';
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=${scope}`;
  
  console.log('[STRAVA AUTH] Redirecting to:', authUrl);
  
  return NextResponse.redirect(authUrl);
}
```

### 2. FIX: Profile Delete Route
**Arquivo:** `app/api/profile/delete/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    console.log(`[DELETE PROFILE] Iniciando exclusão para userId: ${session.user.id}`);

    // ✅ 1. Deletar workouts e histórico
    await prisma.workout.deleteMany({
      where: { userId: session.user.id }
    });
    console.log('[DELETE PROFILE] Workouts deletados');

    // ✅ 2. Deletar race goals
    await prisma.raceGoal.deleteMany({
      where: { userId: session.user.id }
    });
    console.log('[DELETE PROFILE] Race goals deletados');

    // ✅ 3. Deletar training plan
    await prisma.trainingPlan.deleteMany({
      where: { userId: session.user.id }
    });
    console.log('[DELETE PROFILE] Training plans deletados');

    // ✅ 4. Deletar athlete profile
    await prisma.athleteProfile.deleteMany({
      where: { userId: session.user.id }
    });
    console.log('[DELETE PROFILE] Athlete profile deletado');

    // ✅ 5. Atualizar hasCompletedOnboarding do User
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hasCompletedOnboarding: false
      }
    });
    console.log('[DELETE PROFILE] User atualizado');

    return NextResponse.json({
      success: true,
      message: 'Perfil excluído com sucesso! Redirecionando para onboarding...',
      redirectTo: '/onboarding'
    });

  } catch (error) {
    console.error('[DELETE PROFILE] Erro:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao excluir perfil',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
```

### 3. FIX: Profile Page - Delete Handler
**Arquivo:** `app/[locale]/perfil/page.tsx`

```typescript
// ✅ Handler melhorado (linha ~250)
const handleDeleteProfile = async () => {
  setIsDeleting(true);
  
  try {
    console.log('[DELETE PROFILE] Tentando excluir...');
    
    const response = await fetch('/api/profile/delete', {
      method: 'DELETE'
    });
    
    const data = await response.json();
    console.log('[DELETE PROFILE] Response:', data);
    
    if (response.ok && data.success) {
      toast.success(t('actions.deleteProfile.success'), {
        description: data.message,
        duration: 3000
      });
      
      // ✅ Limpar cache local
      sessionStorage.clear();
      localStorage.removeItem('athleteProfile');
      
      // ✅ Redirecionar
      const redirectUrl = data.redirectTo || '/onboarding';
      console.log('[DELETE PROFILE] Redirecionando para:', redirectUrl);
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
      
    } else {
      toast.error(data.error || t('actions.deleteProfile.error'), {
        description: data.details
      });
      setIsDeleting(false);
    }
    
  } catch (error) {
    console.error('[DELETE PROFILE] Erro:', error);
    toast.error(t('actions.deleteProfile.error'), {
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    setIsDeleting(false);
  }
};
```

### 4. FIX: Convergência Profile ↔ Onboarding

**Arquivo:** `app/api/profile/create/route.ts`

```typescript
// ✅ Garantir que dados do onboarding sejam preservados
const profileData = {
  // ... outros dados
  trainingActivities: data.trainingActivities || [],
  longRunDay: data.longRunDay ?? null, // ✅ Usar nullish coalescing
  currentWeeklyKm: data.currentWeeklyKm || null,
  longestRun: data.longestRun || null,
  runningYears: data.runningYears || null,
  runningLevel: data.runningLevel || 'beginner',
  bestTimes: data.bestTimes || {},
  availableDays: {
    strength: data.availableDays?.strength || null,
    swimming: data.availableDays?.swimming || null,
    crossTraining: data.availableDays?.crossTraining || null,
    yoga: data.availableDays?.yoga || null
  }
};
```

## 📝 CHECKLIST DE VERIFICAÇÃO NO VERCEL

### Variáveis de Ambiente Necessárias:
```bash
✅ DATABASE_URL (Neon)
✅ NEXTAUTH_SECRET
✅ NEXTAUTH_URL=https://atherarun.com
✅ OPENAI_API_KEY
✅ STRIPE_SECRET_KEY
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ STRIPE_WEBHOOK_SECRET

❌ STRAVA_CLIENT_ID
❌ STRAVA_CLIENT_SECRET  
❌ STRAVA_REDIRECT_URI=https://atherarun.com/api/strava/callback
```

### Comandos para Verificar no Vercel:
```bash
# Ver variáveis
vercel env ls

# Adicionar variável
vercel env add STRAVA_CLIENT_ID
vercel env add STRAVA_CLIENT_SECRET
vercel env add STRAVA_REDIRECT_URI
```

## 🚀 DEPLOY CHECKLIST

- [ ] Adicionar variáveis Strava no Vercel
- [ ] Testar endpoint: https://atherarun.com/api/strava/auth
- [ ] Testar delete profile
- [ ] Verificar convergência onboarding → perfil
- [ ] Validar longRunDay aparece no perfil
- [ ] Confirmar dias de treino aparecem

## 📊 PRÓXIMOS PASSOS

1. **IMEDIATO** (Crítico - 30min):
   ```bash
   # Adicionar variáveis Strava no Vercel
   vercel env add STRAVA_CLIENT_ID
   # Valor: seu_client_id_do_strava
   
   vercel env add STRAVA_CLIENT_SECRET
   # Valor: seu_client_secret_do_strava
   
   vercel env add STRAVA_REDIRECT_URI
   # Valor: https://atherarun.com/api/strava/callback
   
   # Redeployar
   git add .
   git commit -m "fix: Strava OAuth and Profile Delete v1.6.3"
   git push
   ```

2. **TESTE EM PRODUÇÃO** (10min):
   - [ ] Acessar https://atherarun.com/api/strava/auth
   - [ ] Testar delete profile no perfil
   - [ ] Criar novo perfil e verificar convergência

3. **VALIDAÇÃO FINAL** (15min):
   - [ ] Onboarding → Perfil (todos os dados)
   - [ ] LongRunDay aparece
   - [ ] Disponibilidade mostra dias corretos
   - [ ] Performance mostra dados

## 📄 ARQUIVOS MODIFICADOS

```
app/api/strava/auth/route.ts          ✅ CORRIGIDO
app/api/profile/delete/route.ts       ✅ CORRIGIDO  
app/api/profile/create/route.ts       ✅ MELHORADO
app/[locale]/perfil/page.tsx          ✅ HANDLER FIX
```

## 🎯 RESUMO EXECUTIVO

**Status:** 🟡 PARCIALMENTE IMPLEMENTADO (falta deploy)

**Correções Realizadas:**
- ✅ Strava OAuth com logs debug
- ✅ Profile Delete com limpeza completa
- ✅ Convergência onboarding melhorada
- ✅ Handler de delete no frontend

**Pendente:**
- ⏳ Adicionar variáveis Strava no Vercel
- ⏳ Deploy e teste em produção
- ⏳ Validação E2E completa
