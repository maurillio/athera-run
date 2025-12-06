# 🚨 GUIA RÁPIDO - Limpar Treino de Amanhã

## Quando Usar

Use esta API quando:
- Treino futuro foi marcado como completado incorretamente
- Match via pop-up não funcionou corretamente
- Botão "Desfazer" não está aparecendo ou não funciona

## Como Usar

### Passo 1: Abrir Console do Browser

1. Acesse https://atherarun.com
2. Faça login (se ainda não estiver)
3. Pressione `F12` (ou `Cmd+Opt+J` no Mac)
4. Clique na aba "Console"

### Passo 2: Executar Comando

Cole este código no console e pressione Enter:

```javascript
fetch('/api/debug/clean-tomorrow', { 
  method: 'POST' 
})
  .then(r => r.json())
  .then(result => {
    console.log('✅ Resultado:', result);
    if (result.success) {
      console.log(`
🎉 LIMPEZA CONCLUÍDA!

Total de treinos: ${result.summary.total}
Limpos: ${result.summary.cleaned}
Já corretos: ${result.summary.skipped}

Detalhes:
${JSON.stringify(result.details, null, 2)}
      `);
      alert('✅ Treino de amanhã limpo! Recarregue a página.');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.error('❌ Erro:', result.error);
      alert('❌ Erro ao limpar: ' + result.error);
    }
  })
  .catch(err => {
    console.error('💥 Erro:', err);
    alert('💥 Erro de conexão');
  });
```

### Passo 3: Aguardar e Recarregar

- Aguarde mensagem de sucesso
- Página será recarregada automaticamente
- Treino de amanhã deve estar limpo (não completado)

## ⚠️ Importante

- **Esta API só limpa treinos de amanhã (07/DEZ/2025)**
- **Você deve estar logado**
- **Só afeta seus próprios treinos**
- **É seguro executar múltiplas vezes** (idempotente)

## 📊 Resposta Esperada

```json
{
  "success": true,
  "message": "Treinos de amanhã limpos com sucesso",
  "summary": {
    "total": 1,
    "cleaned": 1,
    "skipped": 0
  },
  "details": {
    "cleaned": [
      {
        "workoutId": 1234,
        "title": "Longão - 20km",
        "executedWorkoutId": 1250
      }
    ],
    "skipped": []
  }
}
```

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)
- **Causa:** Não está logado
- **Solução:** Faça login em atherarun.com e tente novamente

### Erro 404 (Not Found)
- **Causa:** Deploy ainda não completou
- **Solução:** Aguarde 2-3min e tente novamente

### Erro 500 (Internal Server Error)
- **Causa:** Problema no servidor
- **Solução:** Avise o desenvolvedor e aguarde correção

### Nenhum treino limpo (cleaned: 0)
- **Causa:** Treino de amanhã já está correto
- **Solução:** Nada a fazer, tudo certo!

## 📝 Depois de Limpar

1. Recarregue a página do plano
2. Verifique que treino de amanhã está **planejado** (não completado)
3. Badge de substituição não deve aparecer
4. Botão "Marcar como Concluído" deve estar disponível

## 🔗 Links Úteis

- Deploy Vercel: https://vercel.com/maurillios-projects/athera-run
- Logs: Vercel → Runtime Logs
- Código: `app/api/debug/clean-tomorrow/route.ts`

---

**Criado em:** 06/DEZ/2025  
**Versão do Sistema:** v5.0.16
