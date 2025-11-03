#!/bin/bash
# Script de verificação da documentação

echo "🔍 Verificando consistência da documentação..."
echo ""

# 1. Verifica referências a Abacus (não deve existir)
echo "1. Verificando referências obsoletas..."
cd /root/athera-run
if grep -r "Abacus" *.md 2>/dev/null | grep -v "MANUTENCAO\|ATUALIZACAO" | grep -v "não.*Abacus\|Removido.*Abacus"; then
    echo "❌ ERRO: Encontrou referências a Abacus.AI (obsoleto)"
    exit 1
else
    echo "✅ OK: Sem referências a Abacus.AI"
fi

# 2. Verifica localhost em produção (exceto em contexto de dev)
echo ""
echo "2. Verificando URLs..."
problemas=$(grep -r "localhost:3000" *.md 2>/dev/null | grep -v "dev\|local\|desenvolvimento\|Local\|MANUTENCAO\|exemplo" || true)
if [ -n "$problemas" ]; then
    echo "⚠️  AVISO: Possível localhost em contexto de produção:"
    echo "$problemas"
else
    echo "✅ OK: URLs de produção corretas"
fi

# 3. Verifica stack documentado
echo ""
echo "3. Verificando stack tecnológico..."
if grep -q "OpenAI GPT-4o" DOCUMENTACAO.md && \
   grep -q "PostgreSQL" DOCUMENTACAO.md && \
   grep -q "Vercel" DOCUMENTACAO.md; then
    echo "✅ OK: Stack documentado corretamente"
else
    echo "❌ ERRO: Stack incompleto na documentação"
    exit 1
fi

# 4. Verifica versão
echo ""
echo "4. Verificando versão..."
version=$(grep "Versão:" ATUALIZACAO_DOCUMENTACAO.md | head -1 | awk '{print $2}')
echo "📌 Versão atual da documentação: $version"

# 5. Conta documentos principais
echo ""
echo "5. Verificando estrutura..."
count=$(ls -1 *.md 2>/dev/null | wc -l)
if [ "$count" -ge 6 ]; then
    echo "✅ OK: $count documentos encontrados"
else
    echo "⚠️  AVISO: Apenas $count documentos (esperado: 6+)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verificação concluída!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
