# 🔍 DIAGNÓSTICO DETALHADO - PROBLEMAS DE TRADUÇÃO

## PROBLEMA 1: Interpolação não funciona em alguns lugares

### Dashboard - Welcome Message ✅ (Código correto)
**Localização:** `app/[locale]/dashboard/page.tsx:226`
```typescript
{session.user?.name 
  ? t('welcome', { name: session.user.name })
  : t('welcomeDefault')
}
```
**Tradução:** `"welcome": "Olá, {{name}}! 👋"`
**Status:** ✅ Código correto, hook deveria funcionar

### Plano - Workout Distance/Duration/Pace ✅ (Código correto)
**Localização:** `app/[locale]/plano/page.tsx:338-343`
```typescript
{workout.distance && (
  <p className="text-sm mt-1">
    📍 {t('workout.distance', { distance: workout.distance })}
    {workout.targetPace && ` • ${t('workout.pace', { pace: workout.targetPace })}`}
  </p>
)}
{workout.duration && !workout.distance && (
  <p className="text-sm mt-1">⏱️ {t('workout.duration', { duration: workout.duration })}</p>
)}
```
**Traduções:**
- `"distance": "{{distance}} km"`
- `"duration": "{{duration}} min"`
- `"pace": "Pace: {{pace}}"`
**Status:** ✅ Código correto, hook deveria funcionar

## PROBLEMA 2: Keys de tradução expostas

### Plano - Phase Names
**Localização:** `app/[locale]/plano/page.tsx:211, 259`
```typescript
// Linha 211
{currentWeek && t(`phases.${currentWeek.phase}`, currentWeek.phase)}

// Linha 259
{t(`phases.${currentWeek.phase}`, currentWeek.phase).toUpperCase()}
```

**Valores possíveis de phase:** "base", "build", "peak", "taper", "race" (do banco)
**Traduções disponíveis:**
```json
"phases": {
  "base": "Base",
  "build": "Construção",
  "peak": "Pico",
  "taper": "Polimento",
  "recovery": "Recuperação"
}
```

**PROBLEMA IDENTIFICADO:**
- O banco pode retornar "base", "build", etc.
- A tradução espera `t('phases.base')` → "Base"
- Mas o código faz `t('phases.base', 'base')` que DEVERIA funcionar
- Se não encontra, retorna o fallback 'base'

**HIPÓTESE:**
- O namespace 'plano' pode não incluir 'phases'
- Ou a estrutura do JSON está errada

## ANÁLISE DO HOOK useTranslations

### Implementação Atual (hooks.ts)
```typescript
export function useTranslations(namespace?: string): TranslationFunction {
  const locale = useLocale();
  const t = translations[locale];

  if (!namespace) {
    const translateFn = (key: string, values?: Record<string, any>): string => {
      if (!key || typeof key !== 'string') return key || '';
      const keys = key.split('.');
      let value: any = t;
      for (const k of keys) {
        value = value?.[k];
      }
      const result = value || key;
      return interpolate(result, values);
    };
    return translateFn;
  }

  // Handle nested namespaces like 'header.userMenu'
  const namespaceKeys = namespace.split('.');
  let namespaceData: any = t;
  for (const key of namespaceKeys) {
    namespaceData = namespaceData?.[key];
  }
  namespaceData = namespaceData || {};
  
  const translateFn = (key: string, values?: Record<string, any>): string => {
    if (!key || typeof key !== 'string') return key || '';
    const keys = key.split('.');
    let value: any = namespaceData;
    for (const k of keys) {
      value = value?.[k];
    }
    const result = value || key;
    return interpolate(result, values);
  };
  return translateFn;
}

function interpolate(text: string, values?: Record<string, any>): string {
  if (!values) return text;
  // Support both {{key}} and {key} syntax
  return text
    .replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`))
    .replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}
```

## TESTES NECESSÁRIOS

### Teste 1: Verificar estrutura do JSON
- Confirmar que 'phases' está dentro de 'plano' namespace
- Ou confirmar que está no root do JSON

### Teste 2: Verificar interpolação
- Testar se interpolate() funciona com valores reais
- Verificar se o problema é no regex

### Teste 3: Verificar namespace
- Testar se useTranslations('plano') acessa corretamente
- Verificar hierarquia do JSON

## SOLUÇÕES PROPOSTAS

### Solução 1: Verificar estrutura do JSON
- Garantir que todas as keys estão no lugar certo
- Phases pode estar fora do namespace 'plano'

### Solução 2: Adicionar debug temporário
- Adicionar console.log para ver valores reais
- Verificar o que está sendo passado vs o que é retornado

### Solução 3: Normalizar keys
- Criar helper para normalizar phase keys
- Ex: "Base Aeróbica" → "base"

### Solução 4: Fallback melhor
- Em vez de retornar a key, capitalize o fallback
- Ex: 'base' → 'Base'

## PRÓXIMOS PASSOS

1. ✅ Verificar estrutura completa do pt-BR.json
2. ✅ Identificar onde phases está localizado
3. ✅ Verificar se interpolação funciona em produção
4. ⏳ Corrigir estrutura se necessário
5. ⏳ Testar em todas as páginas
