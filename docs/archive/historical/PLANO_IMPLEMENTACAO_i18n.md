# 🌐 PLANO DE IMPLEMENTAÇÃO - INTERNACIONALIZAÇÃO (i18n)

**Data:** 04/Nov/2025 13:21 UTC  
**Versão Base:** 1.3.0 (100% Completo)  
**Versão Alvo:** 1.4.0 (Multi-idioma)  
**Idiomas:** Português-BR, English (US), Español  
**Prazo Estimado:** 5-7 dias úteis  
**Prioridade:** ALTA (expansão internacional)

---

## 📋 ÍNDICE

1. [Overview](#overview)
2. [Stack de i18n](#stack-de-i18n)
3. [Fases de Implementação](#fases-de-implementação)
4. [Estrutura de Arquivos](#estrutura-de-arquivos)
5. [Checklist Detalhado](#checklist-detalhado)
6. [Testes e Validação](#testes-e-validação)

---

## 🎯 OVERVIEW

### Objetivo
Adicionar suporte completo a **3 idiomas** no Athera Run:
- 🇧🇷 **Português (Brasil)** - pt-BR (padrão atual)
- 🇺🇸 **English (US)** - en-US
- 🇪🇸 **Español** - es-ES

### Escopo
✅ Interface completa (Frontend)  
✅ Emails transacionais  
✅ Planos de treino gerados pela IA  
✅ Notificações  
✅ Documentação do usuário  
❌ SEO/URLs (manter em inglês)  
❌ Conteúdo de blog (fase futura)

### Impacto Esperado
- Expansão para mercados: EUA, América Latina, Europa
- Aumento de 200-300% no público potencial
- Diferencial competitivo vs concorrentes locais

---

## 🛠️ STACK DE i18n

### Biblioteca Escolhida: **next-intl**

**Por quê next-intl?**
✅ Integração nativa com Next.js 14 App Router  
✅ Server Components + Client Components  
✅ Type-safe (TypeScript completo)  
✅ Formatação de datas/números/moedas  
✅ Pluralização automática  
✅ Namespace para organização  
✅ Performance otimizada (bundle splitting)

### Alternativas Consideradas
- ❌ **react-i18next**: Mais pesado, complexo para App Router
- ❌ **next-i18next**: Descontinuado para App Router
- ❌ **FormatJS**: Menos features out-of-the-box

### Dependências
```json
{
  "next-intl": "^3.0.0"
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Organização de Traduções

```
nextjs_space/
├── messages/                    # Arquivos de tradução
│   ├── pt-BR.json              # Português (padrão)
│   ├── en-US.json              # Inglês
│   └── es-ES.json              # Espanhol
│
├── middleware.ts                # Detector de idioma (atualizado)
│
├── i18n.ts                      # Configuração next-intl
│
├── app/
│   └── [locale]/               # Rotas com idioma
│       ├── layout.tsx          # Layout com provider
│       ├── page.tsx            # Home
│       ├── onboarding/         # Onboarding traduzido
│       ├── perfil/             # Perfil traduzido
│       ├── plano/              # Plano traduzido
│       └── ...                 # Todas as páginas
│
├── components/
│   ├── LanguageSwitcher.tsx    # Seletor de idioma
│   └── ...                     # Componentes traduzidos
│
└── lib/
    ├── ai-plan-generator.ts    # IA multi-idioma
    └── email-templates.ts      # Emails multi-idioma
```

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### **FASE 1: SETUP E CONFIGURAÇÃO (Dia 1)**

#### 1.1 Instalação
```bash
cd nextjs_space
npm install next-intl
```

#### 1.2 Criar Arquivos de Configuração

**i18n.ts**
```typescript
import { getRequestConfig } from 'next-intl/server';

export const locales = ['pt-BR', 'en-US', 'es-ES'] as const;
export const defaultLocale = 'pt-BR' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));
```

**middleware.ts (atualizado)**
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // pt-BR não aparece na URL
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

#### 1.3 Criar Arquivos de Tradução Base

**messages/pt-BR.json** (extrair do código atual)
```json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "next": "Próximo",
    "back": "Voltar"
  },
  "auth": {
    "login": "Entrar",
    "signup": "Cadastrar",
    "logout": "Sair"
  },
  "onboarding": {
    "title": "Vamos criar seu plano personalizado",
    "step1": {
      "title": "Dados Básicos",
      "description": "Informações essenciais"
    }
  }
}
```

**messages/en-US.json**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "next": "Next",
    "back": "Back"
  },
  "auth": {
    "login": "Login",
    "signup": "Sign up",
    "logout": "Logout"
  },
  "onboarding": {
    "title": "Let's create your personalized plan",
    "step1": {
      "title": "Basic Data",
      "description": "Essential information"
    }
  }
}
```

**messages/es-ES.json**
```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "next": "Siguiente",
    "back": "Atrás"
  },
  "auth": {
    "login": "Iniciar sesión",
    "signup": "Registrarse",
    "logout": "Cerrar sesión"
  },
  "onboarding": {
    "title": "Vamos a crear tu plan personalizado",
    "step1": {
      "title": "Datos Básicos",
      "description": "Información esencial"
    }
  }
}
```

---

### **FASE 2: MIGRAÇÃO DE COMPONENTES (Dias 2-3)**

#### 2.1 Layout Principal

**app/[locale]/layout.tsx**
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [
    { locale: 'pt-BR' },
    { locale: 'en-US' },
    { locale: 'es-ES' }
  ];
}
```

#### 2.2 Componente Language Switcher

**components/LanguageSwitcher.tsx**
```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' }
  ];

  const changeLanguage = (newLocale: string) => {
    // Remove locale atual da URL
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    
    // Adiciona novo locale
    const newPath = newLocale === 'pt-BR' 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
    <select 
      value={locale} 
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-3 py-2 border rounded-lg"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

#### 2.3 Exemplo de Componente Traduzido

**Antes:**
```typescript
export default function Button() {
  return <button>Salvar</button>;
}
```

**Depois:**
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Button() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>;
}
```

---

### **FASE 3: PÁGINAS PRINCIPAIS (Dias 4-5)**

#### Prioridade de Migração

**Alta Prioridade (Dia 4):**
1. ✅ Home (/)
2. ✅ Login/Signup (/login, /signup)
3. ✅ Onboarding (/onboarding)
4. ✅ Dashboard (/dashboard)

**Média Prioridade (Dia 5):**
5. ✅ Perfil (/perfil)
6. ✅ Plano (/plano)
7. ✅ Calculadoras (/calculator)
8. ✅ Pricing (/pricing)

**Baixa Prioridade (Dia 6):**
9. ✅ Tracking (/tracking)
10. ✅ Nutrition (/nutrition)
11. ✅ Prevention (/prevention)
12. ✅ Chat (/chat)

---

### **FASE 4: IA MULTI-IDIOMA (Dia 6)**

#### 4.1 Atualizar AI Plan Generator

**lib/ai-plan-generator.ts**
```typescript
import { getTranslations } from 'next-intl/server';

export async function generateAIPlan(
  profile: Profile, 
  locale: string = 'pt-BR'
) {
  const t = await getTranslations({ locale });
  
  const prompt = `
    ${locale === 'pt-BR' ? 'Você é um treinador de corrida brasileiro.' : ''}
    ${locale === 'en-US' ? 'You are a running coach from the United States.' : ''}
    ${locale === 'es-ES' ? 'Eres un entrenador de running español.' : ''}
    
    Generate a training plan in ${getLanguageName(locale)}.
    
    Profile: ${JSON.stringify(profile)}
    
    IMPORTANT: Respond ONLY in ${getLanguageName(locale)}.
  `;
  
  const plan = await callLLM(prompt);
  return plan;
}

function getLanguageName(locale: string): string {
  const names = {
    'pt-BR': 'Portuguese (Brazilian)',
    'en-US': 'English',
    'es-ES': 'Spanish'
  };
  return names[locale] || names['pt-BR'];
}
```

#### 4.2 Salvar Idioma no Perfil

**Adicionar campo ao schema:**
```prisma
model AthleteProfile {
  // ... campos existentes ...
  locale String @default("pt-BR") // pt-BR, en-US, es-ES
}
```

---

### **FASE 5: EMAILS E NOTIFICAÇÕES (Dia 7)**

#### 5.1 Templates de Email Multi-idioma

**lib/email-templates.ts**
```typescript
export function getWelcomeEmail(locale: string, userName: string) {
  const templates = {
    'pt-BR': {
      subject: `Bem-vindo ao Athera Run, ${userName}!`,
      body: `Olá ${userName}! Estamos felizes em ter você...`
    },
    'en-US': {
      subject: `Welcome to Athera Run, ${userName}!`,
      body: `Hi ${userName}! We're excited to have you...`
    },
    'es-ES': {
      subject: `¡Bienvenido a Athera Run, ${userName}!`,
      body: `¡Hola ${userName}! Estamos felices de tenerte...`
    }
  };
  
  return templates[locale] || templates['pt-BR'];
}
```

---

## ✅ CHECKLIST DETALHADO

### Setup (Dia 1)
- [ ] Instalar next-intl
- [ ] Criar i18n.ts
- [ ] Atualizar middleware.ts
- [ ] Criar messages/pt-BR.json (base atual)
- [ ] Criar messages/en-US.json (tradução EN)
- [ ] Criar messages/es-ES.json (tradução ES)
- [ ] Testar routing com locale

### Componentes Core (Dia 2)
- [ ] Migrar app/layout.tsx → app/[locale]/layout.tsx
- [ ] Criar LanguageSwitcher component
- [ ] Migrar Header/Navigation
- [ ] Migrar Footer
- [ ] Testar mudança de idioma

### Páginas Auth (Dia 3)
- [ ] Migrar /login
- [ ] Migrar /signup
- [ ] Migrar AuthForms
- [ ] Testar fluxo de autenticação

### Onboarding (Dia 4)
- [ ] Migrar 8 componentes Step
- [ ] Traduzir validações
- [ ] Traduzir mensagens de erro
- [ ] Testar onboarding completo

### Dashboard e Perfil (Dia 5)
- [ ] Migrar /dashboard
- [ ] Migrar /perfil (6 tabs)
- [ ] Migrar /plano
- [ ] Testar CRUD de dados

### IA e Backend (Dia 6)
- [ ] Adicionar campo locale no schema
- [ ] Migração banco de dados
- [ ] Atualizar ai-plan-generator.ts
- [ ] Atualizar APIs para locale
- [ ] Testar geração de plano em 3 idiomas

### Emails e Extras (Dia 7)
- [ ] Criar templates de email multi-idioma
- [ ] Atualizar sistema de notificações
- [ ] Migrar páginas secundárias
- [ ] Testes finais E2E

### Deploy
- [ ] Build completo sem erros
- [ ] Testes de regressão
- [ ] Deploy staging
- [ ] Testes em staging
- [ ] Deploy produção
- [ ] Monitorar primeiras 48h

---

## 🧪 TESTES E VALIDAÇÃO

### Testes Unitários
```typescript
// __tests__/i18n/translations.test.ts
describe('i18n translations', () => {
  it('deve ter todas as chaves em todos os idiomas', () => {
    const ptBR = require('../messages/pt-BR.json');
    const enUS = require('../messages/en-US.json');
    const esES = require('../messages/es-ES.json');
    
    const ptKeys = getAllKeys(ptBR);
    const enKeys = getAllKeys(enUS);
    const esKeys = getAllKeys(esES);
    
    expect(ptKeys).toEqual(enKeys);
    expect(ptKeys).toEqual(esKeys);
  });
});
```

### Testes E2E
- [ ] Mudar idioma e verificar UI atualiza
- [ ] Fazer onboarding em EN e ES
- [ ] Gerar plano em 3 idiomas
- [ ] Verificar emails em 3 idiomas
- [ ] Testar persistência de idioma (refresh)

---

## 📊 ESTIMATIVAS

### Tempo por Componente
- Setup inicial: 4h
- Componentes core: 6h
- Páginas auth: 4h
- Onboarding (8 steps): 8h
- Dashboard/Perfil: 6h
- IA multi-idioma: 4h
- Emails e extras: 6h
- Testes: 4h
- **Total:** ~42 horas (5-7 dias)

### Traduções
- Português: ✅ Já existe (código atual)
- Inglês: 🔄 Traduzir (~2.000 strings)
- Espanhol: 🔄 Traduzir (~2.000 strings)

**Opções para Tradução:**
1. Manual (mais preciso, mais lento)
2. GPT-4 + Revisão humana (recomendado)
3. Serviço profissional (mais caro)

---

## 🎯 PRÓXIMOS PASSOS

### Após Aprovação do Plano:
1. ✅ Criar branch: `feature/i18n-multi-language`
2. ✅ Começar Fase 1 (Setup)
3. ✅ Commit incremental a cada fase
4. ✅ Pull request para review
5. ✅ Merge após testes

### Futuro (v1.5.0+):
- [ ] Adicionar mais idiomas (FR, DE, IT)
- [ ] SEO multi-idioma
- [ ] Conteúdo de blog traduzido
- [ ] Suporte RTL (árabe, hebraico)

---

## 📚 RECURSOS

### Documentação
- [next-intl Docs](https://next-intl-docs.vercel.app/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### Ferramentas
- [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) - VS Code extension
- [Google Translate API](https://cloud.google.com/translate) - Para tradução inicial

---

**Status:** 🟡 AGUARDANDO APROVAÇÃO  
**Prioridade:** ALTA  
**Impacto:** Expansão Internacional  
**Risco:** BAIXO (biblioteca madura)

---

**© 2025 Athera Run**  
**Plano i18n:** 04/Nov/2025 13:21 UTC  
**Versão Base:** 1.3.0 → Versão Alvo: 1.4.0
