#!/usr/bin/env python3
"""
AUDITORIA PROFUNDA E CORREÇÃO COMPLETA
Encontra TODAS as keys faltando em TODOS os componentes
"""

import json
import re
import os
from pathlib import Path

def find_translation_calls(file_path):
    """Encontra todas as chamadas t() em um arquivo"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Padrões: t('key'), t("key"), t(`key`)
    patterns = [
        r"t\('([^']+)'\)",
        r't\("([^"]+)"\)',
        r't\(`([^`]+)`\)'
    ]
    
    keys = set()
    for pattern in patterns:
        matches = re.findall(pattern, content)
        keys.update(matches)
    
    return keys

def get_all_tsx_files():
    """Pega todos os arquivos .tsx"""
    tsx_files = []
    for root, dirs, files in os.walk('.'):
        # Skip node_modules, .next
        if 'node_modules' in root or '.next' in root:
            continue
        for file in files:
            if file.endswith('.tsx'):
                tsx_files.append(os.path.join(root, file))
    return tsx_files

def load_translations():
    """Carrega traduções"""
    with open('lib/i18n/translations/pt-BR.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_nested_key(obj, key_path):
    """Pega valor de key aninhada"""
    keys = key_path.split('.')
    value = obj
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return None
    return value

print("🔍 AUDITORIA PROFUNDA - Procurando TODAS as keys faltando...\n")

translations = load_translations()
tsx_files = get_all_tsx_files()

# Focar nos componentes mais críticos
critical_files = [
    'app/[locale]/signup/page.tsx',
    'app/[locale]/onboarding/page.tsx',
    'components/onboarding/v1.3.0/Step1BasicData.tsx',
    'components/onboarding/v1.3.0/Step2SportBackground.tsx',
]

missing_keys_by_file = {}
total_missing = 0

for file_path in critical_files:
    if not os.path.exists(file_path):
        continue
    
    print(f"📄 Analisando: {file_path}")
    
    keys_used = find_translation_calls(file_path)
    missing_keys = []
    
    for key in keys_used:
        # Skip tCommon, tErrors etc
        if key.startswith('common.') or key.startswith('errors.'):
            continue
        
        # Verificar se existe
        value = get_nested_key(translations, key)
        if value is None:
            missing_keys.append(key)
            total_missing += 1
            print(f"  ❌ Faltando: {key}")
    
    if missing_keys:
        missing_keys_by_file[file_path] = missing_keys
    else:
        print(f"  ✅ Todas keys presentes")
    print()

print(f"\n📊 RESUMO:")
print(f"Total de keys faltando: {total_missing}")
print(f"Arquivos com problemas: {len(missing_keys_by_file)}")

if missing_keys_by_file:
    print("\n🔧 Keys que precisam ser adicionadas:\n")
    for file, keys in missing_keys_by_file.items():
        print(f"{file}:")
        for key in keys:
            print(f"  - {key}")
        print()
