
# 🏃 Athera Run

> Plataforma inteligente de treinamento de corrida com IA

**Versão:** 1.0.0  
**Última atualização:** 03 de Novembro de 2024  
**Website:** https://atherarun.com

---

## 📖 Sobre o Projeto

**Athera Run** é uma plataforma SaaS de treinamento de corrida que utiliza inteligência artificial para gerar planos de treino 100% personalizados. Diferente de templates genéricos, cada plano é único e considera:

- 🎯 **Perfil completo do atleta** (nível, histórico, disponibilidade real)
- 🏁 **Múltiplas corridas** (sistema A/B/C de classificação automática)
- 📊 **Metodologia VDOT** (Jack Daniels - científica e comprovada)
- 🔄 **Integração com Strava** (sincronização automática de atividades)
- 🤖 **IA GPT-4o** (via Abacus.AI - geração inteligente)

### 🎯 Diferenciais Competitivos

✅ **Planos 100% personalizados** - Não são templates, são gerados por IA  
✅ **Sistema multi-corrida** - Gerencia várias provas simultaneamente  
✅ **Classificação inteligente** - IA identifica automaticamente corridas A/B/C  
✅ **Periodização científica** - Base → Build → Peak → Taper  
✅ **Integração Strava** - Sincronização automática e OAuth 2.0  
✅ **Ajustes inteligentes** - IA monitora e ajusta o plano continuamente  
✅ **Chat com treinador virtual** - Suporte personalizado 24/7  

---

## 🚀 Acesso Rápido

### 🌐 Aplicação Online
**Produção:** https://atherarun.com  
**Status:** ✅ Online e estável

### 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[DOCUMENTACAO.md](DOCUMENTACAO.md)** | 📘 Documentação completa do produto |
| **[GUIA_TECNICO.md](GUIA_TECNICO.md)** | 🛠️ Guia técnico para desenvolvedores |
| **[ROADMAP.md](ROADMAP.md)** | 🗺️ Roadmap e planejamento futuro |

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js** 14.2.28 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS 3.4 + Shadcn UI + Radix UI
- **State**: Zustand 5.0 + React Query 5.0
- **Charts**: Recharts, React-Chartjs-2, Plotly.js

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (REST)
- **Database**: PostgreSQL 14+ (via Prisma ORM 6.18)
- **Auth**: NextAuth.js 4.24 (JWT + OAuth)

### IA & Integrações
- **LLM**: GPT-4o via Abacus.AI
- **Payments**: Stripe 19.2 (subscriptions + webhooks)
- **Wearables**: Strava API (OAuth 2.0 + webhooks)

### DevOps
- **Hosting**: Vercel (CI/CD automático)
- **Domain**: GoDaddy → atherarun.com
- **Monitoring**: Vercel Analytics

---

## 💻 Setup Local

### Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org/))
- **PostgreSQL** 14+ ([download](https://postgresql.org/))
- **Yarn** (recomendado) ou npm
- **Git**

### Instalação Rápida

```bash
# 1. Clone e navegue
cd athera-run/nextjs_space

# 2. Instale dependências
yarn install

# 3. Configure ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Setup banco de dados
yarn prisma generate
yarn prisma db push

# 5. (Opcional) Seed com dados de teste
yarn prisma db seed

# 6. Inicie dev server
yarn dev

# 🚀 Acesse: http://localhost:3000
```

### Variáveis de Ambiente Essenciais

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/atherarun"

# NextAuth
NEXTAUTH_SECRET="openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Abacus.AI (obrigatório para geração de planos)
ABACUSAI_API_KEY="seu-api-key"

# Strava (opcional)
STRAVA_CLIENT_ID="seu-client-id"
STRAVA_CLIENT_SECRET="seu-client-secret"

# Stripe (opcional)
STRIPE_SECRET_KEY="sk_test_..."
```

📖 **Detalhes completos**: Ver [GUIA_TECNICO.md](GUIA_TECNICO.md)

---

## 📁 Estrutura Principal

```
athera-run/
├── nextjs_space/              # 🏠 Aplicação principal
│   ├── app/                   # Next.js 14 App Router
│   │   ├── api/              # API Routes (REST endpoints)
│   │   ├── dashboard/        # Dashboard interativo
│   │   ├── plano/            # Visualização completa do plano
│   │   ├── onboarding/       # Fluxo de cadastro (5 etapas)
│   │   ├── perfil/           # Perfil do atleta
│   │   └── tracking/         # Acompanhamento de treinos
│   │
│   ├── components/           # Componentes React
│   │   ├── ui/              # Shadcn UI components
│   │   ├── dashboard/       # Dashboard específicos
│   │   └── plan/            # Plano específicos
│   │
│   ├── lib/                  # 🧠 Lógica de negócio
│   │   ├── ai-plan-generator.ts        # Gerador principal IA
│   │   ├── multi-race-plan-generator.ts # Sistema multi-corrida
│   │   ├── race-classifier.ts          # Classificador A/B/C
│   │   ├── strava.ts                   # Cliente Strava
│   │   ├── stripe.ts                   # Cliente Stripe
│   │   └── ...
│   │
│   ├── prisma/              # Banco de dados
│   │   ├── schema.prisma   # Schema completo
│   │   └── migrations/     # Histórico de migrações
│   │
│   └── scripts/            # Scripts utilitários
│
├── DOCUMENTACAO.md         # 📘 Documentação do produto
├── GUIA_TECNICO.md        # 🛠️ Guia técnico completo
└── ROADMAP.md             # 🗺️ Roadmap e planejamento
```

---

## 🎯 Como Usar

### Para Atletas

1. **Acesse**: https://atherarun.com
2. **Cadastre-se**: Email/senha ou Google OAuth
3. **Onboarding (5 etapas)**:
   - Dados básicos (peso, altura, idade)
   - Nível e experiência em corrida
   - Disponibilidade de dias e horários
   - Corridas e objetivos
   - Revisão e geração do plano
4. **Receba seu plano**: IA gera em ~30-60 segundos
5. **Acompanhe**: Dashboard interativo, marque treinos completos
6. **Conecte Strava**: Sincronização automática (opcional)
7. **Evolua**: IA ajusta seu plano conforme progresso

### Para Desenvolvedores

1. **Leia**: [DOCUMENTACAO.md](DOCUMENTACAO.md) - Entenda o produto
2. **Configure**: [GUIA_TECNICO.md](GUIA_TECNICO.md) - Setup completo
3. **Desenvolva**: Siga padrões de código documentados
4. **Teste**: 
   ```bash
   yarn ts-node scripts/comprehensive_test.ts
   ```
5. **Contribua**: Veja [ROADMAP.md](ROADMAP.md) para features futuras

---

## ✅ Status e Features

### Implementado (v1.0.0)

- [x] Autenticação (Email/senha + Google OAuth)
- [x] Onboarding inteligente (5 etapas com IA)
- [x] Geração de planos 100% personalizados
- [x] Sistema multi-corrida com classificação A/B/C
- [x] Dashboard interativo com métricas
- [x] Visualização completa do plano (todas as semanas)
- [x] Integração Strava (OAuth 2.0 + sincronização)
- [x] Sistema de assinaturas (Stripe + webhooks)
- [x] Customer Portal (gerenciar assinatura)
- [x] Chat com treinador virtual (GPT-4o)
- [x] Calculadoras (VDOT, nutrição)
- [x] Tracking de treinos completados

### Em Desenvolvimento (Q4 2024)

- [ ] Ajustes inteligentes automáticos
- [ ] Notificações e lembretes
- [ ] Analytics avançados
- [ ] Relatórios semanais por email

### Roadmap (2025)

- [ ] App mobile nativo (Q3 2025)
- [ ] Integração Garmin e Polar (Q1 2025)
- [ ] Social features e comunidade (Q2 2025)
- [ ] Marketplace de treinadores (Q2 2025)
- [ ] Internacionalização (EN, ES) (Q4 2025)

📖 **Ver detalhes**: [ROADMAP.md](ROADMAP.md)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! 

### Como Contribuir

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Adiciona MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Padrões

- **TypeScript** - Type safety obrigatório
- **Componentes** - Funcionais com hooks
- **Nomenclatura** - PascalCase (componentes), camelCase (funções)
- **Comentários** - Em português quando necessário
- **Formatação** - Prettier automático

📖 **Detalhes**: [GUIA_TECNICO.md](GUIA_TECNICO.md)

---

## 📊 Métricas Atuais

| Métrica | Valor |
|---------|-------|
| **Usuários Ativos** | 50+ |
| **Assinantes Premium** | 10+ |
| **Planos Gerados** | 100+ |
| **Uptime** | 99.9% |
| **Tempo Médio de Geração** | ~45s |
| **Taxa de Sucesso** | 95% |

*Última atualização: 03/Nov/2024*

---

## 🎓 Metodologia Científica

### VDOT (Jack Daniels)

Sistema baseado na metodologia **VDOT** de Jack Daniels:
- Calcula fitness level baseado em performances
- Define zonas de treino personalizadas
- Progressão segura e comprovada

📚 **Referências**:
- [Daniels' Running Formula](https://www.amazon.com/Daniels-Running-Formula-Jack/dp/1450431836)
- [VDOT Calculator](https://runsmartproject.com/calculator/)

### Periodização Clássica

```
BASE (40-50%) → BUILD (30-35%) → PEAK (10-15%) → TAPER (5-10%)
    ↓                ↓                ↓               ↓
Volume alto    Intensidade     Específico      Recuperação
Aeróbico       moderada        da prova        pré-prova
```

---

## 📞 Suporte e Links

### 📚 Documentação

- **Produto**: [DOCUMENTACAO.md](DOCUMENTACAO.md)
- **Técnica**: [GUIA_TECNICO.md](GUIA_TECNICO.md)
- **Roadmap**: [ROADMAP.md](ROADMAP.md)

### 🌐 Links Úteis

- **Website**: https://atherarun.com
- **Email**: suporte@atherarun.com
- **Issues**: GitHub Issues (este repo)

### 🛠️ Para Desenvolvedores

- **Next.js**: [Docs](https://nextjs.org/docs)
- **Prisma**: [Docs](https://www.prisma.io/docs)
- **Strava API**: [Docs](https://developers.strava.com)
- **Stripe**: [Docs](https://stripe.com/docs)

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">

### 🏃‍♂️ Feito com ❤️ para corredores por corredores 🏃‍♀️

**[Website](https://atherarun.com)** • **[Documentação](DOCUMENTACAO.md)** • **[Roadmap](ROADMAP.md)**

**© 2024 Athera Run** - O futuro da corrida é agora 💨

</div>
