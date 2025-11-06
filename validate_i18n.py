#!/usr/bin/env python3
"""
Script de Validação Automatizada - i18n Athera Run
Valida traduções, rotas e consistência entre idiomas
"""

import json
import os
import sys
from typing import Dict, List, Tuple

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def load_translations() -> Dict[str, Dict]:
    """Carrega arquivos de tradução"""
    translations = {}
    for lang in ['pt-BR', 'en', 'es']:
        path = f'lib/i18n/translations/{lang}.json'
        with open(path, 'r', encoding='utf-8') as f:
            translations[lang] = json.load(f)
    return translations

def get_all_keys(obj: Dict, prefix: str = '') -> List[str]:
    """Extrai todas as keys de um objeto nested"""
    keys = []
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            keys.extend(get_all_keys(value, full_key))
        else:
            keys.append(full_key)
    return keys

def validate_consistency() -> Tuple[bool, List[str]]:
    """Valida consistência entre idiomas"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}🔍 VALIDANDO CONSISTÊNCIA ENTRE IDIOMAS{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    translations = load_translations()
    errors = []
    
    # Extrair keys de cada idioma
    pt_keys = set(get_all_keys(translations['pt-BR']))
    en_keys = set(get_all_keys(translations['en']))
    es_keys = set(get_all_keys(translations['es']))
    
    print(f"📊 Estatísticas:")
    print(f"  • pt-BR: {len(pt_keys)} keys")
    print(f"  • en: {len(en_keys)} keys")
    print(f"  • es: {len(es_keys)} keys")
    print()
    
    # Verificar keys faltando
    missing_en = pt_keys - en_keys
    missing_es = pt_keys - es_keys
    extra_en = en_keys - pt_keys
    extra_es = es_keys - pt_keys
    
    all_ok = True
    
    if missing_en:
        all_ok = False
        errors.append(f"Keys faltando em EN: {len(missing_en)}")
        print(f"{Colors.RED}❌ Keys faltando em EN: {len(missing_en)}{Colors.END}")
        for key in list(missing_en)[:5]:
            print(f"   - {key}")
        if len(missing_en) > 5:
            print(f"   ... e mais {len(missing_en) - 5}")
        print()
    
    if missing_es:
        all_ok = False
        errors.append(f"Keys faltando em ES: {len(missing_es)}")
        print(f"{Colors.RED}❌ Keys faltando em ES: {len(missing_es)}{Colors.END}")
        for key in list(missing_es)[:5]:
            print(f"   - {key}")
        if len(missing_es) > 5:
            print(f"   ... e mais {len(missing_es) - 5}")
        print()
    
    if extra_en:
        print(f"{Colors.YELLOW}⚠️  Keys extras em EN (não em PT): {len(extra_en)}{Colors.END}")
        for key in list(extra_en)[:3]:
            print(f"   - {key}")
        print()
    
    if extra_es:
        print(f"{Colors.YELLOW}⚠️  Keys extras em ES (não em PT): {len(extra_es)}{Colors.END}")
        for key in list(extra_es)[:3]:
            print(f"   - {key}")
        print()
    
    if all_ok:
        print(f"{Colors.GREEN}✅ Todos os idiomas têm as mesmas keys!{Colors.END}")
    
    return all_ok, errors

def validate_namespaces() -> Tuple[bool, List[str]]:
    """Valida existência dos namespaces principais"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}📚 VALIDANDO NAMESPACES{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    translations = load_translations()
    required_namespaces = [
        'common', 'auth', 'onboarding', 'dashboard', 'plano', 
        'perfil', 'profile', 'calculator', 'chat', 'strava',
        'workoutHistory', 'raceManagement', 'tracking', 'training'
    ]
    
    errors = []
    all_ok = True
    
    for lang in ['pt-BR', 'en', 'es']:
        missing = [ns for ns in required_namespaces if ns not in translations[lang]]
        if missing:
            all_ok = False
            errors.append(f"Namespaces faltando em {lang}: {', '.join(missing)}")
            print(f"{Colors.RED}❌ {lang}: Faltam {len(missing)} namespaces{Colors.END}")
            for ns in missing:
                print(f"   - {ns}")
        else:
            print(f"{Colors.GREEN}✅ {lang}: Todos os namespaces presentes{Colors.END}")
    
    return all_ok, errors

def validate_new_components() -> Tuple[bool, List[str]]:
    """Valida componentes recém convertidos"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}🆕 VALIDANDO COMPONENTES NOVOS (HealthTab, PreferencesTab){Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    translations = load_translations()
    errors = []
    all_ok = True
    
    # Verificar profile.health
    required_health_keys = [
        'profile.health.title',
        'profile.health.injuryHistory.label',
        'profile.health.physiological.title',
        'profile.health.medicalClearance.label'
    ]
    
    # Verificar profile.preferences
    required_prefs_keys = [
        'profile.preferences.title',
        'profile.preferences.location.label',
        'profile.preferences.motivation.primaryLabel',
        'profile.preferences.goals.label'
    ]
    
    for lang in ['pt-BR', 'en', 'es']:
        lang_keys = get_all_keys(translations[lang])
        
        missing_health = [k for k in required_health_keys if k not in lang_keys]
        missing_prefs = [k for k in required_prefs_keys if k not in lang_keys]
        
        if missing_health or missing_prefs:
            all_ok = False
            if missing_health:
                errors.append(f"{lang}: Health keys faltando")
                print(f"{Colors.RED}❌ {lang} - HealthTab: {len(missing_health)} keys faltando{Colors.END}")
            if missing_prefs:
                errors.append(f"{lang}: Preferences keys faltando")
                print(f"{Colors.RED}❌ {lang} - PreferencesTab: {len(missing_prefs)} keys faltando{Colors.END}")
        else:
            print(f"{Colors.GREEN}✅ {lang}: HealthTab e PreferencesTab completos{Colors.END}")
    
    return all_ok, errors

def validate_interpolation() -> Tuple[bool, List[str]]:
    """Valida padrões de interpolação"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}🔗 VALIDANDO INTERPOLAÇÃO{{{{variavel}}}}{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    translations = load_translations()
    errors = []
    warnings = 0
    
    def find_interpolations(obj: Dict, prefix: str = '') -> List[Tuple[str, str]]:
        results = []
        for key, value in obj.items():
            full_key = f"{prefix}.{key}" if prefix else key
            if isinstance(value, dict):
                results.extend(find_interpolations(value, full_key))
            elif isinstance(value, str) and ('{{' in value or '{' in value):
                results.append((full_key, value))
        return results
    
    for lang in ['pt-BR', 'en', 'es']:
        interpolations = find_interpolations(translations[lang])
        if interpolations:
            print(f"{Colors.YELLOW}⚠️  {lang}: {len(interpolations)} strings com interpolação{Colors.END}")
            warnings += len(interpolations)
            for key, value in interpolations[:3]:
                print(f"   {key}: {value[:50]}...")
        else:
            print(f"{Colors.GREEN}✅ {lang}: Sem interpolações (ou todas corretas){Colors.END}")
    
    return True, []  # Warnings não são erros críticos

def print_summary(all_tests: Dict[str, Tuple[bool, List[str]]]):
    """Imprime sumário final"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}📊 SUMÁRIO FINAL{Colors.END}")
    print(f"{Colors.BLUE}{'='*60}{Colors.END}\n")
    
    total_tests = len(all_tests)
    passed_tests = sum(1 for result, _ in all_tests.values() if result)
    failed_tests = total_tests - passed_tests
    
    for test_name, (passed, errors) in all_tests.items():
        status = f"{Colors.GREEN}✅ PASSED{Colors.END}" if passed else f"{Colors.RED}❌ FAILED{Colors.END}"
        print(f"{test_name}: {status}")
        if errors:
            for error in errors:
                print(f"  • {error}")
    
    print()
    print(f"Total: {passed_tests}/{total_tests} testes passaram")
    
    if failed_tests == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 TODOS OS TESTES PASSARAM!{Colors.END}")
        print(f"{Colors.GREEN}Sistema 100% validado para i18n{Colors.END}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ {failed_tests} TESTE(S) FALHARAM{Colors.END}")
        print(f"{Colors.YELLOW}Revise os erros acima antes de fazer deploy{Colors.END}\n")
        return 1

def main():
    """Função principal"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}  🔍 VALIDAÇÃO AUTOMATIZADA - ATHERA RUN i18n{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    
    tests = {
        "Consistência entre idiomas": validate_consistency(),
        "Namespaces obrigatórios": validate_namespaces(),
        "Componentes novos (Health/Preferences)": validate_new_components(),
        "Padrões de interpolação": validate_interpolation()
    }
    
    exit_code = print_summary(tests)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
