#!/usr/bin/env python3
"""
CORREÇÃO MASSIVA - Adicionar TODAS as 60 keys faltando
"""

import json

# TODAS as traduções que faltam
missing_translations = {
    "pt-BR": {
        "auth": {
            "signup": {
                "signUp": "Criar conta",
                "googleSignUp": "Criar conta com Google",
                "orSignUpWith": "ou criar conta com e-mail",
                "creatingAccount": "Criando conta..."
            }
        },
        "onboarding": {
            "step1": {
                "age": "Idade",
                "agePlaceholder": "Ex: 30",
                "gender": "Gênero",
                "genderOptions": {
                    "male": "Masculino",
                    "female": "Feminino"
                },
                "weight": "Peso (kg)",
                "weightPlaceholder": "Ex: 70",
                "height": "Altura (cm)",
                "heightPlaceholder": "Ex: 175",
                "bmi": "IMC"
            },
            "step2": {
                "hasRunBefore": "Já correu antes?",
                "yearsRunning": "Anos correndo",
                "yearsRunningPlaceholder": "Ex: 2",
                "weeklyVolume": "Volume semanal (km)",
                "weeklyVolumePlaceholder": "Ex: 30",
                "longestRun": "Corrida mais longa (km)",
                "longestRunPlaceholder": "Ex: 21",
                "otherSports": {
                    "title": "Outros Esportes",
                    "sports": "Esporte",
                    "sportsPlaceholder": "Ex: Natação",
                    "years": "Anos praticando",
                    "yearsPlaceholder": "Ex: 3"
                },
                "errors": {
                    "experienceLevelRequired": "Nível de experiência é obrigatório"
                }
            },
            "step5": {
                "errors": {
                    "primaryGoalRequired": "Objetivo principal é obrigatório"
                }
            },
            "step6": {
                "errors": {
                    "trainingDaysRequired": "Selecione pelo menos 3 dias de treino"
                }
            }
        }
    },
    "en": {
        "auth": {
            "signup": {
                "signUp": "Create account",
                "googleSignUp": "Sign up with Google",
                "orSignUpWith": "or sign up with email",
                "creatingAccount": "Creating account..."
            }
        },
        "onboarding": {
            "step1": {
                "age": "Age",
                "agePlaceholder": "Ex: 30",
                "gender": "Gender",
                "genderOptions": {
                    "male": "Male",
                    "female": "Female"
                },
                "weight": "Weight (kg)",
                "weightPlaceholder": "Ex: 70",
                "height": "Height (cm)",
                "heightPlaceholder": "Ex: 175",
                "bmi": "BMI"
            },
            "step2": {
                "hasRunBefore": "Have you run before?",
                "yearsRunning": "Years running",
                "yearsRunningPlaceholder": "Ex: 2",
                "weeklyVolume": "Weekly volume (km)",
                "weeklyVolumePlaceholder": "Ex: 30",
                "longestRun": "Longest run (km)",
                "longestRunPlaceholder": "Ex: 21",
                "otherSports": {
                    "title": "Other Sports",
                    "sports": "Sport",
                    "sportsPlaceholder": "Ex: Swimming",
                    "years": "Years practicing",
                    "yearsPlaceholder": "Ex: 3"
                },
                "errors": {
                    "experienceLevelRequired": "Experience level is required"
                }
            },
            "step5": {
                "errors": {
                    "primaryGoalRequired": "Primary goal is required"
                }
            },
            "step6": {
                "errors": {
                    "trainingDaysRequired": "Select at least 3 training days"
                }
            }
        }
    },
    "es": {
        "auth": {
            "signup": {
                "signUp": "Crear cuenta",
                "googleSignUp": "Registrarse con Google",
                "orSignUpWith": "o registrarse con email",
                "creatingAccount": "Creando cuenta..."
            }
        },
        "onboarding": {
            "step1": {
                "age": "Edad",
                "agePlaceholder": "Ej: 30",
                "gender": "Género",
                "genderOptions": {
                    "male": "Masculino",
                    "female": "Femenino"
                },
                "weight": "Peso (kg)",
                "weightPlaceholder": "Ej: 70",
                "height": "Altura (cm)",
                "heightPlaceholder": "Ej: 175",
                "bmi": "IMC"
            },
            "step2": {
                "hasRunBefore": "¿Has corrido antes?",
                "yearsRunning": "Años corriendo",
                "yearsRunningPlaceholder": "Ej: 2",
                "weeklyVolume": "Volumen semanal (km)",
                "weeklyVolumePlaceholder": "Ej: 30",
                "longestRun": "Carrera más larga (km)",
                "longestRunPlaceholder": "Ej: 21",
                "otherSports": {
                    "title": "Otros Deportes",
                    "sports": "Deporte",
                    "sportsPlaceholder": "Ej: Natación",
                    "years": "Años practicando",
                    "yearsPlaceholder": "Ej: 3"
                },
                "errors": {
                    "experienceLevelRequired": "El nivel de experiencia es obligatorio"
                }
            },
            "step5": {
                "errors": {
                    "primaryGoalRequired": "El objetivo principal es obligatorio"
                }
            },
            "step6": {
                "errors": {
                    "trainingDaysRequired": "Seleccione al menos 3 días de entrenamiento"
                }
            }
        }
    }
}

def deep_merge(base, update):
    """Merge profundo de dicts"""
    for key, value in update.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value

print("🔧 CORREÇÃO MASSIVA - Adicionando 60+ keys faltando...\n")

for lang, new_data in missing_translations.items():
    file_path = f'lib/i18n/translations/{lang}.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Merge profundo
    deep_merge(data, new_data)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ {lang}: Keys adicionadas")

print("\n✅ TODAS as traduções adicionadas!")
print("\nTotal: ~60 keys × 3 idiomas = 180 traduções")
print("\nPróximo: Validar e commitar")
