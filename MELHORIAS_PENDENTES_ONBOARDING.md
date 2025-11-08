# Melhorias Pendentes - Onboarding 08/11/2025

## 📋 **Funcionalidades Solicitadas Ainda Não Implementadas**

### 1. ⚠️ **Geração Automática do Plano Após Onboarding**

#### 🎯 Requisito
Ao clicar em "Finalizar e Criar Plano" no Step 7, o sistema deve:
1. Salvar o perfil
2. **Iniciar automaticamente a geração do plano de treino**
3. Mostrar loading com mensagens divertidas relacionadas à corrida
4. Redirecionar para Dashboard quando pronto

#### 📊 Status Atual
- ✅ Step 7 salva o perfil corretamente
- ❌ Usuário precisa ir manualmente à Dashboard e clicar em "Gerar Plano"
- ❌ Não há loading com mensagens divertidas

#### 🔧 Implementação Necessária

**Arquivo**: `components/onboarding/v1.3.0/Step7Review.tsx`

```tsx
// Adicionar estado para loading messages
const [loadingStep, setLoadingStep] = useState<string>('');
const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

const loadingMessages = [
  "🥽 Colocando os óculos baixo pace...",
  "⚡ Tomando o gel de carboidrato...",
  "👟 Colocando o tênis de placa de carbono...",
  "💧 Hidratando adequadamente...",
  "🏃‍♂️ Aquecendo os músculos...",
  "📊 Analisando seus dados...",
  "🤖 IA calculando o plano perfeito...",
  "🎯 Ajustando intensidades...",
  "📅 Organizando seu calendário...",
  "✨ Finalizando os detalhes..."
];

const handleFinishOnboarding = async () => {
  setIsLoading(true);
  setIsGeneratingPlan(true);
  
  // Mostrar mensagens de loading progressivas
  let messageIndex = 0;
  const loadingInterval = setInterval(() => {
    if (messageIndex < loadingMessages.length) {
      setLoadingStep(loadingMessages[messageIndex]);
      messageIndex++;
    }
  }, 2000); // A cada 2 segundos

  try {
    // 1. Criar perfil
    const profileResponse = await fetch('/api/profile/create', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
    
    if (!profileResponse.ok) {
      throw new Error('Erro ao criar perfil');
    }

    // 2. Gerar plano automaticamente
    const planResponse = await fetch('/api/training-plan/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!planResponse.ok) {
      throw new Error('Erro ao gerar plano');
    }

    // 3. Aguardar conclusão
    await planResponse.json();
    
    clearInterval(loadingInterval);
    setLoadingStep('✅ Plano criado com sucesso!');
    
    // 4. Redirecionar após 1 segundo
    setTimeout(() => {
      router.push(`/${locale}/dashboard`);
    }, 1000);

  } catch (error) {
    clearInterval(loadingInterval);
    setIsGeneratingPlan(false);
    setIsLoading(false);
    console.error('Erro:', error);
    // Mostrar erro ao usuário
  }
};
```

**Componente de Loading**:

```tsx
{isGeneratingPlan && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-xl font-bold mb-2">Criando seu plano personalizado</h3>
        <p className="text-gray-600 mb-4 min-h-[24px]">
          {loadingStep}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(loadingMessages.indexOf(loadingStep) + 1) / loadingMessages.length * 100}%` }}
          />
        </div>
      </div>
    </div>
  </div>
)}
```

---

### 2. ⚠️ **Step 1 - Remover Dados Fisiológicos**

#### 🎯 Requisito
Dados fisiológicos (FC repouso, qualidade sono, stress) devem aparecer **APENAS no Step 4**, não no Step 1.

#### 📊 Status Atual
- ❌ Campos fisiológicos aparecem no Step 1
- ✅ Campos fisiológicos JÁ estão no Step 4

#### 🔧 Arquivos a Modificar
- `components/onboarding/v1.3.0/Step1PersonalInfo.tsx`
- Remover campos: `restingHeartRate`, `sleepQuality`, `stressLevel`

---

### 3. ⚠️ **Step 1 - Duplicação de Botão "Próximo"**

#### 🎯 Requisito
Remover botão duplicado de "Próximo" no Step 1.

#### 📊 Status Atual
- ❌ Dois botões "Próximo" aparecendo
- Possível causa: código duplicado no JSX

#### 🔧 Investigação Necessária
Verificar `components/onboarding/v1.3.0/Step1PersonalInfo.tsx` para botões duplicados.

---

### 4. ✅ **Step 2 - Seleção de Esportes** (IMPLEMENTADO)

#### 🎯 Requisito
- Poder clicar para selecionar esportes tradicionais
- Opção de digitar se não estiver na lista
- Lista sugerida: Musculação, Pilates, Luta, Bicicleta, Natação

#### 📊 Status
✅ **JÁ IMPLEMENTADO** no commit anterior

---

### 5. ✅ **Step 2 - Remover "Anos Praticando"** (IMPLEMENTADO)

#### 🎯 Requisito
Remover campo "anos praticando o esporte" pois agora há múltiplos esportes.

#### 📊 Status
✅ **JÁ IMPLEMENTADO**

---

### 6. ⚠️ **Step 3 - Melhorar Explicação de Performance**

#### 🎯 Requisito
Dar mais ênfase de que é sobre os **melhores tempos já feitos** e como isso será usado pela IA.

#### 🔧 Sugestão de Texto

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <h4 className="font-semibold text-blue-900 mb-2">
    💡 Por que registrar seus melhores tempos?
  </h4>
  <p className="text-sm text-blue-800">
    Seus recordes pessoais ajudam nossa IA a:
  </p>
  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
    <li>Calcular seu <strong>VDOT</strong> (capacidade aeróbica)</li>
    <li>Determinar seus <strong>ritmos de treino ideais</strong></li>
    <li>Criar um plano <strong>personalizado</strong> e realista</li>
    <li>Definir metas <strong>alcançáveis</strong> baseadas no seu potencial</li>
  </ul>
</div>
```

---

### 7. ✅ **Step 3 - Input de Tempo Melhorado** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** - Input com horas, minutos, segundos separados

---

### 8. ⚠️ **Step 3 - Melhores Tempos não Salvam no Perfil**

#### 🎯 Requisito
Melhores tempos devem:
- Ser salvos no perfil
- Aparecer na tela de perfil
- Permitir edição e exclusão

#### 📊 Status Atual
- ✅ Dados salvos no banco (`bestTimes` Json)
- ❌ Não aparecem na interface do perfil
- ❌ Não há opção de editar/excluir

#### 🔧 Implementação Necessária

**Arquivo**: `app/[locale]/perfil/page.tsx`

Adicionar seção:

```tsx
{/* Melhores Tempos */}
<Card>
  <CardHeader>
    <CardTitle>🏆 Melhores Tempos</CardTitle>
  </CardHeader>
  <CardContent>
    {profile.bestTimes && Object.keys(profile.bestTimes).length > 0 ? (
      <div className="space-y-2">
        {Object.entries(profile.bestTimes).map(([distance, data]: any) => (
          <div key={distance} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <span className="font-semibold">{distance}</span>
              <span className="text-gray-600 ml-2">{data.time}</span>
              <span className="text-sm text-gray-500 ml-2">VDOT: {data.vdot}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEditBestTime(distance)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteBestTime(distance)}>
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">Nenhum tempo registrado ainda</p>
    )}
    <Button onClick={() => setShowAddBestTimeModal(true)} className="mt-4">
      + Adicionar Melhor Tempo
    </Button>
  </CardContent>
</Card>
```

---

### 9. ⚠️ **Step 5 - Corrida Alvo no Topo**

#### 🎯 Requisito
Reorganizar Step 5:
1. **Topo**: Informações da corrida alvo (nome, distância, data, tempo)
2. **Meio**: Opções de escolha (objetivo principal)
3. **Baixo**: "O que te motiva?" (campo texto)

#### 📊 Status Atual
- Ordem diferente da solicitada

---

### 10. ⚠️ **Step 5 - Campo Nome da Corrida Opcional**

#### 🎯 Requisito
Adicionar campo "Nome da Corrida" (opcional) para já ir completo para o perfil.

#### 🔧 Implementação

```tsx
<div>
  <Label>Nome da Corrida (Opcional)</Label>
  <Input
    placeholder="Ex: Maratona de São Paulo 2026"
    value={raceName}
    onChange={(e) => setRaceName(e.target.value)}
  />
  <p className="text-xs text-gray-500 mt-1">
    Se você já tem uma corrida específica em mente
  </p>
</div>
```

---

### 11. ⚠️ **Step 5 - Validação Aparece Antes de Tentar Avançar**

#### 🎯 Requisito
Mensagem de "campo obrigatório" só deve aparecer **após** tentativa de avançar, não ao abrir o step.

#### 🔧 Solução

```tsx
// Usar touched state
const [touched, setTouched] = useState<Record<string, boolean>>({});

const handleNext = () => {
  setTouched({
    distance: true,
    date: true,
    time: true
  });
  
  // Validar...
};

// No input
<Input
  {...}
  onBlur={() => setTouched(prev => ({ ...prev, distance: true }))}
/>
{touched.distance && !distance && (
  <p className="text-red-500 text-sm">Campo obrigatório</p>
)}
```

---

### 12. ✅ **Step 5 - Opção "Quero Começar a Correr"** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** no commit 75213ac4

---

### 13. ✅ **Step 6 - Múltiplas Atividades no Mesmo Dia** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** no commit 50864643

---

### 14. ✅ **Step 6 - Esportes Customizados** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** no commit 50864643

---

### 15. ⚠️ **Step 6 - Infraestrutura não Salva no Perfil**

#### 🎯 Requisito
Infraestrutura selecionada não aparece no perfil e não permite edição.

#### 📊 Status Atual
- ✅ Salvo no banco (`hasGymAccess`, `hasPoolAccess`, `hasTrackAccess`)
- ❌ Não aparece na tela de perfil
- ❌ Não permite edição

#### 🔧 Implementação Necessária
Similar ao item #8 (Melhores Tempos), adicionar seção no perfil.

---

### 16. ✅ **Step 6 - Preferências Desmarcadas** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** - Solo, grupo, indoor, outdoor vêm desmarcados

---

### 17. ✅ **Step 6 - Longão em Dia Separado** (IMPLEMENTADO)

#### 📊 Status
✅ **JÁ IMPLEMENTADO** no commit 65e9dd81

---

## 📊 **Resumo de Prioridades**

### 🔴 **CRÍTICO** (Impede uso completo)
1. Geração automática do plano após onboarding
2. Melhores tempos não aparecem no perfil
3. Infraestrutura não aparece no perfil

### 🟡 **IMPORTANTE** (Melhora experiência)
4. Step 1: Remover dados fisiológicos duplicados
5. Step 1: Corrigir botão duplicado
6. Step 3: Melhorar explicação
7. Step 5: Reorganizar ordem dos campos
8. Step 5: Adicionar nome da corrida
9. Step 5: Corrigir validação prematura

### 🟢 **DESEJÁVEL** (Polimento)
10. Loading messages divertidos

---

## 🎯 **Próxima Sprint Sugerida**

### Sprint 1: Funcionalidades Críticas (2-3 dias)
- [ ] Geração automática de plano após onboarding
- [ ] Exibir melhores tempos no perfil (com edição/exclusão)
- [ ] Exibir infraestrutura no perfil (com edição)
- [ ] Corrigir Step 1 (remover fisiologia + botão duplicado)

### Sprint 2: Melhorias de UX (1-2 dias)
- [ ] Step 3: Melhorar textos explicativos
- [ ] Step 5: Reorganizar campos
- [ ] Step 5: Adicionar campo nome da corrida
- [ ] Step 5: Corrigir validação prematura

### Sprint 3: Polimento (1 dia)
- [ ] Loading messages divertidas
- [ ] Testes E2E completos
- [ ] Documentação final

---

**Data**: 08/11/2025  
**Status**: Documentação Completa  
**Próximo Passo**: Implementar Sprint 1
