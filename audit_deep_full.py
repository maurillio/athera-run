#!/usr/bin/env python3
"""AUDITORIA COMPLETA - TODO O SISTEMA"""
import json, re, os
from collections import defaultdict

def load_translations():
    with open('lib/i18n/translations/pt-BR.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_nested_key(obj, key_path):
    keys = key_path.split('.')
    value = obj
    for key in keys:
        if isinstance(value, dict) and key in value:
            value = value[key]
        else:
            return None
    return value

translations = load_translations()
issues_by_file = defaultdict(list)
critical_files = []

print("🔍 AUDITORIA COMPLETA DO SISTEMA\n")

# Escanear TODOS os arquivos
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.next' in root or '.git' in root:
        continue
    for file in files:
        if not file.endswith(('.tsx', '.ts')):
            continue
        
        file_path = os.path.join(root, file)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue
        
        # Buscar padrões problemáticos
        # 1. Navegação de objeto: t.auth?.signup
        if re.search(r't\.\w+\?\.\w+', content):
            issues_by_file[file_path].append('CRITICAL: Usando t.namespace?.key')
            critical_files.append(file_path)
        
        # 2. Fallbacks: || 'text'
        if re.search(r"t\([^)]+\)\s*\|\|", content) or re.search(r"t\.\w+.*\|\|", content):
            issues_by_file[file_path].append('HIGH: Usando fallback ||')
            if file_path not in critical_files:
                critical_files.append(file_path)

print(f"📊 Arquivos escaneados: {sum(1 for _ in os.walk('.'))}")
print(f"🚨 Arquivos com problemas: {len(issues_by_file)}\n")

if critical_files:
    print("━" * 70)
    print("🚨 ARQUIVOS CRÍTICOS COM PROBLEMAS:")
    print("━" * 70)
    for f in critical_files[:20]:
        print(f"\n📄 {f}")
        for issue in issues_by_file[f]:
            print(f"   • {issue}")

print("\n" + "━" * 70)
print(f"TOTAL: {len(critical_files)} arquivos precisam correção")
print("━" * 70)
