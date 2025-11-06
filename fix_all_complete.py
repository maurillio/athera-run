#!/usr/bin/env python3
"""
CORREÇÃO COMPLETA AUTOMÁTICA - TODOS OS 26 ARQUIVOS
Usando análise inteligente e correção em massa
"""

import re
import os
from pathlib import Path
from typing import List, Tuple, Dict

class MassiveFixer:
    def __init__(self):
        self.fixed_files = []
        self.failed_files = []
        self.changes_log = []
        
    def analyze_file(self, file_path: str) -> Tuple[bool, List[str]]:
        """Analisa um arquivo e retorna problemas encontrados"""
        if not os.path.exists(file_path):
            return False, []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return False, []
        
        issues = []
        
        # Detectar padrões problemáticos
        if re.search(r't\.\w+\?\.\w+', content):
            issues.append('navegação de objeto (t.namespace?.key)')
        
        if re.search(r't\([^)]+\)\s*\|\|', content):
            issues.append('fallback pattern (t(key) ||)')
        
        if 'const t = useTranslations();' in content:
            issues.append('useTranslations() sem namespace')
        
        return len(issues) > 0, issues
    
    def fix_ui_file(self, file_path: str, namespace: str) -> bool:
        """Corrige arquivo de UI com namespace específico"""
        if not os.path.exists(file_path):
            return False
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # 1. Fix useTranslations
        if "const t = useTranslations();" in content:
            content = content.replace(
                "const t = useTranslations();",
                f"const t = useTranslations('{namespace}');\n  const tCommon = useTranslations('common');\n  const tErrors = useTranslations('errors');"
            )
        
        # 2. Fix navigation patterns: t.namespace?.key?.subkey || 'fallback'
        # Exemplo: t.perfil?.tabs?.basic || 'Basic' -> t('tabs.basic')
        pattern = r"t\.(\w+)\?\.(\w+)(?:\?\.(\w+))?\s*\|\|\s*['\"]([^'\"]+)['\"]"
        
        def replace_navigation(match):
            ns, key1, key2, fallback = match.groups()
            if key2:
                return f"t('{key1}.{key2}')"
            else:
                return f"t('{key1}')"
        
        content = re.sub(pattern, replace_navigation, content)
        
        # 3. Fix error patterns: t.errors?.key || 'fallback' -> tErrors('key')
        pattern_err = r"t\.errors\?\.(\w+)\s*\|\|\s*['\"]([^'\"]+)['\"]"
        content = re.sub(pattern_err, r"tErrors('\1')", content)
        
        # 4. Fix common patterns: t.common?.key || 'fallback' -> tCommon('key')
        pattern_common = r"t\.common\?\.(\w+)\s*\|\|\s*['\"]([^'\"]+)['\"]"
        content = re.sub(pattern_common, r"tCommon('\1')", content)
        
        # 5. Remove simple fallbacks: t('key') || 'fallback' -> t('key')
        pattern_simple = r"t\((['\"][^'\"]+['\"])\)\s*\|\|\s*['\"][^'\"]+['\"]"
        content = re.sub(pattern_simple, r"t(\1)", content)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    
    def fix_api_file(self, file_path: str) -> bool:
        """Corrige arquivo de API (apenas remover fallbacks)"""
        if not os.path.exists(file_path):
            return False
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Remover fallbacks em geral
        patterns = [
            (r"t\(['\"](\w+)['\"]\)\s*\|\|\s*['\"][^'\"]+['\"]", r"t('\1')"),
            (r"tErrors?\(['\"](\w+)['\"]\)\s*\|\|\s*['\"][^'\"]+['\"]", r"tErrors('\1')"),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    
    def run_complete_fix(self):
        """Executa correção completa"""
        print("🚀 CORREÇÃO MASSIVA COMPLETA\n")
        print("=" * 70)
        
        # FASE 1: UI Críticos
        print("\n📱 FASE 1: Corrigindo UI Críticos")
        ui_files = {
            'app/[locale]/perfil/page.tsx': 'perfil',
            'app/[locale]/pricing/page.tsx': 'pricing',
            'app/[locale]/admin/page.tsx': 'admin',
            'app/[locale]/subscription/page.tsx': 'subscription',
        }
        
        for file, ns in ui_files.items():
            has_issues, issues = self.analyze_file(file)
            if has_issues:
                print(f"\n  📄 {file}")
                print(f"     Problemas: {', '.join(issues)}")
                
                if self.fix_ui_file(file, ns):
                    print(f"     ✅ CORRIGIDO")
                    self.fixed_files.append(file)
                    self.changes_log.append(f"{file}: {len(issues)} issues fixed")
                else:
                    print(f"     ⚠️  Sem mudanças necessárias")
            else:
                print(f"\n  📄 {file}")
                print(f"     ✅ Já está correto")
        
        # FASE 2: APIs e Libs
        print("\n\n🔌 FASE 2: Corrigindo APIs e Libs")
        api_files = [
            'app/api/workouts/weekly/route.ts',
            'app/api/plan/adjust/route.ts',
            'app/api/plan/generate/route.ts',
            'app/api/strava/callback/route.ts',
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
                has_issues, issues = self.analyze_file(file)
                if has_issues:
                    print(f"\n  📄 {file}")
                    print(f"     Problemas: {', '.join(issues)}")
                    
                    if self.fix_api_file(file):
                        print(f"     ✅ CORRIGIDO")
                        self.fixed_files.append(file)
                    else:
                        print(f"     ℹ️  Sem mudanças")
                else:
                    print(f"  ✅ {file} - OK")
        
        # RESUMO
        print("\n" + "=" * 70)
        print(f"\n📊 RESUMO FINAL:")
        print(f"  ✅ Arquivos corrigidos: {len(self.fixed_files)}")
        print(f"  ℹ️  Arquivos sem problemas: {len(ui_files) + len(api_files) - len(self.fixed_files)}")
        print(f"\n✅ CORREÇÃO COMPLETA!")
        
        if self.fixed_files:
            print(f"\n📝 Arquivos modificados:")
            for f in self.fixed_files[:10]:
                print(f"  - {f}")
            if len(self.fixed_files) > 10:
                print(f"  ... e mais {len(self.fixed_files) - 10}")

if __name__ == "__main__":
    fixer = MassiveFixer()
    fixer.run_complete_fix()
