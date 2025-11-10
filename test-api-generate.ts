// Script para testar API de geração de plano
// Analisa o que pode estar causando erro 500

console.log('=== Análise de Erro 500 na Geração de Plano ===\n');

console.log('📋 CHECKLIST DE VALIDAÇÃO:');
console.log('');

console.log('1️⃣ Validação da estrutura trainingSchedule:');
console.log('   ✅ O sistema aceita: { 0: { running: true, activities: ["Musculação"] } }');
console.log('   ✅ O sistema aceita: { 1: { running: true, activities: [] } }');
console.log('   ✅ O sistema aceita: { 0: { running: false, activities: ["Yoga"] } }');
console.log('');

console.log('2️⃣ Validação dos campos obrigatórios:');
console.log('   ✅ goalDistance: deve estar preenchido');
console.log('   ✅ targetRaceDate: deve estar preenchido');
console.log('   ✅ runningLevel: deve estar preenchido');
console.log('   ✅ trainingSchedule OU trainingActivities: pelo menos um');
console.log('');

console.log('3️⃣ Possíveis causas de erro 500:');
console.log('   ⚠️  Erro na API da IA (OpenRouter timeout ou rate limit)');
console.log('   ⚠️  trainingSchedule vazio ou mal formatado');
console.log('   ⚠️  RaceGoal não foi criado corretamente');
console.log('   ⚠️  Erro no generateAIPlan (lib/ai-plan-generator.ts)');
console.log('');

console.log('4️⃣ Fluxo de geração do plano após onboarding:');
console.log('   1. Usuário completa Step 6 do onboarding');
console.log('   2. POST /api/profile/create - salva trainingSchedule');
console.log('   3. POST /api/race-goals - cria corrida alvo (priority: A, status: upcoming)');
console.log('   4. Frontend chama POST /api/plan/generate automaticamente');
console.log('   5. API valida dados do perfil');
console.log('   6. API busca race goals com status: active OU upcoming');
console.log('   7. API chama generateAIPlan');
console.log('   8. IA gera plano considerando race goals');
console.log('');

console.log('5️⃣ O QUE VERIFICAR NO ERRO:');
console.log('   🔍 Ver console.log da API: [AI PLAN] logs');
console.log('   🔍 Verificar se RaceGoal foi criado');
console.log('   🔍 Verificar se trainingSchedule está no formato correto');
console.log('   🔍 Verificar logs da OpenRouter API');
console.log('');

console.log('6️⃣ DEBUGGING RECOMENDADO:');
console.log('   • Acessar Vercel Dashboard > Functions > api/plan/generate');
console.log('   • Ver logs em tempo real durante criação de usuário');
console.log('   • Verificar se há erro específico no stack trace');
console.log('');

console.log('7️⃣ CORREÇÕES APLICADAS NA v2.0.0:');
console.log('   ✅ Sistema de detalhes avançados do treino');
console.log('   ✅ Warmup, main set, cooldown estruturados');
console.log('   ✅ Paces dinâmicos baseados em VDOT');
console.log('   ✅ Periodização com fases (Base, Build, Peak, Taper, Race)');
console.log('   ✅ Corridas alvo consideradas na estratégia');
console.log('   ⚠️  Possível: Prompt muito grande causando timeout?');
console.log('');

console.log('8️⃣ PRÓXIMOS PASSOS:');
console.log('   1. Criar novo usuário de teste');
console.log('   2. Monitorar logs do Vercel em tempo real');
console.log('   3. Se der erro, copiar stack trace completo');
console.log('   4. Verificar se erro é na IA ou no código');
console.log('');

console.log('💡 DICA: Se o erro persistir, pode ser:');
console.log('   • Timeout da IA (prompt muito grande)');
console.log('   • Mudança no formato de resposta da IA');
console.log('   • Campo faltando na estrutura de dados');
console.log('');

console.log('✅ Para testar, criar usuário: teste' + Math.floor(Math.random() * 1000000) + '@teste.com');
console.log('');
