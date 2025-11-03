# 🔄 Sistema de Manutenção da Documentação

> Guia para manter a documentação sempre atualizada e sincronizada com o código

**Criado:** 03 de Novembro de 2024  
**Versão:** 1.0.0

---

## 🎯 Objetivo

Este documento garante que:
- ✅ Documentação está sempre atualizada com o código
- ✅ Novas sessões de desenvolvimento têm contexto completo
- ✅ Mudanças no sistema são refletidas na documentação
- ✅ Não há informações desatualizadas ou conflitantes

---

## 📋 Checklist: Quando Atualizar a Documentação

### ⚠️ SEMPRE que fizer mudanças em:

#### 🔧 Infraestrutura
- [ ] Mudou banco de dados (PostgreSQL → outro)
- [ ] Mudou hosting (Vercel → outro)
- [ ] Adicionou/removeu serviço (CDN, cache, etc)
- [ ] Mudou domínio ou DNS

**Atualizar:**
- `DOCUMENTACAO.md` → seção "Arquitetura"
- `GUIA_TECNICO.md` → seção "Infraestrutura"
- `README.md` → seção "Stack Tecnológico"

---

#### 🤖 IA / LLM
- [ ] Mudou provider (OpenAI → outro)
- [ ] Mudou modelo (GPT-4o → GPT-5)
- [ ] Mudou variáveis de ambiente

**Atualizar:**
- `DOCUMENTACAO.md` → seção "IA e Integrações"
- `GUIA_TECNICO.md` → seção "Variáveis de Ambiente"
- `README.md` → seção "Stack Tecnológico"

---

#### 🔌 Integrações
- [ ] Adicionou nova integração (Garmin, Polar, etc)
- [ ] Removeu integração existente
- [ ] Mudou configuração de OAuth (callbacks, scopes)

**Atualizar:**
- `DOCUMENTACAO.md` → seção "Integrações"
- `GUIA_TECNICO.md` → seção "Integrações" + "Variáveis"
- `README.md` → seção "Stack Tecnológico"

---

#### 📊 Banco de Dados
- [ ] Mudou schema (novos models, campos)
- [ ] Mudou relacionamentos
- [ ] Mudou servidor/provider

**Atualizar:**
- `DOCUMENTACAO.md` → seção "Banco de Dados"
- `GUIA_TECNICO.md` → seção "Banco de Dados"
- `nextjs_space/prisma/schema.prisma` (código)

---

#### ⚡ Funcionalidades
- [ ] Adicionou feature nova
- [ ] Removeu feature existente
- [ ] Mudou fluxo de usuário

**Atualizar:**
- `DOCUMENTACAO.md` → seção "Funcionalidades"
- `README.md` → seção "Status e Features"
- `ROADMAP.md` → marcar como implementado

---

#### 🔐 Autenticação
- [ ] Adicionou/removeu provider OAuth (Google, GitHub, etc)
- [ ] Mudou fluxo de auth
- [ ] Mudou variáveis

**Atualizar:**
- `DOCUMENTACAO.md` → seção "Funcionalidades" → "Autenticação"
- `GUIA_TECNICO.md` → seção "Autenticação"
- `README.md` → se for mudança significativa

---

#### 🗺️ Roadmap
- [ ] Completou feature planejada
- [ ] Adicionou nova feature no roadmap
- [ ] Mudou prioridades

**Atualizar:**
- `ROADMAP.md` → mover para "Implementado" ou adicionar
- `README.md` → seção "Status e Features"

---

## 🔄 Processo de Atualização

### 1. Antes de Implementar Feature

```bash
# 1. Verifique o estado atual da documentação
grep -r "FEATURE_NAME" *.md

# 2. Anote o que precisa ser atualizado
# Exemplo: ROADMAP.md linha 45, DOCUMENTACAO.md seção X
```

### 2. Durante o Desenvolvimento

```bash
# Mantenha um arquivo temporário com mudanças
echo "- Mudança X na infraestrutura" >> MUDANCAS_TEMP.md
echo "- Nova integração Y" >> MUDANCAS_TEMP.md
```

### 3. Após Implementar Feature

```bash
# 1. Atualize a documentação ANTES de commitar o código
# Siga o checklist acima

# 2. Commit da documentação junto com o código
git add *.md
git add nextjs_space/...
git commit -m "feat: nova feature + docs atualizadas"

# 3. Remova arquivo temporário
rm MUDANCAS_TEMP.md
```

---

## 📝 Template de Commit

Use este formato para commits que incluem mudanças na documentação:

```bash
git commit -m "feat: [FEATURE_NAME]

Implementação:
- Lista de mudanças no código

Documentação atualizada:
- DOCUMENTACAO.md: seção X
- GUIA_TECNICO.md: seção Y
- README.md: feature adicionada

Stack alterado:
- [Se aplicável] Provider X → Y
- [Se aplicável] Banco Z → W
"
```

---

## 🤖 Prompt para Novas Sessões

Quando iniciar uma nova sessão de desenvolvimento com IA, use este prompt:

```
Olá! Vou trabalhar no projeto Athera Run.

Por favor, leia primeiro:
1. LEIA_PRIMEIRO.md - Para entender a estrutura
2. DOCUMENTACAO.md - Para contexto do produto
3. GUIA_TECNICO.md - Para detalhes técnicos

Stack atual (verificar sempre na documentação):
- Hosting: 100% Vercel
- Banco: PostgreSQL (servidor próprio 45.232.21.67)
- IA: OpenAI GPT-4o direto
- Auth: NextAuth (Email + Google OAuth)
- Integrações: Stripe, Strava

Vou implementar: [DESCREVA O QUE VAI FAZER]

Lembre-se de atualizar a documentação junto com o código!
```

---

## 📂 Arquivos da Documentação

### Estrutura Atual

```
athera-run/
├── LEIA_PRIMEIRO.md           # 🏠 Hub de navegação
├── DOCUMENTACAO.md            # 📘 Documentação do produto
├── GUIA_TECNICO.md            # 🛠️ Guia técnico para devs
├── ROADMAP.md                 # 🗺️ Roadmap e planejamento
├── README.md                  # 📖 Visão geral
├── ATUALIZACAO_DOCUMENTACAO.md # 📝 Log de atualizações
└── MANUTENCAO_DOCUMENTACAO.md # 🔄 Este arquivo (como manter)
```

### Responsabilidade de Cada Arquivo

| Arquivo | O Que Documenta | Quando Atualizar |
|---------|-----------------|------------------|
| **README.md** | Visão geral, quick start | Mudanças no stack, features principais |
| **LEIA_PRIMEIRO.md** | Navegação, como usar docs | Adicionar novos docs, mudar estrutura |
| **DOCUMENTACAO.md** | Produto completo, arquitetura | Qualquer mudança funcional ou arquitetural |
| **GUIA_TECNICO.md** | Setup, código, APIs | Mudanças técnicas, variáveis, integrações |
| **ROADMAP.md** | Features futuras | Feature implementada ou planejada |
| **ATUALIZACAO_DOCUMENTACAO.md** | Histórico de mudanças | Toda atualização da documentação |
| **MANUTENCAO_DOCUMENTACAO.md** | Como manter docs | Processo de manutenção muda |

---

## 🎯 Regras de Ouro

### ✅ Sempre Faça

1. **Documente ANTES de esquecer**
   - Atualize documentação logo após implementar
   - Não deixe para "depois"

2. **Commit código + documentação juntos**
   - Nunca commitar código sem atualizar docs
   - Use mensagens de commit que mencionem docs

3. **Verifique conflitos**
   - Antes de atualizar, veja se não conflita com outra seção
   - Mantenha consistência entre documentos

4. **Teste a documentação**
   - Siga o próprio guia técnico para verificar se funciona
   - URLs devem estar corretas (não localhost!)

5. **Versione a documentação**
   - Atualize número de versão em `ATUALIZACAO_DOCUMENTACAO.md`
   - Adicione entrada no log com data e mudanças

### ❌ Nunca Faça

1. **Deixar docs desatualizados**
   - Código mudou → Docs devem mudar
   
2. **Documentar "depois"**
   - "Depois" nunca chega
   
3. **Criar documentos temporários**
   - Use apenas os 6 documentos principais
   - Não crie `SETUP_TEMP.md`, `NOTA_X.md`, etc
   
4. **Duplicar informação**
   - Uma informação = um lugar
   - Use links entre documentos
   
5. **Usar valores de exemplo antigos**
   - URLs sempre atherarun.com (não localhost)
   - Provider sempre OpenAI (não Abacus)

---

## 🔍 Como Verificar se Docs Estão Atualizados

### Script de Verificação

```bash
#!/bin/bash
# scripts/check-docs.sh

echo "🔍 Verificando consistência da documentação..."
echo ""

# 1. Verifica referências a Abacus (não deve existir)
echo "1. Verificando referências obsoletas..."
if grep -r "Abacus" *.md 2>/dev/null; then
    echo "❌ ERRO: Encontrou referências a Abacus.AI (obsoleto)"
else
    echo "✅ OK: Sem referências a Abacus.AI"
fi

# 2. Verifica localhost em produção
echo ""
echo "2. Verificando URLs..."
if grep -r "localhost:3000" *.md | grep -v "dev\|local\|desenvolvimento" 2>/dev/null; then
    echo "⚠️  AVISO: Encontrou localhost em contexto de produção"
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
fi

# 4. Verifica versão
echo ""
echo "4. Verificando versão..."
version=$(grep "Versão:" ATUALIZACAO_DOCUMENTACAO.md | head -1 | awk '{print $2}')
echo "📌 Versão atual da documentação: $version"

echo ""
echo "✅ Verificação concluída!"
```

### Como Usar

```bash
# Torne o script executável
chmod +x scripts/check-docs.sh

# Execute antes de commitar
./scripts/check-docs.sh

# Se tudo OK, pode commitar
git commit -m "..."
```

---

## 📅 Manutenção Recorrente

### Semanal
- [ ] Revisar ROADMAP.md - features completadas?
- [ ] Verificar links quebrados
- [ ] Rodar script de verificação

### Mensal
- [ ] Revisar métricas em README.md
- [ ] Atualizar seção "Status" em todos os docs
- [ ] Verificar se stack mudou

### Trimestral
- [ ] Revisar ROADMAP.md completo
- [ ] Atualizar projeções de receita
- [ ] Criar nova versão da documentação se necessário

---

## 🆘 Troubleshooting

### Documentação conflitante entre arquivos

**Problema:** README.md diz uma coisa, GUIA_TECNICO.md diz outra

**Solução:**
1. Verifique qual é a verdade (código, Vercel Dashboard)
2. Atualize TODOS os arquivos com a informação correta
3. Use `grep -r "TERMO"` para encontrar todas as ocorrências
4. Commit: "fix: consistência na documentação"

### Não sei onde documentar algo

**Solução:** Use esta tabela:

| O Que | Onde Documentar |
|-------|----------------|
| Visão geral produto | DOCUMENTACAO.md |
| Como instalar/rodar | GUIA_TECNICO.md |
| Features planejadas | ROADMAP.md |
| Quick start | README.md |
| Como usar docs | LEIA_PRIMEIRO.md |
| Histórico mudanças | ATUALIZACAO_DOCUMENTACAO.md |
| Processo manutenção | MANUTENCAO_DOCUMENTACAO.md |

### Esqueci de atualizar docs no último commit

**Solução:**
```bash
# 1. Atualize a documentação agora
# 2. Commit separado
git add *.md
git commit -m "docs: atualização esquecida do commit anterior"

# 3. Se quiser juntar com commit anterior (antes de push)
git rebase -i HEAD~2
# Marque o segundo commit como 'fixup'
```

---

## ✅ Checklist Final Antes de Commitar

```bash
# Antes de cada commit, verifique:

□ Código implementado e testado
□ Documentação atualizada (veja seção "Quando Atualizar")
□ Versão incrementada em ATUALIZACAO_DOCUMENTACAO.md
□ Log adicionado em ATUALIZACAO_DOCUMENTACAO.md
□ Script de verificação rodado (./scripts/check-docs.sh)
□ Sem referências a Abacus.AI
□ Sem referências a localhost (exceto dev local)
□ URLs corretas (atherarun.com)
□ Variáveis corretas (OpenAI, não Abacus)
□ Mensagem de commit menciona docs se relevante
```

---

## 📞 Dúvidas?

Se tiver dúvidas sobre onde/como documentar algo:

1. Leia este arquivo completo
2. Veja exemplos em commits anteriores
3. Na dúvida, documente em GUIA_TECNICO.md (é o mais completo)

---

## 🎉 Conclusão

Seguindo este processo, você garante que:

✅ Documentação sempre atualizada  
✅ Novas sessões têm contexto completo  
✅ Sem informações conflitantes  
✅ Fácil onboarding de novos devs  
✅ IA tem contexto correto em novas sessões  

**Lembre-se: Código sem documentação = código que não existe** 📚

---

**© 2024 Athera Run**  
Documentação v1.0.0 - Novembro 2024
