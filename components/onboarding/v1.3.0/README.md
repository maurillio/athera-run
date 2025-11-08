# Onboarding Components - Guia de Desenvolvimento

## ⚠️ REGRA IMPORTANTE: Navegação de Steps

### ❌ NÃO adicione botões de navegação dentro dos componentes de Step

Os componentes `Step1BasicData.tsx`, `Step2SportBackground.tsx`, etc. **NÃO devem** incluir seus próprios botões "Próximo" ou "Anterior".

**Razão:** O componente pai (`app/[locale]/onboarding/page.tsx`) já renderiza os botões de navegação para todos os steps (1-6).

### ✅ Estrutura Correta

```tsx
export default function StepXComponent({ data, onUpdate, onNext, onPrevious }: StepProps) {
  // ... lógica do componente
  
  return (
    <div className="space-y-6">
      {/* Conteúdo do step */}
      <div>
        {/* Campos do formulário */}
      </div>
      
      {/* ❌ NÃO ADICIONAR BOTÕES AQUI! */}
      {/* Os botões são renderizados pelo componente pai */}
    </div>
  );
}
```

### 📋 Responsabilidades

**Componente Step (Step1, Step2, etc.):**
- ✅ Renderizar campos do formulário
- ✅ Validar dados localmente
- ✅ Chamar `onUpdate()` para salvar dados (com debounce)
- ✅ Implementar lógica de validação antes de avançar
- ❌ **NÃO** renderizar botões de navegação

**Componente Pai (page.tsx):**
- ✅ Renderizar botões "Anterior" e "Próximo" (steps 1-6)
- ✅ Gerenciar estado global do formulário
- ✅ Controlar navegação entre steps
- ✅ Submeter dados finais para a API

### 🔍 Exceção: Step 7 (Review)

O **Step7Review** é uma exceção porque:
- Tem seu próprio botão "Finalizar" com loading state
- Não usa os botões do componente pai
- O pai explicitamente não renderiza botões quando `currentStep === 7`

### 🐛 Como Prevenir Duplicação

1. **Antes de modificar um Step:**
   - Verifique se o componente pai já renderiza os botões
   - Leia esta documentação

2. **Ao criar novo Step:**
   - Use os Steps existentes como template
   - Remova qualquer código de botões de navegação

3. **Teste visual:**
   - Sempre verifique se há botões duplicados na tela
   - Teste navegação entre todos os steps

### 📝 Exemplo de Problema

```tsx
// ❌ ERRADO - Causa duplicação
return (
  <div>
    {/* conteúdo */}
    <button onClick={handleNext}>Próximo</button>
  </div>
);

// ✅ CORRETO
return (
  <div>
    {/* conteúdo */}
    {/* Sem botões - o pai renderiza */}
  </div>
);
```

---

**Data da última atualização:** 2025-11-08
**Versão:** 1.3.0
