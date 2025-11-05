
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Dados das 5 fases macro do plano
const phases = [
  {
    phaseNumber: 1,
    name: "Transição e Base Aeróbica",
    description: "Construir uma fundação aeróbica sólida e fortalecer o corpo contra lesões. Foco em volume baixo com intensidade principalmente fácil.",
    duration: "10 semanas",
    objectives: "Construir base aeróbica, fortalecer sistema musculoesquelético, prevenir lesões, estabelecer consistência",
    focus: "Corridas fáceis, estabilidade muscular, recuperação ativa"
  },
  {
    phaseNumber: 2,
    name: "Preparação Geral e Força",
    description: "Introdução gradual de estímulos de maior intensidade. Melhorar força das pernas e eficiência da corrida.",
    duration: "10 semanas", 
    objectives: "Melhorar força das pernas, eficiência de corrida, elevar limiar de lactato",
    focus: "Strides, hill repeats, desenvolvimento de força, manutenção da base aeróbica"
  },
  {
    phaseNumber: 3,
    name: "Preparação Específica e Construção", 
    description: "Fase crítica com treinamento específico para maratona. Adaptar corpo e mente ao ritmo alvo por períodos prolongados.",
    duration: "10 semanas",
    objectives: "Treinos específicos de maratona, pico de volume, adaptação ao M-Pace",
    focus: "Longões com trechos em ritmo de maratona, treinos de limiar, volume máximo"
  },
  {
    phaseNumber: 4,
    name: "Pico e Simulação de Prova",
    description: "Semanas de maior volume e treinos longos mais desafiadores. Simular demandas fisiológicas e psicológicas da maratona.",
    duration: "6 semanas", 
    objectives: "Simular condições de prova, longões máximos, afinação de estratégia",
    focus: "Treinos longos de até 34km, blocos extensos em M-Pace, preparação mental"
  },
  {
    phaseNumber: 5,
    name: "Polimento e Competição",
    description: "Reduzir fadiga acumulada, permitir recuperação e supercompensação. Chegar à linha de largada descansado e forte.",
    duration: "4 semanas",
    objectives: "Reduzir fadiga, manter afiação, maximizar recuperação, carb loading",
    focus: "Volume reduzido, intensidade mantida, recuperação, preparação final"
  }
];

// Dados das semanas por fase (simplificado - expandir com detalhes completos)
const weeksData = [
  // Fase 1: Semanas 1-10
  ...Array.from({length: 10}, (_, i) => ({
    weekNumber: i + 1,
    phaseNumber: 1,
    title: `Semana ${i + 1}: Base Aeróbica`,
    volume: 25 + (i * 1.5), // Progressão gradual de 25km a ~40km
    description: "Foco em corridas fáceis e construção de base aeróbica"
  })),
  
  // Fase 2: Semanas 11-20  
  ...Array.from({length: 10}, (_, i) => ({
    weekNumber: i + 11,
    phaseNumber: 2, 
    title: `Semana ${i + 11}: Construção e Força`,
    volume: 40 + (i * 1.5), // Progressão de 40km a ~55km
    description: "Introdução de strides e treinos de subida"
  })),
  
  // Fase 3: Semanas 21-30
  ...Array.from({length: 10}, (_, i) => ({
    weekNumber: i + 21,
    phaseNumber: 3,
    title: `Semana ${i + 21}: Preparação Específica`,
    volume: 55 + (i * 1.0), // Pico de volume ~65km
    description: "Treinos específicos com trechos em ritmo de maratona"
  })),
  
  // Fase 4: Semanas 31-36
  ...Array.from({length: 6}, (_, i) => ({
    weekNumber: i + 31,
    phaseNumber: 4,
    title: `Semana ${i + 31}: Pico e Simulação`,
    volume: 60 + (i * 0.8), // Mantém volume alto
    description: "Treinos longos máximos e simulação de prova"
  })),
  
  // Fase 5: Semanas 37-40
  ...Array.from({length: 4}, (_, i) => ({
    weekNumber: i + 37,
    phaseNumber: 5,
    title: `Semana ${i + 37}: ${i === 3 ? 'Semana da Prova' : 'Polimento'}`,
    volume: 40 - (i * 8), // Redução progressiva
    description: i === 3 ? "Semana da maratona - descanso e preparação final" : "Redução de volume mantendo intensidade"
  }))
];

// Tabela VDOT (VDOT 37-38 para o corredor alvo)
const vdotData = [
  {
    vdot: 37.0,
    easy_pace_min: "6:15", easy_pace_max: "6:45",
    marathon_pace_min: "5:41", marathon_pace_max: "5:51", 
    threshold_pace_min: "5:15", threshold_pace_max: "5:25",
    interval_pace_min: "4:50", interval_pace_max: "5:00",
    repetition_pace_min: "4:30", repetition_pace_max: "4:40"
  },
  {
    vdot: 38.0,
    easy_pace_min: "6:10", easy_pace_max: "6:40",
    marathon_pace_min: "5:36", marathon_pace_max: "5:46",
    threshold_pace_min: "5:10", threshold_pace_max: "5:20", 
    interval_pace_min: "4:45", interval_pace_max: "4:55",
    repetition_pace_min: "4:25", repetition_pace_max: "4:35"
  }
];

// Nutrição por fase
const phaseNutritionData = [
  {
    phaseNumber: 1,
    carbohydrates: "5-7 g/kg/dia",
    protein: "1.6-1.8 g/kg/dia",
    fats: "20-30% do VET",
    calories: "Déficit modesto (300-500 kcal/dia) se objetivo for perda de peso",
    hydration: "2-3L/dia, urina clara",
    supplements: "Opcional: Whey protein pós-treino",
    timing: "Refeição pós-treino em 30-60min",
    special_notes: "Fase ideal para gestão segura da composição corporal"
  },
  {
    phaseNumber: 2,
    carbohydrates: "6-8 g/kg/dia",
    protein: "1.6-1.8 g/kg/dia", 
    fats: "20-30% do VET",
    calories: "Transitar para manutenção conforme aumento do gasto energético",
    hydration: "2-3L/dia, aumentar nos dias de treino mais longos",
    supplements: "Whey protein, eletrólitos em treinos longos",
    timing: "CHO aumentados nos dias de treinos intensos",
    special_notes: "Suportar aumento de intensidade e volume"
  },
  {
    phaseNumber: 3,
    carbohydrates: "7-10 g/kg/dia",
    protein: "1.6-2.0 g/kg/dia",
    fats: "20-25% do VET",
    calories: "Aporte energético máximo",
    hydration: "3-4L/dia, protocolo de hidratação em treinos longos",
    supplements: "Géis energéticos, bebidas esportivas, eletrólitos",
    timing: "Praticar estratégia de nutrição durante os longões",
    special_notes: "Treinar o intestino para absorver CHO durante exercício"
  },
  {
    phaseNumber: 4,
    carbohydrates: "8-10 g/kg/dia",
    protein: "1.6-2.0 g/kg/dia",
    fats: "15-20% do VET", 
    calories: "Máximo aporte para suportar pico de treinamento",
    hydration: "Protocolo individualizado baseado na taxa de suor",
    supplements: "Cafeína (3-6mg/kg), géis, eletrólitos",
    timing: "Finalizar estratégia de nutrição para o dia da prova",
    special_notes: "Estoques de glicogênio sempre repletos"
  },
  {
    phaseNumber: 5,
    carbohydrates: "8-12 g/kg/dia (carb loading nos últimos 3 dias)",
    protein: "1.4-1.6 g/kg/dia",
    fats: "10-15% do VET (reduzir para facilitar digestão)",
    calories: "Ligeiramente reduzido devido à menor atividade",
    hydration: "Manter alta, adicionar eletrólitos", 
    supplements: "Evitar novos suplementos, manter só os testados",
    timing: "Carb loading: 2-4 dias antes da prova",
    special_notes: "Ganho de 1-2kg é normal durante carb loading"
  }
];

// Exercícios de prevenção de lesões
const injuryPreventionData = [
  {
    category: "canelite",
    name: "Elevação dos Dedos (Toe Raises)",
    description: "Fortalecimento do tibial anterior",
    duration: "15-20 repetições",
    frequency: "Diária",
    instructions: "Mantenha calcanhares no chão, levante dedos e frente do pé em direção à canela",
    benefits: "Fortalece tibial anterior, ajuda controlar descida do pé na passada"
  },
  {
    category: "canelite", 
    name: "Elevação de Panturrilha",
    description: "Fortalecimento dos músculos gastrocnêmio e sóleo",
    duration: "2-3 séries de 15 repetições",
    frequency: "2-3x/semana",
    instructions: "Fique em pé, eleve calcanhares subindo na ponta dos pés, desça lentamente",
    benefits: "Fortalece panturrilha, essencial para absorção de impacto"
  },
  {
    category: "fascite_plantar",
    name: "Automassagem com Bola",
    description: "Liberação da tensão na fáscia plantar",
    duration: "1-2 minutos por pé",
    frequency: "Diária",
    instructions: "Role bola de tênis sob arco do pé, pressão moderada",
    benefits: "Libera tensão na fáscia plantar, reduz rigidez matinal"
  },
  {
    category: "fascite_plantar",
    name: "Alongamento da Panturrilha na Parede",
    description: "Alongamento dos músculos gastrocnêmio e sóleo",
    duration: "30 segundos, 2-3x cada lado",
    frequency: "Diária",
    instructions: "Mãos na parede, passo atrás com perna esticada, calcanhar no chão",
    benefits: "Reduz tensão que contribui para fascite plantar"
  },
  {
    category: "core",
    name: "Prancha Frontal",
    description: "Fortalecimento do core e estabilidade",
    duration: "30-60 segundos",
    frequency: "2-3x/semana",
    instructions: "Posição de flexão apoiado nos antebraços, corpo em linha reta",
    benefits: "Fortalece core, melhora estabilidade durante corrida"
  },
  {
    category: "mobilidade",
    name: "Círculos com Tornozelo", 
    description: "Mobilidade articular do tornozelo",
    duration: "15-20 círculos cada direção",
    frequency: "Diária",
    instructions: "Círculos lentos e controlados com ambos os tornozelos",
    benefits: "Mantém mobilidade articular, prevenção de rigidez"
  }
];

// Glossário de termos
const glossaryData = [
  {
    term: "E-Pace (Easy Pace)",
    definition: "Ritmo fácil e conversacional, representa 65-79% da FCMax. Usado na maior parte do treinamento.",
    category: "treino",
    examples: "6:15-6:45/km para VDOT 37-38"
  },
  {
    term: "M-Pace (Marathon Pace)",
    definition: "Ritmo alvo para a maratona, sustentável por 42.2km. Representa 80-85% da FCMax.",
    category: "treino", 
    examples: "5:41/km para meta de 4 horas"
  },
  {
    term: "T-Pace (Threshold Pace)",
    definition: "Ritmo de limiar anaeróbico, esforço 'confortavelmente difícil' por 20-60min.",
    category: "treino",
    examples: "5:15-5:25/km para VDOT 37-38"
  },
  {
    term: "VDOT",
    definition: "Medida da capacidade aeróbica máxima que considera economia de corrida. Base para cálculo de paces.",
    category: "fisiologia",
    examples: "VDOT 37-38 para 10km em 5:40-5:50/km"
  },
  {
    term: "Carb Loading",
    definition: "Estratégia nutricional para maximizar estoques de glicogênio muscular antes da prova.",
    category: "nutricao",
    examples: "8-12 g CHO/kg/dia nos 2-3 dias antes da maratona"
  },
  {
    term: "Longão",
    definition: "Treino longo semanal, base da preparação para maratona. Desenvolve resistência aeróbica.",
    category: "treino",
    examples: "Progressão de 12km até 32-34km ao longo do ciclo"
  },
  {
    term: "Strides",
    definition: "Acelerações curtas e controladas (80-100m) para melhorar forma e ativação neuromuscular.",
    category: "treino",
    examples: "4-6x100m após corrida fácil, recuperação caminhando"
  },
  {
    term: "Taper",
    definition: "Período de polimento com redução de volume mantendo intensidade para recuperação pré-prova.",
    category: "treino",
    examples: "3-4 semanas finais com volume 40-60% menor"
  }
];

// Sinais de overtraining
const overtrainingSignsData = [
  {
    category: "physical",
    sign: "Fadiga persistente",
    description: "Cansaço que não melhora com descanso adequado",
    severity: "moderate",
    action: "Reduzir volume de treino, priorizar sono e recuperação"
  },
  {
    category: "physical", 
    sign: "Dores musculares prolongadas",
    description: "Dor muscular que persiste por mais de 72 horas",
    severity: "moderate",
    action: "Incluir mais dias de recuperação ativa, considerar massagem"
  },
  {
    category: "performance",
    sign: "Queda no desempenho",
    description: "Treinos ficam mais difíceis com mesmo esforço, paces mais lentos",
    severity: "severe",
    action: "Período de recuperação de 5-7 dias, reavaliar plano de treino"
  },
  {
    category: "physical",
    sign: "Aumento da FCR",
    description: "Frequência cardíaca de repouso 5-10 bpm acima do normal",
    severity: "moderate", 
    action: "Monitorar por 2-3 dias, reduzir intensidade se persistir"
  },
  {
    category: "psychological",
    sign: "Perda de motivação",
    description: "Falta de entusiasmo para treinar, treinos parecem obrigação",
    severity: "mild",
    action: "Incluir atividades prazerosas, variar locais e tipos de treino"
  },
  {
    category: "physical",
    sign: "Distúrbios do sono",
    description: "Dificuldade para adormecer ou sono fragmentado",
    severity: "moderate",
    action: "Reduzir treinos vespertinos, melhorar higiene do sono"
  },
  {
    category: "physical",
    sign: "Resfriados frequentes",
    description: "Maior suscetibilidade a infecções respiratórias",
    severity: "moderate", 
    action: "Priorizar recuperação, avaliar nutrição e suplementação"
  },
  {
    category: "psychological",
    sign: "Irritabilidade aumentada",
    description: "Mudanças de humor, impaciência além do normal",
    severity: "mild",
    action: "Incluir técnicas de relaxamento, reduzir estressores externos"
  }
];

async function main() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes
    await prisma.aIAnalysis.deleteMany();
    await prisma.completedWorkout.deleteMany();
    await prisma.athleteProfile.deleteMany();
    await prisma.overtrainingSign.deleteMany();
    await prisma.glossary.deleteMany();
    await prisma.injuryPrevention.deleteMany();
    await prisma.phaseNutrition.deleteMany();
    await prisma.vdotTable.deleteMany();
    await prisma.workout.deleteMany();
    await prisma.week.deleteMany();
    await prisma.phase.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Dados existentes limpos');

    // 0. Criar usuário de teste
    console.log('👤 Criando usuário de teste...');
    const hashedPassword = await bcrypt.hash('johndoe123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        password: hashedPassword,
        name: 'John Doe',
        isPremium: true,
      }
    });
    console.log('✅ Usuário de teste criado: john@doe.com / johndoe123');

    // 1. Criar fases
    console.log('📅 Criando fases...');
    const createdPhases = await Promise.all(
      phases.map(phase => prisma.phase.create({ data: phase }))
    );
    console.log(`✅ ${createdPhases.length} fases criadas`);

    // 2. Criar semanas
    console.log('📊 Criando semanas...');
    const createdWeeks = await Promise.all(
      weeksData.map(week => {
        const phase = createdPhases.find(p => p.phaseNumber === week.phaseNumber);
        return prisma.week.create({
          data: {
            weekNumber: week.weekNumber,
            title: week.title,
            volume: week.volume,
            description: week.description,
            phaseId: phase!.id
          }
        });
      })
    );
    console.log(`✅ ${createdWeeks.length} semanas criadas`);

    // 3. Criar tabela VDOT
    console.log('🏃 Criando tabela VDOT...');
    await Promise.all(
      vdotData.map(vdot => prisma.vdotTable.create({ data: vdot }))
    );
    console.log(`✅ Tabela VDOT criada`);

    // 4. Criar nutrição por fase
    console.log('🍎 Criando dados de nutrição...');
    await Promise.all(
      phaseNutritionData.map(nutrition => {
        const phase = createdPhases.find(p => p.phaseNumber === nutrition.phaseNumber);
        const { phaseNumber, ...nutritionData } = nutrition;
        return prisma.phaseNutrition.create({
          data: {
            ...nutritionData,
            phaseId: phase!.id
          }
        });
      })
    );
    console.log(`✅ Nutrição por fase criada`);

    // 5. Criar exercícios de prevenção
    console.log('💪 Criando exercícios de prevenção...');
    await Promise.all(
      injuryPreventionData.map(exercise => prisma.injuryPrevention.create({ data: exercise }))
    );
    console.log(`✅ ${injuryPreventionData.length} exercícios criados`);

    // 6. Criar glossário
    console.log('📚 Criando glossário...');
    await Promise.all(
      glossaryData.map(term => prisma.glossary.create({ data: term }))
    );
    console.log(`✅ ${glossaryData.length} termos no glossário`);

    // 7. Criar sinais de overtraining
    console.log('⚠️ Criando sinais de overtraining...');
    await Promise.all(
      overtrainingSignsData.map(sign => prisma.overtrainingSign.create({ data: sign }))
    );
    console.log(`✅ ${overtrainingSignsData.length} sinais de overtraining criados`);

    console.log('🎉 Seed concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
