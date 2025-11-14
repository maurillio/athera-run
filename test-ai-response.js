// Simular como seria a resposta da IA
const mockResponse = {
  totalWeeks: 12,
  phases: [
    { name: "Base", weeks: 4 },
    { name: "Build", weeks: 4 },
    { name: "Peak", weeks: 2 },
    { name: "Taper", weeks: 2 }
  ],
  paces: {
    easy: "6:00",
    marathon: "5:30",
    tempo: "5:00",
    interval: "4:30",
    repetition: "4:00"
  },
  taperWeeks: 2
};

console.log('📊 Testando validação atual:\n');

// Validação atual
const hasRequiredFields =
  mockResponse.totalWeeks &&
  mockResponse.phases &&
  Array.isArray(mockResponse.phases) &&
  mockResponse.paces &&
  mockResponse.paces.easy &&
  mockResponse.taperWeeks !== undefined;

console.log('Campos obrigatórios:');
console.log('  totalWeeks:', mockResponse.totalWeeks ? '✅' : '❌');
console.log('  phases:', mockResponse.phases ? '✅' : '❌');
console.log('  phases é array:', Array.isArray(mockResponse.phases) ? '✅' : '❌');
console.log('  paces:', mockResponse.paces ? '✅' : '❌');
console.log('  paces.easy:', mockResponse.paces?.easy ? '✅' : '❌');
console.log('  taperWeeks:', mockResponse.taperWeeks !== undefined ? '✅' : '❌');
console.log('\nValidação passa:', hasRequiredFields ? '✅' : '❌');

// Simular resposta da IA que pode estar faltando algo
const possibleResponses = [
  { ...mockResponse, taperWeeks: 0 }, // taperWeeks = 0 é válido
  { ...mockResponse, taperWeeks: null }, // null seria inválido
  { ...mockResponse, paces: { ...mockResponse.paces, easy: undefined } }, // easy undefined
];

console.log('\n📊 Testando cenários possíveis:\n');

possibleResponses.forEach((resp, i) => {
  const valid =
    resp.totalWeeks &&
    resp.phases &&
    Array.isArray(resp.phases) &&
    resp.paces &&
    resp.paces.easy &&
    resp.taperWeeks !== undefined;
    
  console.log(`Cenário ${i + 1}: ${valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  console.log(`  taperWeeks: ${resp.taperWeeks}`);
  console.log(`  paces.easy: ${resp.paces?.easy}`);
  console.log('');
});
