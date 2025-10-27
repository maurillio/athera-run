from datetime import datetime, timedelta
import locale

# Tentar definir locale para português
try:
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_TIME, 'pt_PT.UTF-8')
    except:
        pass

# Datas chave
marathon_date = datetime(2026, 8, 30)  # Domingo
today = datetime(2025, 10, 22)  # Quarta-feira

# Encontrar a próxima segunda-feira para começar o plano
days_until_monday = (7 - today.weekday()) % 7
if days_until_monday == 0 and today.weekday() != 0:
    days_until_monday = 7
    
# Se hoje for segunda, começar hoje; senão começar na próxima segunda
if today.weekday() == 0:
    start_monday = today
else:
    # Como hoje é quarta (22/10), vamos começar na segunda-feira anterior (20/10)
    # para que a primeira semana já esteja em andamento
    start_monday = today - timedelta(days=today.weekday())

print(f"Primeira segunda-feira do plano: {start_monday.strftime('%d/%m/%Y')} ({start_monday.strftime('%A')})")

# Dias de treino: terça (1), quinta (3), domingo (6)
training_days = {
    'terca': 1,  # terça-feira
    'quinta': 3,  # quinta-feira
    'domingo': 6  # domingo
}

swimming_days = {
    'segunda': 0,  # segunda-feira
    'sexta': 4  # sexta-feira
}

def get_weekday_name_pt(date):
    """Retorna o nome do dia da semana em português"""
    days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    return days[date.weekday()]

def format_date(date):
    """Formata data como DD/MM"""
    return date.strftime('%d/%m')

# Estrutura do plano (44 semanas até a maratona)
phases = [
    {
        'name': 'FASE 1: BASE AERÓBICA',
        'weeks': 9,
        'description': '9 semanas de construção de base aeróbica',
        'weeks_detail': [
            # Semana 1
            {
                'num': 1,
                'terca': '6 km em ritmo fácil (Z2) + Força parte superior do corpo',
                'quinta': '8 km em ritmo fácil (Z2) + Força core e pernas',
                'domingo': '10 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '30 minutos técnica'
            },
            # Semana 2
            {
                'num': 2,
                'terca': '7 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '8 km em ritmo fácil (Z2) + Força core e pernas',
                'domingo': '12 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '30 minutos'
            },
            # Semana 3
            {
                'num': 3,
                'terca': '7 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '9 km em ritmo fácil (Z2) + Força core e pernas',
                'domingo': '14 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '35 minutos'
            },
            # Semana 4 (RECUPERAÇÃO)
            {
                'num': 4,
                'recovery': True,
                'terca': '5 km em ritmo fácil (Z2) + Força leve',
                'quinta': '6 km em ritmo fácil (Z2) + Força leve',
                'domingo': '10 km em ritmo fácil (Z2)',
                'natacao': '25 minutos técnica'
            },
            # Semana 5
            {
                'num': 5,
                'terca': '8 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '10 km em ritmo fácil (Z2) + Força core e pernas',
                'domingo': '16 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '35 minutos'
            },
            # Semana 6
            {
                'num': 6,
                'terca': '8 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '10 km com 4x1km em Z3 + Força core e pernas',
                'domingo': '18 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '40 minutos'
            },
            # Semana 7
            {
                'num': 7,
                'terca': '9 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '11 km com 5x1km em Z3 + Força core e pernas',
                'domingo': '20 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '40 minutos'
            },
            # Semana 8
            {
                'num': 8,
                'terca': '9 km em ritmo fácil (Z2) + Força parte superior',
                'quinta': '11 km com 6x1km em Z3 + Força core e pernas',
                'domingo': '22 km em ritmo fácil (Z2) + Força parte superior',
                'natacao': '40 minutos'
            },
            # Semana 9 (RECUPERAÇÃO)
            {
                'num': 9,
                'recovery': True,
                'terca': '6 km em ritmo fácil (Z2) + Força leve',
                'quinta': '7 km em ritmo fácil (Z2) + Força leve',
                'domingo': '12 km em ritmo fácil (Z2)',
                'natacao': '30 minutos técnica'
            },
        ]
    },
    {
        'name': 'FASE 2: DESENVOLVIMENTO',
        'weeks': 9,
        'description': '9 semanas de desenvolvimento de velocidade e resistência',
        'weeks_detail': [
            # Semana 10
            {
                'num': 10,
                'terca': '10 km: aquecimento 2km + 3x2km em Z3 (rec 2min) + Força',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '24 km em ritmo fácil (Z2) + Força',
                'natacao': '40 minutos'
            },
            # Semana 11
            {
                'num': 11,
                'terca': '10 km: aquecimento 2km + 4x2km em Z3 (rec 2min) + Força',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '26 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
            # Semana 12
            {
                'num': 12,
                'terca': '11 km: aquecimento 2km + 5x1.5km em Z3 (rec 90s) + Força',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '28 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
            # Semana 13 (RECUPERAÇÃO)
            {
                'num': 13,
                'recovery': True,
                'terca': '7 km em ritmo fácil (Z2) + Força leve',
                'quinta': '8 km em ritmo fácil (Z2) + Força leve',
                'domingo': '15 km em ritmo fácil (Z2)',
                'natacao': '35 minutos'
            },
            # Semana 14
            {
                'num': 14,
                'terca': '12 km: aquecimento 2km + 6x1.5km em Z3 (rec 90s) + Força',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '30 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
            # Semana 15
            {
                'num': 15,
                'terca': '12 km: aquecimento 2km + 3x3km em Z3 (rec 2min) + Força',
                'quinta': '14 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '32 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
            # Semana 16
            {
                'num': 16,
                'terca': '12 km: aquecimento 2km + 4x2.5km em Z3 (rec 2min) + Força',
                'quinta': '14 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '33 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
            # Semana 17
            {
                'num': 17,
                'recovery': True,
                'terca': '8 km em ritmo fácil (Z2) + Força leve',
                'quinta': '9 km em ritmo fácil (Z2) + Força leve',
                'domingo': '16 km em ritmo fácil (Z2)',
                'natacao': '35 minutos'
            },
            # Semana 18
            {
                'num': 18,
                'terca': '13 km: aquecimento 2km + 5x2km em Z3 (rec 90s) + Força',
                'quinta': '15 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '35 km em ritmo fácil (Z2) + Força',
                'natacao': '45 minutos'
            },
        ]
    },
    {
        'name': 'FASE 3: ESPECÍFICA',
        'weeks': 12,
        'description': '12 semanas de treino específico para maratona',
        'weeks_detail': [
            # Semana 19
            {
                'num': 19,
                'terca': '14 km: aquecimento 3km + 8km em ritmo maratona + 3km desaquecimento',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '32 km com últimos 8km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 20
            {
                'num': 20,
                'terca': '15 km: aquecimento 3km + 10km em ritmo maratona + 2km desaquecimento',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '35 km com últimos 10km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 21
            {
                'num': 21,
                'terca': '16 km: aquecimento 3km + 11km em ritmo maratona + 2km desaquecimento',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '36 km com últimos 12km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 22 (RECUPERAÇÃO)
            {
                'num': 22,
                'recovery': True,
                'terca': '8 km em ritmo fácil (Z2) + Força leve',
                'quinta': '10 km em ritmo fácil (Z2) + Força leve',
                'domingo': '18 km em ritmo fácil (Z2)',
                'natacao': '40 minutos'
            },
            # Semana 23
            {
                'num': 23,
                'terca': '16 km: aquecimento 2km + 12km em ritmo maratona + 2km desaquecimento',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '37 km com últimos 14km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 24
            {
                'num': 24,
                'terca': '17 km: aquecimento 2km + 13km em ritmo maratona + 2km desaquecimento',
                'quinta': '14 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '38 km com últimos 16km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 25
            {
                'num': 25,
                'terca': '18 km: aquecimento 2km + 14km em ritmo maratona + 2km desaquecimento',
                'quinta': '14 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '40 km com últimos 18km em ritmo maratona (LONGÃO PRINCIPAL)',
                'natacao': '45 minutos'
            },
            # Semana 26 (RECUPERAÇÃO)
            {
                'num': 26,
                'recovery': True,
                'terca': '9 km em ritmo fácil (Z2) + Força leve',
                'quinta': '10 km em ritmo fácil (Z2) + Força leve',
                'domingo': '20 km em ritmo fácil (Z2)',
                'natacao': '40 minutos'
            },
            # Semana 27
            {
                'num': 27,
                'terca': '16 km: aquecimento 2km + 12km em ritmo maratona + 2km desaquecimento',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '35 km com últimos 15km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 28
            {
                'num': 28,
                'terca': '17 km: aquecimento 2km + 13km em ritmo maratona + 2km desaquecimento',
                'quinta': '14 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '36 km com últimos 16km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 29
            {
                'num': 29,
                'terca': '16 km: aquecimento 2km + 12km em ritmo maratona + 2km desaquecimento',
                'quinta': '13 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '32 km com últimos 14km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 30 (RECUPERAÇÃO)
            {
                'num': 30,
                'recovery': True,
                'terca': '9 km em ritmo fácil (Z2) + Força leve',
                'quinta': '10 km em ritmo fácil (Z2) + Força leve',
                'domingo': '20 km em ritmo fácil (Z2)',
                'natacao': '40 minutos'
            },
        ]
    },
    {
        'name': 'FASE 4: AJUSTE FINO',
        'weeks': 10,
        'description': '10 semanas de ajuste fino e simulação',
        'weeks_detail': [
            # Semana 31
            {
                'num': 31,
                'terca': '15 km: aquecimento 2km + 11km em ritmo maratona + 2km desaquecimento',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '30 km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 32
            {
                'num': 32,
                'terca': '14 km: aquecimento 2km + 10km em ritmo maratona + 2km desaquecimento',
                'quinta': '12 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '28 km em ritmo maratona',
                'natacao': '45 minutos'
            },
            # Semana 33
            {
                'num': 33,
                'terca': '13 km: aquecimento 2km + 3x3km em ritmo maratona (rec 2min) + Força',
                'quinta': '11 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '25 km em ritmo maratona',
                'natacao': '40 minutos'
            },
            # Semana 34 (RECUPERAÇÃO)
            {
                'num': 34,
                'recovery': True,
                'terca': '8 km em ritmo fácil (Z2) + Força leve',
                'quinta': '9 km em ritmo fácil (Z2) + Força leve',
                'domingo': '16 km em ritmo fácil (Z2)',
                'natacao': '35 minutos'
            },
            # Semana 35
            {
                'num': 35,
                'terca': '12 km: aquecimento 2km + 8km em ritmo maratona + 2km desaquecimento',
                'quinta': '10 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '22 km em ritmo maratona',
                'natacao': '40 minutos'
            },
            # Semana 36
            {
                'num': 36,
                'terca': '11 km: aquecimento 2km + 7km em ritmo maratona + 2km desaquecimento',
                'quinta': '10 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '20 km em ritmo maratona',
                'natacao': '40 minutos'
            },
            # Semana 37
            {
                'num': 37,
                'terca': '10 km: aquecimento 2km + 6km em ritmo maratona + 2km desaquecimento',
                'quinta': '9 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '18 km em ritmo maratona',
                'natacao': '35 minutos'
            },
            # Semana 38 (RECUPERAÇÃO)
            {
                'num': 38,
                'recovery': True,
                'terca': '7 km em ritmo fácil (Z2) + Força leve',
                'quinta': '8 km em ritmo fácil (Z2) + Força leve',
                'domingo': '14 km em ritmo fácil (Z2)',
                'natacao': '30 minutos'
            },
            # Semana 39
            {
                'num': 39,
                'terca': '9 km: aquecimento 2km + 5km em ritmo maratona + 2km desaquecimento',
                'quinta': '8 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '16 km em ritmo maratona',
                'natacao': '35 minutos'
            },
            # Semana 40
            {
                'num': 40,
                'terca': '8 km: aquecimento 2km + 4km em ritmo maratona + 2km desaquecimento',
                'quinta': '7 km em ritmo fácil (Z2) + Força pernas',
                'domingo': '14 km em ritmo maratona',
                'natacao': '30 minutos'
            },
        ]
    },
    {
        'name': 'FASE 5: TAPER',
        'weeks': 4,
        'description': '4 semanas de redução gradual (taper)',
        'weeks_detail': [
            # Semana 41
            {
                'num': 41,
                'taper': True,
                'terca': '8 km: aquecimento 2km + 4km em ritmo maratona + 2km desaquecimento',
                'quinta': '6 km em ritmo fácil (Z2)',
                'domingo': '16 km: 10km fácil + 4km em ritmo maratona + 2km fácil',
                'natacao': '30 minutos leve'
            },
            # Semana 42
            {
                'num': 42,
                'taper': True,
                'terca': '7 km: aquecimento 2km + 3km em ritmo maratona + 2km desaquecimento',
                'quinta': '5 km em ritmo fácil (Z2)',
                'domingo': '12 km: 8km fácil + 3km em ritmo maratona + 1km fácil',
                'natacao': '25 minutos leve'
            },
            # Semana 43
            {
                'num': 43,
                'taper': True,
                'terca': '6 km: aquecimento 2km + 2km em ritmo maratona + 2km desaquecimento',
                'quinta': '4 km em ritmo muito fácil',
                'domingo': '8 km em ritmo fácil (Z2)',
                'natacao': '20 minutos técnica'
            },
            # Semana 44 (SEMANA DA PROVA)
            {
                'num': 44,
                'race_week': True,
                'terca': '4 km em ritmo muito fácil',
                'quinta': '3 km em ritmo muito fácil com 3x100m em ritmo maratona',
                'sexta': 'DESCANSO COMPLETO',
                'sabado': 'Caminhada leve 15-20 min + alongamento',
                'domingo': '🏁 MARATONA! 🏁',
                'natacao': 'Segunda (25/08): 15 minutos técnica leve'
            },
        ]
    }
]

# Gerar o plano com datas
output = []
output.append("# Plano de Treinamento para Maratona - Com Datas Específicas")
output.append(f"**Data de Início:** {start_monday.strftime('%d de %B de %Y')} ({get_weekday_name_pt(start_monday)})")
output.append(f"**Data da Maratona:** {marathon_date.strftime('%d de %B de %Y')} ({get_weekday_name_pt(marathon_date)})")
output.append("**Meta de Tempo:** ~4 horas")
output.append("**Duração Total:** 44 semanas")
output.append("")
output.append("---")
output.append("")

current_monday = start_monday
week_counter = 0

for phase in phases:
    # Cabeçalho da fase
    first_week_monday = current_monday
    last_week_of_phase = current_monday + timedelta(weeks=phase['weeks'] - 1)
    last_sunday_of_phase = last_week_of_phase + timedelta(days=6)
    
    output.append(f"## {phase['name']} ({format_date(first_week_monday)}/{first_week_monday.year} - {format_date(last_sunday_of_phase)}/{last_sunday_of_phase.year}) - {phase['weeks']} semanas")
    output.append("")
    
    for week_detail in phase['weeks_detail']:
        week_counter += 1
        week_num = week_detail['num']
        
        # Datas da semana
        sunday = current_monday + timedelta(days=6)
        
        # Cabeçalho da semana
        week_title = f"### Semana {week_num}: {format_date(current_monday)} - {format_date(sunday)}"
        if week_detail.get('recovery'):
            week_title += " (RECUPERAÇÃO)"
        elif week_detail.get('taper'):
            week_title += " (TAPER)"
        elif week_detail.get('race_week'):
            week_title += " (SEMANA DA PROVA)"
        
        output.append(week_title)
        
        # Treinos da semana
        if week_detail.get('race_week'):
            # Semana da prova tem formato especial
            terca_date = current_monday + timedelta(days=1)
            quinta_date = current_monday + timedelta(days=3)
            sexta_date = current_monday + timedelta(days=4)
            sabado_date = current_monday + timedelta(days=5)
            domingo_date = current_monday + timedelta(days=6)
            
            output.append(f"- **{get_weekday_name_pt(terca_date)}, {format_date(terca_date)}**: {week_detail['terca']}")
            output.append(f"- **{get_weekday_name_pt(quinta_date)}, {format_date(quinta_date)}**: {week_detail['quinta']}")
            output.append(f"- **{get_weekday_name_pt(sexta_date)}, {format_date(sexta_date)}**: {week_detail['sexta']}")
            output.append(f"- **{get_weekday_name_pt(sabado_date)}, {format_date(sabado_date)}**: {week_detail['sabado']}")
            output.append(f"- **{get_weekday_name_pt(domingo_date)}, {format_date(domingo_date)}**: {week_detail['domingo']}")
            output.append(f"- **Natação:** {week_detail['natacao']}")
        else:
            # Formato normal
            terca_date = current_monday + timedelta(days=1)
            quinta_date = current_monday + timedelta(days=3)
            domingo_date = current_monday + timedelta(days=6)
            segunda_date = current_monday
            sexta_date = current_monday + timedelta(days=4)
            
            output.append(f"- **{get_weekday_name_pt(terca_date)}, {format_date(terca_date)}**: {week_detail['terca']}")
            output.append(f"- **{get_weekday_name_pt(quinta_date)}, {format_date(quinta_date)}**: {week_detail['quinta']}")
            output.append(f"- **{get_weekday_name_pt(domingo_date)}, {format_date(domingo_date)}**: {week_detail['domingo']}")
            output.append(f"- **Natação:** {get_weekday_name_pt(segunda_date)} ({format_date(segunda_date)}) e {get_weekday_name_pt(sexta_date)} ({format_date(sexta_date)}) - {week_detail['natacao']}")
        
        output.append("")
        
        # Avançar para próxima semana
        current_monday += timedelta(weeks=1)
    
    output.append("---")
    output.append("")

# Salvar arquivo
content = '\n'.join(output)
with open('plano_treinamento_com_datas.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Plano de treinamento com datas corretas criado com sucesso!")
print(f"📅 Total de semanas: {week_counter}")
print(f"📅 Início: {start_monday.strftime('%d/%m/%Y')} ({get_weekday_name_pt(start_monday)})")
print(f"📅 Maratona: {marathon_date.strftime('%d/%m/%Y')} ({get_weekday_name_pt(marathon_date)})")
