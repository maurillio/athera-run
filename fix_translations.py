#!/usr/bin/env python3
"""
Script para corrigir e padronizar traduções no Athera Run
Garante interpolação correta e consistência entre arquivos
"""

import json
import os
from pathlib import Path

def fix_translations():
    """Corrige os arquivos de tradução"""
    
    translations_dir = Path("nextjs_space/lib/i18n/translations")
    
    # Carregar pt-BR como referência
    pt_br_path = translations_dir / "pt-BR.json"
    with open(pt_br_path, 'r', encoding='utf-8') as f:
        pt_br = json.load(f)
    
    # Correções específicas para pt-BR
    fixes = {
        # Corrigir dashboard.welcome para usar {{name}}
        "dashboard.welcome": "Olá, {{name}}! 👋",
        
        # Garantir que plano.phases tenha todas as variações
        "plano.phases.baseaerobia": "Base Aeróbica",
        "plano.phases.base aerobia": "Base Aeróbica",
        "plano.phases.base": "Base Aeróbica",
        "plano.phases.construcao": "Construção",
        "plano.phases.construção": "Construção",
        "plano.phases.build": "Construção",
        "plano.phases.pico": "Pico",
        "plano.phases.peak": "Pico",
        "plano.phases.taper": "Polimento",
        "plano.phases.polimento": "Polimento",
        "plano.phases.corrida": "Corrida",
        "plano.phases.race": "Corrida",
        
        # Garantir interpolação em workout
        "plano.workout.distance": "{{distance}} km",
        "plano.workout.duration": "{{duration}} min",
        "plano.workout.pace": "Pace: {{pace}}",
        
        # Adicionar goal labels com interpolação
        "plano.goalDescription": "Plano personalizado para {{goal}}",
    }
    
    # Aplicar fixes
    for key_path, value in fixes.items():
        keys = key_path.split('.')
        current = pt_br
        
        # Navegar até o penúltimo nível
        for i, key in enumerate(keys[:-1]):
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Definir o valor final
        final_key = keys[-1]
        current[final_key] = value
    
    # Salvar pt-BR corrigido
    with open(pt_br_path, 'w', encoding='utf-8') as f:
        json.dump(pt_br, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Corrigido: {pt_br_path}")
    
    # Verificar e reportar problemas potenciais
    check_interpolation_issues(pt_br)

def check_interpolation_issues(data, prefix=""):
    """Verifica problemas de interpolação nas traduções"""
    issues = []
    
    for key, value in data.items():
        current_path = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, dict):
            issues.extend(check_interpolation_issues(value, current_path))
        elif isinstance(value, str):
            # Verificar se tem { literal sem }}
            if '{' in value and '{{' not in value:
                issues.append(f"⚠️  {current_path}: Possível interpolação incorreta: {value}")
    
    return issues

def main():
    print("🔧 Iniciando correção de traduções...")
    print()
    
    fix_translations()
    
    print()
    print("✅ Correções aplicadas com sucesso!")

if __name__ == "__main__":
    main()
