#!/usr/bin/env python3
"""
CORREÇÃO AUTOMÁTICA MASSIVA - 29 arquivos
Corrige TODOS os padrões problemáticos de i18n
"""

import re
import os
from pathlib import Path

# Mapeamento de arquivos e seus namespaces corretos
FILE_NAMESPACE_MAP = {
    'app/[locale]/login/page.tsx': 'auth.login',
    'app/[locale]/signup/page.tsx': 'auth.signup', 
    'app/[locale]/perfil/page.tsx': 'perfil',
    'app/[locale]/pricing/page.tsx': 'pricing',
    'app/[locale]/admin/page.tsx': 'admin',
    'app/[locale]/subscription/page.tsx': 'subscription',
}

def fix_file(file_path: str, namespace: str = None):
    """Corrige um arquivo específico"""
    
    if not os.path.exists(file_path):
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    changes = 0
    
    # 1. Corrigir useTranslations() para useTranslations('namespace')
    if namespace and "const t = useTranslations();" in content:
        content = content.replace(
            "const t = useTranslations();",
            f"const t = useTranslations('{namespace}');\n  const tErrors = useTranslations('errors');"
        )
        changes += 1
    
    # 2. Remover padrões t.namespace?.key || 'fallback'
    # Padrão: t.auth?.login?.key || 'fallback' -> t('key')
    pattern1 = r"t\.(\w+)\?\.(\w+)\?\.(\w+)\s*\|\|\s*['\"]([^'\"]+)['\"]"
    matches = re.findall(pattern1, content)
    for match in matches:
        old = f"t.{match[0]}?.{match[1]}?.{match[2]} || '{match[3]}'"
        new = f"t('{match[2]}')"
        content = content.replace(old, new)
        changes += 1
    
    # 3. Remover padrões t.errors?.key || 'fallback'
    pattern2 = r"t\.errors\?\.(\w+)\s*\|\|\s*['\"]([^'\"]+)['\"]"
    matches2 = re.findall(pattern2, content)
    for match in matches2:
        old = f"t.errors?.{match[0]} || '{match[1]}'"
        new = f"tErrors('{match[0]}')"
        content = content.replace(old, new)
        changes += 1
    
    # 4. Remover padrões simples: t('key') || 'fallback'
    pattern3 = r"t\(['\"](\w+)['\"]\)\s*\|\|\s*['\"]([^'\"]+)['\"]"
    content = re.sub(pattern3, r"t('\1')", content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

print("🔧 CORREÇÃO AUTOMÁTICA MASSIVA\n")
print("Corrigindo 29 arquivos...")
print("=" * 70)

fixed_count = 0
failed_count = 0

# Fase 1: UI Críticos
print("\n📱 FASE 1: UI Críticos")
for file, namespace in FILE_NAMESPACE_MAP.items():
    print(f"  Corrigindo: {file}...")
    if fix_file(file, namespace):
        print(f"    ✅ Corrigido")
        fixed_count += 1
    else:
        print(f"    ⚠️  Não encontrado ou sem mudanças")
        failed_count += 1

# Fase 2: APIs e Libs (remover fallbacks apenas)
print("\n🔌 FASE 2: APIs e Libs")
api_files = [
    'app/api/workouts/weekly/route.ts',
    'app/api/workouts/recent/route.ts',
    'app/api/plan/adjust/route.ts',
    'app/api/plan/generate/route.ts',
    'app/api/strava/callback/route.ts',
    'app/api/training-log/route.ts',
    'app/api/training-log/analyze/route.ts',
    'app/api/ai/analyze-and-adjust/route.ts',
    'lib/ai-plan-generator.ts',
    'lib/auto-adjust-service.ts',
    'lib/auth.ts',
    'lib/llm-client.ts',
    'lib/multi-race-plan-generator.ts',
    'lib/i18n/api-utils.ts',
    'hooks/use-toast.ts',
]

for file in api_files:
    if os.path.exists(file):
        print(f"  Corrigindo: {file}...")
        if fix_file(file):
            print(f"    ✅ Corrigido")
            fixed_count += 1
        else:
            print(f"    ℹ️  Sem mudanças")

print("\n" + "=" * 70)
print(f"\n📊 RESULTADO:")
print(f"  ✅ Corrigidos: {fixed_count}")
print(f"  ⚠️  Pulados: {failed_count}")
print(f"\n✅ Correção automática concluída!")
print("\n💡 Próximo passo: Verificar manualmente e commitar")
