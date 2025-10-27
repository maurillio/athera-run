
# 🏃 Maratona Training

> Plataforma de treinamento de corrida com geração de planos personalizados usando IA

[![Deploy](https://repository-images.githubusercontent.com/728428101/43bf5fdd-c155-4aa7-b86c-91fe176c131e)
[![Next.js](https://i.ytimg.com/vi/uUalQbg-TGA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDCyUJjd8iTH-USqdXz5eOCIY3KfA)
[![TypeScript](https://i.ytimg.com/vi/4cgpu9L2AE8/maxresdefault.jpg)
[![Prisma](https://user-images.githubusercontent.com/66284362/159115513-3ae48dd6-3d9c-416f-83d4-db48de23fac8.png)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Sobre o Projeto

**Maratona Training** é uma plataforma completa de treinamento de corrida que utiliza inteligência artificial para gerar planos de treino verdadeiramente personalizados. Ao contrário de templates genéricos, cada plano é gerado dinamicamente considerando:

- 🎯 **Perfil completo do atleta** (nível, histórico, disponibilidade)
- 🏁 **Meta específica da prova** (distância, data, objetivo de tempo)
- 📊 **Metodologia VDOT** (Jack Daniels)
- 🔄 **Integração com Strava** (sincronização automática)
- 🤖 **IA GPT-4o** (Abacus.AI)

### 🎯 Diferenciais

- ✅ Planos adaptados à **sua** disponibilidade de dias
- ✅ Periodização científica (base, build, peak, taper)
- ✅ Cálculo dinâmico de duração baseado na data da prova
- ✅ Treinos de força nos dias escolhidos
- ✅ Chat com treinador virtual
- ✅ Calculadora de macros nutricionais
- ✅ Prevenção de overtraining

---

## 🚀 Acesso Rápido

### 🌐 Aplicação Online
**URL**: https://42maurillio.abacusai.app

### 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [Documentação Completa](DOCUMENTACAO_COMPLETA_PROJETO.md) | Visão geral, arquitetura, funcionalidades |
| [Guia Técnico Detalhado](GUIA_TECNICO_DETALHADO.md) | Setup, código, APIs, troubleshooting |
| [Roadmap de Implementação](ROADMAP_IMPLEMENTACAO.md) | Features futuras, priorização, timeline |
| [Análise e Melhorias](ANALISE_SISTEMA_E_MELHORIAS.md) | Análise técnica, oportunidades de melhoria |
| [OAuth Strava Setup](OAUTH_SETUP_INSTRUCTIONS.md) | Configuração completa da integração Strava |

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI**: Tailwind CSS + Shadcn UI + Radix UI
- **State**: Zustand + React Query
- **Charts**: Recharts + React-Chartjs-2

### Backend
- **API**: Next.js API Routes
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma 6.7
- **Autenticação**: NextAuth.js

### IA e Integrações
- **LLM**: OpenAI GPT-4o (via Abacus.AI)
- **Wearables**: Strava API (OAuth 2.0)
- **Futuros**: Garmin, Polar, Apple Health

---

## 📦 Instalação Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Yarn (gerenciador de pacotes)
- Conta no Strava (para integração)
- API Key da Abacus.AI

### Passo a Passo

```bash
# 1. Clone o repositório (ou navegue até o diretório)
cd /home/ubuntu/app_maratona/nextjs_space

# 2. Instale as dependências
yarn install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Configure o banco de dados
yarn prisma generate
yarn prisma db push

# 5. (Opcional) Popule com dados de teste
yarn prisma db seed

# 6. Inicie o servidor de desenvolvimento
yarn dev

# Acesse: http://localhost:3000
```

### Variáveis de Ambiente Necessárias

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Strava API
STRAVA_CLIENT_ID="seu-client-id"
STRAVA_CLIENT_SECRET="seu-client-secret"
STRAVA_REDIRECT_URI="http://localhost:3000/api/strava/callback"

# Abacus.AI
ABACUSAI_API_KEY="seu-api-key"
```

Veja [OAuth Strava Setup](OAUTH_SETUP_INSTRUCTIONS.md) para obter credenciais do Strava.

---

## 📁 Estrutura do Projeto

```
nextjs_space/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (backend)
│   ├── dashboard/         # Dashboard principal
│   ├── plano/             # Visualização do plano
│   ├── onboarding/        # Fluxo de cadastro
│   └── ...
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes Shadcn UI
│   └── ...
├── lib/                   # Lógica de negócio
│   ├── ai-plan-generator.ts
│   ├── strava.ts
│   ├── db.ts
│   └── ...
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
├── scripts/              # Scripts utilitários
└── public/               # Assets estáticos
```

---

## 🎮 Como Usar

### Para Usuários

1. **Cadastre-se**: Crie uma conta em https://42maurillio.abacusai.app/signup
2. **Onboarding**: Preencha seu perfil de atleta (5 etapas)
3. **Gere o Plano**: Sistema gera automaticamente seu plano personalizado
4. **Conecte o Strava** (opcional): Sincronização automática de treinos
5. **Acompanhe**: Marque treinos como completos, veja progresso, chat com IA

### Para Desenvolvedores

1. **Leia a documentação**: Comece por [DOCUMENTACAO_COMPLETA_PROJETO.md](DOCUMENTACAO_COMPLETA_PROJETO.md)
2. **Entenda a arquitetura**: Veja [GUIA_TECNICO_DETALHADO.md](GUIA_TECNICO_DETALHADO.md)
3. **Configure o ambiente**: Siga instruções de instalação acima
4. **Rode os testes**:
   ```bash
   yarn ts-node scripts/comprehensive_test.ts
   ```
5. **Contribua**: Veja [Roadmap](ROADMAP_IMPLEMENTACAO.md) para features planejadas

---

## 🧪 Testes

### Testes Abrangentes

```bash
# Script que cria usuários de teste e valida geração de planos
yarn ts-node scripts/comprehensive_test.ts
```

### Teste de Usuário Específico

```bash
# Verificar dados de um usuário
yarn ts-node scripts/check_user.ts
```

### Validação de Perfil

```bash
# Verificar perfil e disponibilidade
yarn ts-node check_profile_data.ts
```

### Último Resultado de Testes

```
✅ Taxa de Sucesso: 80% (4/5)
✅ Planos respeitam disponibilidade: 100%
✅ Dias de força corretos: 100%
✅ Duração calculada corretamente: 100%

⚠️ Observação: Planos > 40 semanas podem falhar ocasionalmente
```

---

## 🔑 Credenciais de Teste

### Usuário de Teste

```
Email: mmaurillio2@gmail.com
Senha: [definida pelo desenvolvedor]
```

Este usuário tem:
- Perfil completo preenchido
- Meta: Maratona de São Paulo (agosto 2026)
- Plano ativo de ~40 semanas
- Strava conectado

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja o [Roadmap](ROADMAP_IMPLEMENTACAO.md) para features planejadas.

### Processo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- TypeScript para type safety
- Componentes funcionais com hooks
- Nomes descritivos (inglês ou português consistente)
- Comentários em português
- Prettier para formatação

---

## 📈 Status do Projeto

### ✅ Implementado

- [x] Cadastro e autenticação
- [x] Perfil completo do atleta
- [x] Geração de planos com IA
- [x] Integração Strava OAuth
- [x] Dashboard interativo
- [x] Chat com IA
- [x] Calculadora nutricional
- [x] Visualização de plano completo

### 🚧 Em Desenvolvimento

- [ ] Ajustes automáticos inteligentes
- [ ] Notificações e lembretes
- [ ] Análise avançada de progresso
- [ ] Multi-race planning

### 🔮 Planejado

- [ ] App mobile nativo
- [ ] Comunidade e social features
- [ ] Marketplace de treinadores
- [ ] Integração Garmin/Polar
- [ ] Planos de força detalhados

Veja [Roadmap completo](ROADMAP_IMPLEMENTACAO.md) para mais detalhes.

---

## 🐛 Problemas Conhecidos

1. **Planos muito longos (>40 semanas) podem falhar ocasionalmente**
   - Workaround: Gerar plano novamente
   - Fix planejado: Geração em chunks

2. **Timezone pode ser inconsistente em algumas datas**
   - Workaround: Tudo em UTC, conversão na UI
   - Fix planejado: Padronização completa

Veja [Análise e Melhorias](ANALISE_SISTEMA_E_MELHORIAS.md) para lista completa.

---

## 📞 Suporte

### Documentação
- [Documentação Completa](DOCUMENTACAO_COMPLETA_PROJETO.md)
- [Guia Técnico](GUIA_TECNICO_DETALHADO.md)
- [FAQ (em breve)](#)

### Contato
- **Email**: mmaurillio2@gmail.com
- **Issues**: Abra uma issue neste repositório

---

## 🎓 Metodologia

### VDOT (Jack Daniels)

O sistema usa a metodologia **VDOT** de Jack Daniels, que:
- Calcula fitness level baseado em performances recentes
- Define zonas de treino personalizadas
- Garante progressão segura e efetiva

**Referências**:
- [Daniels' Running Formula](https://www.amazon.com/Daniels-Running-Formula-Jack/dp/1450431836)
- [VDOT Calculator](https://runsmartproject.com/calculator/)

### Periodização

Planos seguem periodização clássica:
1. **Base**: Construção de volume aeróbico
2. **Build**: Introdução de treinos específicos
3. **Peak**: Treinos mais intensos e específicos
4. **Taper**: Redução de volume para recuperação

---

## 📊 Estatísticas

### Projeto
- **Linhas de código**: ~15,000+
- **Componentes React**: 50+
- **API Routes**: 30+
- **Tempo de desenvolvimento**: 3 meses
- **Última atualização**: 27 de outubro de 2025

### Tecnologia
- **TypeScript**: 95%
- **CSS**: 3%
- **Outros**: 2%

---

## 🌟 Agradecimentos

- **Abacus.AI** - Infraestrutura e APIs de IA
- **Strava** - Integração de atividades
- **Jack Daniels** - Metodologia VDOT
- **Comunidade de corredores** - Feedback e testes

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 🚀 Deploy

### Deploy Automático (Abacus.AI)

O projeto está configurado para deploy automático em:
**https://42maurillio.abacusai.app**

### Deploy Manual

```bash
# Build de produção
yarn build

# Iniciar servidor
yarn start
```

### Variáveis de Produção

Certifique-se de configurar:
- `NEXTAUTH_URL` com domínio de produção
- `STRAVA_REDIRECT_URI` com URL de produção
- `DATABASE_URL` com banco de produção

---

## 📚 Aprenda Mais

### Next.js
- [Documentação oficial](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### Strava API
- [Developers Guide](https://developers.strava.com/docs/)
- [API Reference](https://developers.strava.com/docs/reference/)

---

<div align="center">

**Feito com ❤️ para corredores por corredores**

[Website](https://42maurillio.abacusai.app) • [Documentação](DOCUMENTACAO_COMPLETA_PROJETO.md) • [Roadmap](ROADMAP_IMPLEMENTACAO.md)

</div>
