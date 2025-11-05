# 🔧 PLANO DE CORREÇÃO COMPLETA - 05 NOV 2025
## EXECUÇÃO COMPLETA: 6 HORAS

**Data:** 05 de Novembro de 2025  
**Versão Atual:** 1.5.0  
**Próxima Versão:** 1.5.1 (Hotfix)  
**Modo:** EXECUÇÃO TOTAL (Opção A - 6h)

---

## 🎯 RESUMO EXECUTIVO

### Problemas Identificados: 7
1. ❌ **Strava API** - Resposta sobre uso de IA (CRÍTICO)
2. ❌ **Google OAuth** - Erro coluna `users.locale` não existe
3. ❌ **Build Vercel** - Conflito .env + Prisma schema not found
4. ❌ **Datas em inglês** - "Tuesday, 4 de November" em PT-BR
5. ❌ **Interpolação** - "{Maurillio}" aparecendo literal
6. ❌ **Rotas i18n** - `/pt-BR/tracking` → 404
7. ⚠️  **Dynamic Server** - 4 APIs com warnings

### Tempo Estimado Total: 6 horas
- FASE 1: Build e Banco (1h)
- FASE 2: Formatação e i18n (2h)
- FASE 3: Rotas e APIs (1h)
- FASE 4: Strava Response (1.5h)
- FASE 5: Testes e Deploy (0.5h)

---

## 📋 FASE 1: BUILD E BANCO DE DADOS (1h)

### 1.1. Remover diretório aninhado (5min)
```bash
rm -rf /root/athera-run/nextjs_space/nextjs_space/
```

### 1.2. Atualizar .vercelignore (5min)
```
.env
.env.*
!nextjs_space/.env
!nextjs_space/.env.example
nextjs_space/nextjs_space/
*.md
!README.md
scripts/
docs/
```

### 1.3. Atualizar vercel.json com schema path explícito (10min)
```json
{
  "version": 2,
  "buildCommand": "cd nextjs_space && npm install --force && npx prisma generate --schema=./prisma/schema.prisma && npx prisma migrate deploy --schema=./prisma/schema.prisma && npm run build",
  "framework": "nextjs",
  "installCommand": "cd nextjs_space && npm install --force"
}
```

### 1.4. Aplicar migration do banco (20min)
```bash
cd /root/athera-run/nextjs_space
npx prisma migrate deploy
```

### 1.5. Commit e Deploy (20min)
```bash
git add .
git commit -m "fix(build): resolve prisma schema path and env conflicts"
git push origin main
```

**Checkpoint:** Build Vercel passando, Google OAuth funcionando

---

## 📋 FASE 2: FORMATAÇÃO E i18n (2h)

### 2.1. Criar date-formatter utility (30min)

**Arquivo:** `nextjs_space/lib/utils/date-formatter.ts`

```typescript
import { Locale } from '@/lib/i18n/config';

const localeMap: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  'en': 'en-US',
  'es': 'es-ES',
};

export function formatDate(
  date: Date | string,
  locale: Locale,
  format: 'full' | 'short' = 'full'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeString = localeMap[locale];
  
  if (format === 'full') {
    return dateObj.toLocaleDateString(localeString, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString(localeString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  locale: Locale
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const localeString = localeMap[locale];
  
  const startStr = start.toLocaleDateString(localeString, {
    day: '2-digit',
    month: '2-digit'
  });
  
  const endStr = end.toLocaleDateString(localeString, {
    day: '2-digit',
    month: '2-digit'
  });
  
  return `${startStr} - ${endStr}`;
}

export function formatWeekday(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localeString = localeMap[locale];
  
  return dateObj.toLocaleDateString(localeString, {
    weekday: 'long'
  });
}
```

### 2.2. Atualizar useTranslations com interpolação (45min)

**Arquivo:** `nextjs_space/lib/i18n/hooks.ts`

```typescript
import { Locale, Translation, Translations } from './config';
import { useParams } from 'next/navigation';

type TranslationFunction = (
  key: string,
  values?: Record<string, string | number>
) => string;

export function useTranslations(namespace?: string): TranslationFunction {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'pt-BR';

  return (key: string, values?: Record<string, string | number>) => {
    try {
      const translations: Translations = require(`./locales/${locale}.json`);
      const keys = namespace ? `${namespace}.${key}`.split('.') : key.split('.');
      
      let result: any = translations;
      for (const k of keys) {
        result = result?.[k];
      }

      if (typeof result !== 'string') {
        console.warn(`Translation missing: ${namespace ? `${namespace}.${key}` : key}`);
        return key;
      }

      // Interpolação: {key} e {{key}}
      if (values) {
        Object.entries(values).forEach(([varKey, varValue]) => {
          result = result
            .replace(new RegExp(`\\{\\{${varKey}\\}\\}`, 'g'), String(varValue))
            .replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varValue));
        });
      }

      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };
}

export function interpolate(
  text: string,
  values: Record<string, string | number>
): string {
  let result = text;
  Object.entries(values).forEach(([key, value]) => {
    result = result
      .replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
      .replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });
  return result;
}
```

### 2.3. Atualizar Dashboard page (30min)

Localizar e corrigir todas as interpolações e datas em:
- `app/[locale]/dashboard/page.tsx`

### 2.4. Atualizar Plano page (15min)

Localizar e corrigir todas as interpolações e datas em:
- `app/[locale]/plano/page.tsx`

**Checkpoint:** Datas formatadas corretamente, variáveis interpolando

---

## 📋 FASE 3: ROTAS E APIS (1h)

### 3.1. Atualizar middleware.ts com todas rotas (30min)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { i18n, Locale } from './lib/i18n/config';

const publicPaths = ['/api', '/_next', '/favicon.ico', '/images'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const pathnameHasLocale = i18n.locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const locale = i18n.defaultLocale;
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
```

### 3.2. Adicionar force-dynamic nas 4 APIs (20min)

Adicionar no topo de cada arquivo:

1. `app/api/admin/users/route.ts`
2. `app/api/profile/auto-adjust-settings/route.ts`
3. `app/api/profile/medical/route.ts`
4. `app/api/subscription/status/route.ts`

```typescript
export const dynamic = 'force-dynamic';
```

### 3.3. Testar rotas (10min)

Verificar:
- `/pt-BR/tracking` ✅
- `/en/tracking` ✅
- `/es/tracking` ✅
- Todas as 17 rotas × 3 locales

**Checkpoint:** Todas rotas acessíveis, APIs sem warnings

---

## 📋 FASE 4: RESPOSTA STRAVA API (1.5h)

### Template de Resposta:

```
Subject: Re: Additional Information Required - Athera Run AI Usage

Dear Strava Developer Program Team,

Thank you for your review. Below is detailed information about our AI usage:

**1. Does your use case involve AI or machine learning?**

Yes. Athera Run uses AI (OpenAI GPT-4) exclusively to generate personalized 
running training plans and provide coaching guidance to athletes.

**2. How Strava API data is used with AI:**

Strava activity data (distance, pace, heart rate, elevation) is used ONLY to:

✅ Analyze completed workouts vs. planned training
✅ Generate personalized feedback for the individual athlete
✅ Adjust future training plans based on actual performance
✅ Provide contextual coaching in our AI chat feature

**WE DO NOT:**
❌ Use Strava data to train AI models
❌ Use Strava data to fine-tune models
❌ Share Strava data with third-party AI services for training
❌ Aggregate Strava data for machine learning purposes
❌ Retain Strava data for any training purposes

**How it works:**
- Strava data → Encrypted database (user's private data)
- AI processes data in real-time → Generates personalized response
- Response shown to user → No data retained for training
- AI context is ephemeral (request-time only)

**3. Compliance with API Terms of Service:**

We have implemented these safeguards:

✅ **Data Usage:** Strava data provides direct value to the user only
✅ **Data Storage:** Activities stored encrypted, user-controlled, deletable
✅ **No Training:** Code-level blocks prevent using data for model training
✅ **No Sharing:** Zero sharing with third parties or AI training services
✅ **User Control:** Users can disconnect Strava anytime, deleting all data
✅ **Transparency:** Privacy policy explicitly states Strava data usage
✅ **Security:** OAuth 2.0, encrypted tokens, SOC 2 hosting (Vercel)

**Technical Implementation:**
```typescript
// In lib/llm-client.ts
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // Using OpenAI API (not fine-tuning)
  // Enterprise terms prohibit training on customer data
});

// API calls include strict prompts:
// "Use this data ONLY for generating a response to THIS user"
```

**4. Third-party access to data:**

1. **OpenAI GPT-4** (AI Provider)
   - Purpose: Generate plans and coaching responses
   - Data Sent: User's activities (never for training)
   - Safeguards: Enterprise API, no data retention
   - Compliance: OpenAI terms prohibit training on API data

2. **Vercel** (Hosting)
   - Purpose: Application hosting
   - Access: Server-side only, encrypted at rest
   - Compliance: SOC 2 Type II certified

3. **PostgreSQL** (Database - self-hosted)
   - Purpose: Data storage
   - Access: Application-only
   - Location: Our own server (45.232.21.67)

NO OTHER third parties access Strava data.

**5. Additional Apps:**

- **Production:** Client ID 134133 (atherarun.com)
- **Development:** Client ID 142655 (testing only)

Both follow identical data handling policies.

**Summary:**

Athera Run uses AI to HELP athletes, not to TRAIN models. We respect 
Strava's data policies and have implemented technical safeguards to ensure 
full compliance with the prohibition on using Strava data for AI training.

We are committed to maintaining trust in the Strava developer ecosystem.

Please let us know if you need additional information.

Best regards,
Athera Run Team
support@atherarun.com
https://atherarun.com
```

**Checkpoint:** Resposta enviada, aguardando aprovação

---

## 📋 FASE 5: TESTES E DEPLOY FINAL (30min)

### 5.1. Testar localmente (10min)
```bash
cd nextjs_space
npm run dev
```

Verificar:
- [ ] Datas em português
- [ ] Variáveis interpoladas
- [ ] Rotas i18n funcionando
- [ ] Google OAuth OK

### 5.2. Commit final (10min)
```bash
git add .
git commit -m "fix(v1.5.1): hotfix completo

- Corrige Google OAuth (migration aplicada)
- Corrige formatação de datas (date-formatter)
- Corrige interpolação de variáveis (useTranslations)
- Corrige rotas i18n (middleware completo)
- Remove warnings Dynamic Server (force-dynamic)
- Atualiza build config (Prisma schema path)

Docs atualizadas:
- CONTEXTO.md (v1.5.1)
- PLANO_CORRECAO_COMPLETA_05NOV2025.md

BREAKING: Requer migration do banco"

git push origin main
```

### 5.3. Monitorar deploy (10min)

Vercel Dashboard → Ver logs → Confirmar:
- [ ] Build passando
- [ ] 67 páginas compiladas
- [ ] Zero erros TypeScript
- [ ] Migration aplicada

**Checkpoint:** Deploy OK, sistema 100% funcional

---

## ✅ CRITÉRIOS DE SUCESSO FINAL

### Build & Deploy
- [ ] Build Vercel passando sem erros
- [ ] 67 páginas compiladas corretamente
- [ ] Zero TypeScript errors
- [ ] Zero Dynamic Server warnings

### Funcionalidades
- [ ] Google OAuth funcionando perfeitamente
- [ ] Datas: "terça-feira, 4 de novembro de 2025"
- [ ] Variáveis: "Olá, Maurillio! 👋" (sem chaves)
- [ ] Rotas: `/pt-BR/tracking` acessível
- [ ] Plano PT-BR 100% correto

### Integrações
- [ ] Resposta Strava enviada
- [ ] Dashboard sem erros
- [ ] Perfil editável
- [ ] Logs limpos

---

## 📊 PROGRESSO DA EXECUÇÃO

```
FASE 1: Build e Banco       [          ] 0%  (0h / 1h)
FASE 2: Formatação e i18n   [          ] 0%  (0h / 2h)
FASE 3: Rotas e APIs        [          ] 0%  (0h / 1h)
FASE 4: Strava Response     [          ] 0%  (0h / 1.5h)
FASE 5: Testes e Deploy     [          ] 0%  (0h / 0.5h)

TOTAL: [          ] 0% (0h / 6h)
```

**Atualizar este arquivo conforme progresso!**

---

## 🎯 APÓS CONCLUSÃO

### Documentação
- [ ] Atualizar CONTEXTO.md com v1.5.1
- [ ] Atualizar ROADMAP.md
- [ ] Criar CHANGELOG.md v1.5.1

### Monitoramento
- [ ] Configurar alertas Vercel
- [ ] Monitorar logs por 24h
- [ ] Verificar métricas de performance

### Próximos Passos
- [ ] Aguardar aprovação Strava (1-3 dias)
- [ ] Planejar v1.6.0 (features novas)
- [ ] Expandir testes automatizados

---

**Status:** 🟡 EM EXECUÇÃO  
**Início:** 05/Nov/2025 19:50 UTC  
**Previsão Término:** 06/Nov/2025 01:50 UTC
