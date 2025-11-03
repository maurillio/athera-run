# 📖 LEIA PRIMEIRO - Athera Run

> Guia rápido de navegação da documentação

**Última atualização:** 03 de Novembro de 2024  
**Versão:** 1.0.0

---

## 🎯 Você é...

### 🏃 **Usuário/Atleta**
Quer usar a plataforma para treinar?

→ **Acesse:** https://atherarun.com  
→ **Leia:** [README.md](README.md) - Visão geral do projeto

---

### 👔 **Stakeholder/Product Manager**
Quer entender o produto e roadmap?

→ **Leia primeiro:** [DOCUMENTACAO.md](DOCUMENTACAO.md)  
→ **Depois:** [ROADMAP.md](ROADMAP.md)

**O que vai encontrar:**
- Visão geral do produto
- Funcionalidades completas
- Arquitetura de alto nível
- Integrações (Strava, Stripe)
- Planos de monetização
- Roadmap detalhado por trimestre

---

### 💻 **Desenvolvedor**
Quer configurar ambiente e desenvolver?

→ **Leia primeiro:** [GUIA_TECNICO.md](GUIA_TECNICO.md)  
→ **Depois:** [DOCUMENTACAO.md](DOCUMENTACAO.md)

**O que vai encontrar:**
- Setup completo do ambiente
- Arquitetura do código
- Documentação de APIs
- Integrações técnicas (Strava, Stripe, IA)
- Troubleshooting
- Padrões de código

---

## 📚 Estrutura da Documentação

```
athera-run/
├── README.md              # 🏠 Visão geral e introdução
│                           # → Para todos: primeira leitura
│
├── DOCUMENTACAO.md        # 📘 Documentação completa do produto
│                           # → Para PMs e stakeholders
│                           # Conteúdo:
│                           #   - Visão geral do produto
│                           #   - Funcionalidades detalhadas
│                           #   - Arquitetura de alto nível
│                           #   - Fluxo de usuário
│                           #   - Integrações
│                           #   - Banco de dados
│                           #   - Monetização
│
├── GUIA_TECNICO.md        # 🛠️ Guia técnico para desenvolvedores
│                           # → Para desenvolvedores
│                           # Conteúdo:
│                           #   - Setup inicial
│                           #   - Arquitetura do código
│                           #   - APIs e endpoints
│                           #   - Geração de planos com IA
│                           #   - Autenticação
│                           #   - Integrações (detalhes técnicos)
│                           #   - Deployment
│                           #   - Troubleshooting
│
└── ROADMAP.md             # 🗺️ Roadmap e planejamento
                            # → Para todos
                            # Conteúdo:
                            #   - Prioridades
                            #   - Features por trimestre (2024-2025)
                            #   - Roadmap futuro (2026+)
                            #   - Métricas de sucesso
                            #   - Plano de monetização
```

---

## 🚀 Quick Start por Perfil

### Usuário - Começar a usar (3 min)

1. Acesse https://atherarun.com
2. Clique em "Começar" → Cadastre-se
3. Preencha onboarding (5 etapas)
4. Receba seu plano personalizado!

---

### Product Manager - Entender o produto (30 min)

1. Leia [README.md](README.md) (5 min)
2. Leia [DOCUMENTACAO.md](DOCUMENTACAO.md) (20 min)
3. Leia [ROADMAP.md](ROADMAP.md) (5 min)

**Você terá:**
✅ Visão completa do produto  
✅ Entendimento de funcionalidades  
✅ Roadmap de evolução  

---

### Desenvolvedor - Setup e desenvolvimento (60 min)

1. Leia [README.md](README.md) (5 min)
2. Leia [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Setup Inicial" (15 min)
3. Configure ambiente local (30 min)
4. Explore código (10 min)

**Você terá:**
✅ Ambiente funcionando  
✅ Entendimento da arquitetura  
✅ Capacidade de desenvolver  

---

## 🔍 Encontrar Informações Específicas

### Como fazer deploy?
→ [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Deployment"

### Como funciona a integração Strava?
→ [DOCUMENTACAO.md](DOCUMENTACAO.md) - seção "Integrações"  
→ [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Integrações" (detalhes técnicos)

### Como a IA gera planos?
→ [DOCUMENTACAO.md](DOCUMENTACAO.md) - seção "Geração de Planos com IA"  
→ [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Geração de Planos com IA" (código)

### Como funciona o sistema de assinaturas?
→ [DOCUMENTACAO.md](DOCUMENTACAO.md) - seção "Monetização"  
→ [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Integrações" → "Stripe"

### Quais features estão planejadas?
→ [ROADMAP.md](ROADMAP.md)

### Como resolver erro X?
→ [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Troubleshooting"

### Qual o schema do banco de dados?
→ [DOCUMENTACAO.md](DOCUMENTACAO.md) - seção "Banco de Dados"  
→ Ou veja diretamente: `nextjs_space/prisma/schema.prisma`

---

## 📊 Documentação em Números

| Documento | Páginas | Tempo Leitura | Para Quem |
|-----------|---------|---------------|-----------|
| **README.md** | 3 | 5 min | Todos |
| **DOCUMENTACAO.md** | 15 | 30 min | PM/Stakeholder |
| **GUIA_TECNICO.md** | 25 | 60 min | Desenvolvedor |
| **ROADMAP.md** | 10 | 15 min | Todos |

---

## ✅ Checklist de Onboarding

### Para Product Managers

- [ ] Li README.md completo
- [ ] Li DOCUMENTACAO.md completo
- [ ] Entendo as funcionalidades principais
- [ ] Conheço as integrações (Strava, Stripe)
- [ ] Entendo o modelo de monetização
- [ ] Li o roadmap e prioridades
- [ ] Testei a plataforma (criei conta)

### Para Desenvolvedores

- [ ] Li README.md completo
- [ ] Li seção "Setup Inicial" do GUIA_TECNICO.md
- [ ] Configurei ambiente local com sucesso
- [ ] Consegui rodar `yarn dev`
- [ ] Entendo estrutura de diretórios
- [ ] Li seção "Arquitetura do Código"
- [ ] Explorei principais arquivos (lib/ai-plan-generator.ts, etc)
- [ ] Testei criar usuário e gerar plano localmente

---

## 🆘 Precisa de Ajuda?

### Documentação não está clara?
Abra uma issue descrevendo o que está confuso

### Encontrou erro na documentação?
Faça um PR com a correção

### Tem dúvida técnica?
1. Verifique [GUIA_TECNICO.md](GUIA_TECNICO.md) - seção "Troubleshooting"
2. Procure em issues existentes
3. Abra nova issue

### Quer sugerir melhoria?
1. Veja [ROADMAP.md](ROADMAP.md) - pode já estar planejado
2. Abra issue com sua sugestão

---

## 📞 Contatos

- **Website:** https://atherarun.com
- **Email:** suporte@atherarun.com
- **Issues:** GitHub Issues deste repositório

---

## 🎯 Objetivo desta Documentação

Esta documentação foi criada para ser:

✅ **Completa** - Cobre produto, técnico e roadmap  
✅ **Organizada** - Fácil de navegar e encontrar informações  
✅ **Atualizada** - Mantida em sincronia com o código  
✅ **Prática** - Com exemplos reais e código funcional  
✅ **Clara** - Para diferentes perfis (usuário, PM, dev)  

---

**Boa leitura! 📖**

Se você leu até aqui, parabéns! Você agora sabe exatamente onde encontrar qualquer informação sobre o Athera Run. 🎉

---

**© 2024 Athera Run**
