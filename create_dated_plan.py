from datetime import datetime, timedelta

def get_week_dates(week_num, start_date):
    """Retorna as datas de início e fim de uma semana"""
    week_start = start_date + timedelta(weeks=week_num-1)
    week_end = week_start + timedelta(days=6)
    return week_start, week_end

def format_date(date):
    """Formata data em português"""
    meses = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
             'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    return f"{date.day:02d} de {meses[date.month]} de {date.year}"

def format_date_short(date):
    """Formata data curta (dd/mm)"""
    return f"{date.day:02d}/{date.month:02d}"

# Data de início
inicio = datetime(2025, 10, 22)
fim = datetime(2026, 8, 30)

# Estrutura do plano (semanas por fase)
fases = [
    {"nome": "BASE AERÓBICA", "semanas": 9},
    {"nome": "DESENVOLVIMENTO", "semanas": 9},
    {"nome": "INTENSIFICAÇÃO", "semanas": 8},
    {"nome": "PICO", "semanas": 12},
    {"nome": "TAPER/POLIMENTO", "semanas": 7}
]

# Plano de treinos detalhado
plano_detalhado = []

# FASE 1: BASE AERÓBICA (Semanas 1-9)
plano_detalhado.extend([
    # Semana 1
    {"terca": "6 km em ritmo fácil (Z2) + Força parte superior do corpo",
     "quinta": "8 km em ritmo fácil (Z2) + Força core e pernas",
     "domingo": "10 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 30 minutos técnica"},
    # Semana 2
    {"terca": "7 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "8 km em ritmo fácil (Z2) + Força core e pernas",
     "domingo": "12 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 30 minutos"},
    # Semana 3
    {"terca": "7 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "9 km em ritmo fácil (Z2) + Força core e pernas",
     "domingo": "14 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 35 minutos"},
    # Semana 4 (RECUPERAÇÃO)
    {"terca": "5 km em ritmo fácil (Z2) + Força leve",
     "quinta": "6 km em ritmo fácil (Z2) + Força leve",
     "domingo": "10 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 25 minutos técnica",
     "recuperacao": True},
    # Semana 5
    {"terca": "8 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "10 km em ritmo fácil (Z2) + Força core e pernas",
     "domingo": "16 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 35 minutos"},
    # Semana 6
    {"terca": "8 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "10 km com 4x1km em Z3 + Força core e pernas",
     "domingo": "18 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 7
    {"terca": "9 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "11 km com 5x1km em Z3 + Força core e pernas",
     "domingo": "20 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 8
    {"terca": "9 km em ritmo fácil (Z2) + Força parte superior",
     "quinta": "11 km com 6x1km em Z3 + Força core e pernas",
     "domingo": "22 km em ritmo fácil (Z2) + Força parte superior",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 9 (RECUPERAÇÃO)
    {"terca": "6 km em ritmo fácil (Z2) + Força leve",
     "quinta": "7 km em ritmo fácil (Z2) + Força leve",
     "domingo": "12 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 30 minutos técnica",
     "recuperacao": True},
])

# FASE 2: DESENVOLVIMENTO (Semanas 10-18)
plano_detalhado.extend([
    # Semana 10
    {"terca": "10 km: aquecimento 2km + 3x2km em Z3 (rec 2min) + Força",
     "quinta": "12 km em ritmo fácil (Z2) + Força pernas",
     "domingo": "24 km em ritmo fácil (Z2) + Força",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 11
    {"terca": "10 km: aquecimento 2km + 4x2km em Z3 (rec 2min) + Força",
     "quinta": "12 km em ritmo fácil (Z2) + Força pernas",
     "domingo": "26 km em ritmo fácil (Z2) + Força",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 12
    {"terca": "11 km: aquecimento 2km + 5x1.5km em Z3 (rec 90s) + Força",
     "quinta": "13 km em ritmo fácil (Z2) + Força pernas",
     "domingo": "28 km em ritmo fácil (Z2) + Força",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 13 (RECUPERAÇÃO)
    {"terca": "7 km em ritmo fácil (Z2) + Força leve",
     "quinta": "8 km em ritmo fácil (Z2) + Força leve",
     "domingo": "15 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
    # Semana 14
    {"terca": "12 km: aquecimento 2km + 6x1.5km em Z3 (rec 90s) + Força",
     "quinta": "13 km em ritmo fácil (Z2) + Força pernas",
     "domingo": "30 km em ritmo fácil (Z2) + Força",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 15
    {"terca": "12 km: aquecimento 2km + 3x3km em Z3 (rec 2min) + Força",
     "quinta": "14 km com progressão (últimos 5km em Z3) + Força",
     "domingo": "32 km em ritmo fácil (Z2) + Força",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 16
    {"terca": "13 km: aquecimento 2km + 4x3km em Z3 (rec 2min) + Força",
     "quinta": "14 km com progressão (últimos 6km em Z3) + Força",
     "domingo": "34 km em ritmo fácil (Z2-Z3) + Força",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 17
    {"terca": "13 km: aquecimento 2km + 5x2km em Z3-Z4 (rec 90s) + Força",
     "quinta": "15 km com progressão (últimos 7km em Z3) + Força",
     "domingo": "35 km (últimos 15km em ritmo de maratona) + Força",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 18 (RECUPERAÇÃO)
    {"terca": "8 km em ritmo fácil (Z2) + Força leve",
     "quinta": "9 km em ritmo fácil (Z2) + Força leve",
     "domingo": "16 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
])

# FASE 3: INTENSIFICAÇÃO (Semanas 19-26)
plano_detalhado.extend([
    # Semana 19
    {"terca": "14 km: aquecimento 2km + 8km em ritmo de maratona + Força",
     "quinta": "16 km com progressão (últimos 8km em Z3-Z4) + Força",
     "domingo": "32 km (últimos 18km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 20
    {"terca": "15 km: aquecimento 2km + 10km em ritmo de maratona + Força",
     "quinta": "16 km com 8x1km em Z4 (rec 60s) + Força",
     "domingo": "34 km (últimos 20km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 21
    {"terca": "16 km: aquecimento 2km + 12km em ritmo de maratona + Força",
     "quinta": "17 km com 10x800m em Z4 (rec 60s) + Força",
     "domingo": "36 km (últimos 22km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 22 (RECUPERAÇÃO)
    {"terca": "9 km em ritmo fácil (Z2) + Força leve",
     "quinta": "10 km em ritmo fácil (Z2) + Força leve",
     "domingo": "18 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
    # Semana 23
    {"terca": "16 km: aquecimento 2km + 13km em ritmo de maratona + Força",
     "quinta": "17 km com 12x800m em Z4 (rec 45s) + Força",
     "domingo": "37 km (últimos 24km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 24
    {"terca": "17 km: aquecimento 2km + 14km em ritmo de maratona + Força",
     "quinta": "18 km com 6x2km em Z4 (rec 90s) + Força",
     "domingo": "38 km (últimos 26km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 25
    {"terca": "17 km: aquecimento 2km + 15km em ritmo de maratona + Força",
     "quinta": "18 km com 4x3km em Z4 (rec 2min) + Força",
     "domingo": "40 km (últimos 28km em ritmo de maratona - SIMULADO)",
     "natacao": "Segunda e Sexta - 50 minutos"},
    # Semana 26 (RECUPERAÇÃO)
    {"terca": "10 km em ritmo fácil (Z2) + Força leve",
     "quinta": "11 km em ritmo fácil (Z2) + Força leve",
     "domingo": "20 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
])

# FASE 4: PICO (Semanas 27-38)
plano_detalhado.extend([
    # Semana 27
    {"terca": "18 km todo em ritmo de maratona + Força",
     "quinta": "16 km com 5x2km em Z4-Z5 (rec 90s) + Força",
     "domingo": "35 km (últimos 25km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 28
    {"terca": "19 km todo em ritmo de maratona + Força",
     "quinta": "16 km com 6x2km em Z4-Z5 (rec 75s) + Força",
     "domingo": "36 km (últimos 26km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 29
    {"terca": "20 km todo em ritmo de maratona + Força",
     "quinta": "17 km com 8x1.5km em Z4-Z5 (rec 60s) + Força",
     "domingo": "37 km (últimos 27km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 30 (RECUPERAÇÃO)
    {"terca": "11 km em ritmo fácil (Z2) + Força leve",
     "quinta": "12 km em ritmo fácil (Z2) + Força leve",
     "domingo": "22 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
    # Semana 31
    {"terca": "20 km todo em ritmo de maratona + Força",
     "quinta": "17 km com 10x1km em Z5 (rec 60s) + Força",
     "domingo": "38 km (últimos 28km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 32
    {"terca": "21 km todo em ritmo de maratona + Força",
     "quinta": "18 km com 12x1km em Z5 (rec 45s) + Força",
     "domingo": "39 km (últimos 29km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 33
    {"terca": "21 km todo em ritmo de maratona + Força",
     "quinta": "18 km com 6x2km em Z5 (rec 90s) + Força",
     "domingo": "40 km (últimos 30km em ritmo de maratona - SIMULADO)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 34 (RECUPERAÇÃO)
    {"terca": "12 km em ritmo fácil (Z2) + Força leve",
     "quinta": "13 km em ritmo fácil (Z2) + Força leve",
     "domingo": "23 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
    # Semana 35
    {"terca": "22 km todo em ritmo de maratona - 10s/km + Força",
     "quinta": "17 km com 8x1.5km em Z5 (rec 60s) + Força",
     "domingo": "36 km (últimos 28km em ritmo maratona - 5s/km)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 36
    {"terca": "22 km todo em ritmo de maratona - 10s/km + Força",
     "quinta": "18 km com 10x1km em Z5 (rec 45s) + Força",
     "domingo": "37 km (últimos 29km em ritmo maratona - 5s/km)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 37
    {"terca": "23 km todo em ritmo de maratona - 10s/km + Força",
     "quinta": "18 km com 6x2.5km em Z5 (rec 90s) + Força",
     "domingo": "38 km (últimos 30km em ritmo maratona - 5s/km)",
     "natacao": "Segunda e Sexta - 45 minutos"},
    # Semana 38 (RECUPERAÇÃO)
    {"terca": "13 km em ritmo fácil (Z2) + Força leve",
     "quinta": "14 km em ritmo fácil (Z2) + Força leve",
     "domingo": "24 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 35 minutos",
     "recuperacao": True},
])

# FASE 5: TAPER/POLIMENTO (Semanas 39-45)
plano_detalhado.extend([
    # Semana 39
    {"terca": "16 km todo em ritmo de maratona - 10s/km + Força moderada",
     "quinta": "14 km com 6x1km em Z4 (rec 60s) + Força moderada",
     "domingo": "32 km (últimos 20km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 40
    {"terca": "14 km em ritmo de maratona + Força moderada",
     "quinta": "12 km com 5x1km em Z4 (rec 90s) + Força moderada",
     "domingo": "28 km (últimos 16km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 40 minutos"},
    # Semana 41
    {"terca": "12 km em ritmo de maratona + Força leve",
     "quinta": "10 km com 4x1km em Z4 (rec 90s) + Força leve",
     "domingo": "24 km (últimos 12km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 35 minutos"},
    # Semana 42
    {"terca": "10 km em ritmo de maratona + Força leve",
     "quinta": "8 km com 3x1km em Z3-Z4 (rec 2min) + Força leve",
     "domingo": "20 km (últimos 10km em ritmo de maratona)",
     "natacao": "Segunda e Sexta - 30 minutos"},
    # Semana 43
    {"terca": "8 km em ritmo de maratona + Força muito leve",
     "quinta": "7 km com 2x1km em Z3 (rec 2min) + Alongamento",
     "domingo": "16 km em ritmo fácil (Z2)",
     "natacao": "Segunda e Sexta - 30 minutos relaxado"},
    # Semana 44
    {"terca": "6 km em ritmo fácil (Z2) + Mobilidade",
     "quinta": "5 km em ritmo fácil (Z2) + Alongamento",
     "domingo": "12 km em ritmo fácil (Z2) - último longão",
     "natacao": "Segunda e Sexta - 25 minutos técnica"},
    # Semana 45 (SEMANA DA CORRIDA)
    {"terca": "5 km em ritmo muito fácil + Mobilidade",
     "quarta": "4 km em ritmo muito fácil + Alongamento suave",
     "quinta": "DESCANSO TOTAL - Apenas alongamento leve",
     "sexta": "3 km caminhada leve + Alongamento",
     "sabado": "DESCANSO TOTAL - Hidratação e preparação mental",
     "domingo": "🏃‍♂️ DIA DA MARATONA! 🎉",
     "corrida": True},
])

# Gerar markdown
output = []
output.append("# Plano de Treinamento para Maratona - Com Datas Específicas\n")
output.append(f"**Data de Início:** {format_date(inicio)}\n")
output.append(f"**Data da Maratona:** {format_date(fim)}\n")
output.append(f"**Meta de Tempo:** ~4 horas\n")
output.append(f"**Duração Total:** 44 semanas\n\n")
output.append("---\n\n")

semana_atual = 1
idx = 0

for fase in fases:
    # Cabeçalho da fase
    fase_inicio, _ = get_week_dates(semana_atual, inicio)
    fase_fim_semana = semana_atual + fase["semanas"] - 1
    _, fase_fim = get_week_dates(fase_fim_semana, inicio)
    
    output.append(f"## FASE {fases.index(fase)+1}: {fase['nome']} ")
    output.append(f"({format_date_short(fase_inicio)}/{fase_inicio.year} - ")
    output.append(f"{format_date_short(fase_fim)}/{fase_fim.year}) - {fase['semanas']} semanas\n\n")
    
    # Semanas da fase
    for s in range(fase["semanas"]):
        w_start, w_end = get_week_dates(semana_atual, inicio)
        treino = plano_detalhado[idx]
        
        recuperacao = treino.get("recuperacao", False)
        corrida = treino.get("corrida", False)
        
        titulo = f"### Semana {semana_atual}: {format_date_short(w_start)} - {format_date_short(w_end)}"
        if recuperacao:
            titulo += " (RECUPERAÇÃO)"
        elif corrida:
            titulo += " (SEMANA DA CORRIDA)"
        output.append(titulo + "\n")
        
        # Treinos da semana
        if corrida:
            # Semana da corrida tem formato especial
            dias = ["terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
            dias_nomes = ["Terça", "Quarta", "Quinta", "Sexta", "Sábado", "DOMINGO"]
            datas = [w_start + timedelta(days=1), w_start + timedelta(days=2), 
                    w_start + timedelta(days=3), w_start + timedelta(days=4),
                    w_start + timedelta(days=5), w_start + timedelta(days=6)]
            
            for dia, dia_nome, data in zip(dias, dias_nomes, datas):
                if dia in treino:
                    output.append(f"- **{dia_nome}, {format_date_short(data)}**: {treino[dia]}\n")
        else:
            # Terça
            terca = w_start + timedelta(days=1)
            output.append(f"- **Terça, {format_date_short(terca)}**: {treino['terca']}\n")
            
            # Quinta
            quinta = w_start + timedelta(days=3)
            output.append(f"- **Quinta, {format_date_short(quinta)}**: {treino['quinta']}\n")
            
            # Domingo
            domingo = w_start + timedelta(days=6)
            output.append(f"- **Domingo, {format_date_short(domingo)}**: {treino['domingo']}\n")
            
            # Natação
            segunda = w_start
            sexta = w_start + timedelta(days=4)
            output.append(f"- **Natação:** Segunda ({format_date_short(segunda)}) ")
            output.append(f"e Sexta ({format_date_short(sexta)}) - {treino['natacao'].split(' - ')[1]}\n")
        
        output.append("\n")
        
        semana_atual += 1
        idx += 1
    
    output.append("---\n\n")

# Adicionar legendas e observações
output.append("## LEGENDAS E OBSERVAÇÕES\n\n")

output.append("### Zonas de Frequência Cardíaca:\n")
output.append("- **Z2 (Aeróbico Leve):** 60-70% FCMax - conversa confortável\n")
output.append("- **Z3 (Aeróbico Moderado):** 70-80% FCMax - conversa com esforço\n")
output.append("- **Z4 (Limiar):** 80-90% FCMax - frases curtas apenas\n")
output.append("- **Z5 (VO2Max):** 90-100% FCMax - sem conversa\n\n")

output.append("### Ritmo de Maratona Estimado:\n")
output.append("- Meta de 4 horas = ~5:41 min/km\n")
output.append("- Treinos em ritmo de maratona devem ser entre 5:35-5:50 min/km\n\n")

output.append("### Força:\n")
output.append("- **Parte Superior:** Supino, remada, desenvolvimento, pull-ups\n")
output.append("- **Pernas:** Agachamento, leg press, afundo, stiff\n")
output.append("- **Core:** Prancha, russian twist, dead bug, bird dog\n\n")

output.append("### Observações Importantes:\n")
output.append("1. **Hidratação:** Beba água durante corridas longas (>15km)\n")
output.append("2. **Nutrição:** Teste géis/carboidratos nos longões a partir da semana 10\n")
output.append("3. **Descanso:** Respeite os dias de recuperação\n")
output.append("4. **Escuta Corporal:** Se sentir dor, reduza intensidade\n")
output.append("5. **Natação:** Foco em técnica e recuperação ativa\n")
output.append("6. **Força:** Reduz progressivamente nas últimas 7 semanas\n\n")

output.append("### Equipamento:\n")
output.append("- Use tênis adequado (trocar a cada 600-800km)\n")
output.append("- Teste roupas e equipamentos nos treinos longos\n")
output.append("- Nada de novidades no dia da prova!\n\n")

output.append("**BOA SORTE NO SEU TREINAMENTO! 🏃‍♂️💪**\n")

# Escrever arquivo
with open("/home/ubuntu/app_maratona/plano_treinamento_com_datas.md", "w", encoding="utf-8") as f:
    f.write("".join(output))

print("✅ Plano de treinamento com datas criado com sucesso!")
print(f"📄 Arquivo: /home/ubuntu/app_maratona/plano_treinamento_com_datas.md")
