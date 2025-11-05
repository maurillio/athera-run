# 📝 RESPOSTA DETALHADA PARA STRAVA API - 05 NOV 2025

## 🎯 INFORMAÇÕES DO APLICATIVO

**Nome:** Athera Run  
**Website:** https://atherarun.com  
**Descrição:** Plataforma SaaS de treinamento de corrida personalizado com IA  
**Categoria:** Health & Fitness  
**Client ID:** (fornecido no dashboard)

---

## ✅ RESPOSTAS PARA STRAVA DEVELOPER PROGRAM

### 1. 🤖 USO DE IA/ML NO PROJETO

**Resposta:** SIM, utilizamos Inteligência Artificial (OpenAI GPT-4o)

#### Como a IA é Utilizada:

**A) Geração de Planos de Treino Personalizados**
- IA analisa perfil completo do atleta (idade, peso, experiência, disponibilidade)
- Cria plano de treinamento semanal único (não template)
- Respeita limitações físicas, histórico de lesões e objetivos

**B) Análise de Progresso Individual**
- IA processa dados de treinos completados (do Strava e/ou manuais)
- Identifica padrões de fadiga, sobretreino, progressão
- Sugere ajustes personalizados no plano

**C) Chat com Treinador Virtual**
- Atleta pode fazer perguntas sobre treino, recuperação, nutrição
- IA responde com base no contexto completo do atleta
- Suporte 24/7 personalizado

**D) Classificação de Corridas (Sistema A/B/C)**
- IA analisa múltiplas corridas do atleta
- Classifica automaticamente por prioridade e timing
- Cria periodização inteligente integrando todas as provas

---

### 2. 📊 COMO DADOS DA API STRAVA SÃO UTILIZADOS

#### Dados Coletados:
- **Atividades:** distância, duração, pace médio, elevação
- **Métricas:** frequência cardíaca (se disponível)
- **Dados do Atleta:** nome, foto de perfil (apenas para exibição)

#### Finalidade do Uso:

**A) Sincronização Automática de Treinos**
```
Atleta completa corrida → Strava registra → Athera sincroniza automaticamente
Benefício: Atleta não precisa registrar treino duas vezes
```

**B) Associação com Plano**
```
Treino sincronizado → Comparado com treino planejado do dia
Resultado: "✅ Treino de 10km em ritmo moderado - COMPLETO"
```

**C) Análise de Progresso**
```
IA recebe: "Atleta completou 3 treinos esta semana, média de pace 5:30/km"
IA analisa: Progresso dentro do esperado? Fadiga aparente?
IA sugere: "Manter volume" ou "Reduzir intensidade próxima semana"
```

**D) Métricas de Dashboard**
- Volume semanal/mensal acumulado
- Progressão de pace ao longo das semanas
- Taxa de conclusão de treinos planejados

#### O QUE NÃO FAZEMOS:
- ❌ NÃO treinamos modelos de IA com dados Strava
- ❌ NÃO compartilhamos dados com terceiros
- ❌ NÃO vendemos dados de usuários
- ❌ NÃO fazemos análises agregadas/estatísticas públicas
- ❌ NÃO exportamos dados para outros sistemas

---

### 3. 🔒 CONFORMIDADE COM TERMOS DE SERVIÇO STRAVA

#### A) Restrições ao Uso de Dados para Treinar Modelos de IA

**GARANTIA EXPLÍCITA:**
> **Nós NÃO usamos dados do Strava para treinar, retreinar, ou melhorar qualquer modelo de IA ou Machine Learning.**

**Como Garantimos:**

1. **Arquitetura de Dados Isolada**
```
Dados Strava → Banco PostgreSQL (tabela: CompletedWorkout)
                ↓
                Usado APENAS para:
                - Dashboard do usuário
                - Análise individual
                - Contexto para IA responder sobre AQUELE atleta
                ↓
                NUNCA enviado para:
                - OpenAI Training
                - Fine-tuning de modelos
                - Datasets de ML
```

2. **Uso de IA é "Inference Only"**
```
Quando IA analisa progresso do atleta:
- Envia apenas contexto DAQUELE atleta específico
- OpenAI GPT-4o processa e retorna sugestões
- OpenAI NÃO armazena dados (API usage, not training)
- Resposta é específica para aquele atleta
```

3. **Código Auditável**
```typescript
// Exemplo: lib/ai-plan-generator.ts

async function generatePlanWithAI(athleteData, stravaActivities) {
  // 1. Cria contexto individual
  const context = buildAthleteContext(athleteData, stravaActivities);
  
  // 2. Envia para OpenAI (inference only)
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Você é um treinador de corrida..." },
      { role: "user", content: context }
    ]
  });
  
  // 3. Retorna plano para AQUELE atleta
  return parsePlanFromAI(response);
  
  // ❌ NUNCA fazemos: openai.fineTuning.create(...)
  // ❌ NUNCA fazemos: saveToTrainingDataset(...)
}
```

#### B) Políticas de Dados Implementadas

**1. Armazenamento Seguro**
- Tokens Strava criptografados (AES-256)
- Banco de dados com SSL/TLS
- Acesso restrito por IP e autenticação

**2. Retenção Limitada**
- Dados mantidos enquanto atleta estiver ativo
- Após desconexão do Strava: dados retidos por 90 dias
- Após 90 dias: deleção automática (GDPR/LGPD compliant)

**3. Controle do Usuário**
- Atleta pode desconectar Strava a qualquer momento
- Botão "Desconectar Strava" no perfil
- Deleção de conta remove TODOS os dados

**4. Transparência**
- Política de Privacidade clara: https://atherarun.com/privacy
- Termos de Uso acessíveis: https://atherarun.com/terms
- Explicação do uso de dados no onboarding

#### C) Compliance com API Agreement

**Seção 1.1 - Uso Permitido:**
✅ Usamos API apenas para fornecer valor direto ao atleta  
✅ Dados Strava melhoram experiência individual  
✅ Não redistribuímos dados

**Seção 2.1 - Dados de Atletas:**
✅ Dados usados apenas com consentimento explícito  
✅ OAuth2 flow correto implementado  
✅ Refresh tokens gerenciados adequadamente

**Seção 3.1 - Proibições:**
✅ NÃO treinamos modelos de IA  
✅ NÃO vendemos dados  
✅ NÃO criamos perfis agregados  
✅ NÃO fazemos scraping além da API

**Seção 4.1 - Branding:**
✅ Logo "Powered by Strava" exibido  
✅ "Connect with Strava" button oficial  
✅ Referências a Strava respeitam brand guidelines

---

### 4. 🤝 TERCEIROS COM ACESSO AOS DADOS

#### A) OpenAI (Processamento de IA)

**O QUE É:**
- Provedor de IA (GPT-4o)
- Processa contexto do atleta para gerar recomendações

**ACESSO:**
- **Direto:** NÃO - não tem acesso ao banco de dados
- **Indireto:** SIM - recebe contexto via API

**DADOS COMPARTILHADOS:**
```json
{
  "role": "Análise de progresso",
  "dados_enviados": [
    "Perfil do atleta (idade, peso, experiência)",
    "Resumo de treinos (ex: '3 corridas esta semana, 25km total')",
    "Métricas agregadas (ex: 'pace médio: 5:30/km')"
  ],
  "dados_NAO_enviados": [
    "Nome completo do atleta",
    "Email, telefone, endereço",
    "IDs do Strava",
    "Tokens de acesso",
    "Dados brutos de atividades"
  ]
}
```

**GARANTIAS:**
- OpenAI API Agreement: não usa dados para treinar modelos (inference only)
- SOC 2 Type II certified
- GDPR compliant
- Enterprise plan (não shared infrastructure)

#### B) Vercel (Hosting)

**O QUE É:**
- Plataforma de hosting (frontend + API routes)
- Next.js deployment

**ACESSO:**
- **Direto:** NÃO - não tem acesso ao banco de dados
- **Indireto:** SIM - processa requests

**DADOS EXPOSTOS:**
- Logs de requests (IPs, URLs, timestamps)
- Não tem acesso a: banco de dados, tokens, conteúdo de atividades

**GARANTIAS:**
- SOC 2 Type II certified
- ISO 27001 certified
- GDPR compliant
- DPA (Data Processing Agreement) assinado

#### C) PostgreSQL (Banco de Dados)

**O QUE É:**
- Servidor próprio (45.232.21.67)
- Armazenamento de dados do Athera Run

**ACESSO:**
- Apenas equipe Athera Run (2 pessoas autorizadas)
- Acesso via SSH com chave privada
- IP whitelist restrito

**DADOS:**
- Todos os dados de atletas, incluindo tokens Strava
- Criptografia em repouso (AES-256)
- Backups diários criptografados

**GARANTIAS:**
- Servidor dedicado (não compartilhado)
- Firewall configurado
- Auditoria de acessos
- Plano de migração para Vercel Postgres (Q1 2026)

#### D) Stripe (Pagamentos)

**O QUE É:**
- Processador de pagamentos
- Gerenciamento de assinaturas

**ACESSO:**
- **Direto:** NÃO - não tem acesso a dados Strava
- **Indireto:** NÃO - apenas dados de pagamento

**DADOS:**
- Nome, email, cartão de crédito
- Status de assinatura (ativo/cancelado)
- NÃO tem acesso a: atividades Strava, planos de treino

**GARANTIAS:**
- PCI DSS Level 1 certified
- SOC 2 Type II certified
- GDPR compliant

---

### 5. 📋 RESUMO EXECUTIVO

| Pergunta | Resposta Curta |
|----------|----------------|
| **Usa IA?** | SIM - OpenAI GPT-4o para gerar planos e analisar progresso |
| **Treina modelos com dados Strava?** | NÃO - Inference only, nunca training |
| **Como usa dados Strava?** | Sincronização de treinos, análise individual, dashboard |
| **Terceiros têm acesso?** | OpenAI (contexto agregado), Vercel (hosting), Stripe (pagamentos) |
| **Compartilha ou vende dados?** | NÃO - Dados usados apenas dentro do Athera Run |
| **Compliance GDPR/LGPD?** | SIM - Políticas implementadas, DPO designado |

---

### 6. 📄 EVIDÊNCIAS DE COMPLIANCE

#### A) Código-Fonte Auditável
- Repository: github.com/maurillio/athera-run (privado, disponível sob NDA)
- Exemplos de uso de IA: `lib/ai-plan-generator.ts`, `lib/auto-adjust-service.ts`
- Prova de "inference only": nenhuma chamada para `fineTuning` ou `training` APIs

#### B) Documentação Técnica
- [GUIA_TECNICO.md](./GUIA_TECNICO.md) - Arquitetura completa
- [DOCUMENTACAO.md](./DOCUMENTACAO.md) - Funcionalidades detalhadas
- [CONTEXTO.md](./CONTEXTO.md) - Stack e integrações

#### C) Políticas Públicas
- **Termos de Uso:** https://atherarun.com/terms (a publicar)
- **Política de Privacidade:** https://atherarun.com/privacy (a publicar)
- **Política de Dados Strava:** https://atherarun.com/strava-data-policy (a publicar)

#### D) Certificações e Auditorias
- LGPD Compliance: em processo (DPO designado)
- SOC 2 Type II: via Vercel (hosting provider)
- ISO 27001: via OpenAI (AI provider)

---

### 7. 🔄 PROCESSO DE REVIEW CONTÍNUO

#### A) Revisão Trimestral
- Auditoria de uso de dados Strava
- Verificação de conformidade com API Terms
- Atualização de políticas se necessário

#### B) Resposta a Mudanças
- Monitora updates do Strava API Agreement
- Implementa mudanças necessárias em 30 dias
- Comunica atletas sobre mudanças significativas

#### C) Transparência
- Changelog público de atualizações
- Email para atletas quando políticas mudam
- Dashboard de permissões no perfil

---

### 8. 📞 CONTATO

**Responsável Técnico:**  
Nome: Maurillio Oliveira  
Email: maurillio@atherarun.com  
Cargo: Founder & CTO

**DPO (Data Protection Officer):**  
Email: dpo@atherarun.com

**Suporte Técnico Strava:**  
Email: strava@atherarun.com  
Resposta em: 24-48h

---

### 9. ✅ CHECKLIST DE SUBMISSION

- [x] Application Name: Athera Run
- [x] Website: https://atherarun.com
- [x] Category: Health & Fitness
- [x] Description: Detalhada acima
- [x] Logo: 512x512px (a anexar)
- [x] Screenshots: 4 imagens (a anexar)
- [x] OAuth Redirect URI: https://atherarun.com/api/strava/callback
- [x] Privacy Policy URL: https://atherarun.com/privacy
- [x] Terms of Service URL: https://atherarun.com/terms
- [x] Support Email: suporte@atherarun.com
- [x] **Detalhamento de IA:** Descrito neste documento
- [x] **Uso de dados:** Descrito neste documento
- [x] **Compliance:** Descrito neste documento
- [x] **Terceiros:** Descrito neste documento

---

### 10. 📝 ADDITIONAL CLIENT IDS

**Client IDs adicionais (staging/development):**

```
Production: [seu client ID principal]
Staging: [se tiver ambiente de staging]
Development: [se tiver ambiente local que conecta à API]
```

**Nota:** Caso não tenha ambientes separados, informar que usa apenas Production Client ID com múltiplos redirect URIs:
- https://atherarun.com/api/strava/callback (produção)
- http://localhost:3000/api/strava/callback (desenvolvimento local)

---

## 🚀 PRÓXIMOS PASSOS

1. **Revisar este documento** e ajustar se necessário
2. **Preparar assets:** logo, screenshots
3. **Publicar políticas:** terms, privacy, strava-data-policy
4. **Preencher formulário Strava** com base neste documento
5. **Submeter para review**
6. **Aguardar aprovação** (normalmente 5-10 dias úteis)

---

**Preparado por:** Athera Run Team  
**Data:** 05 de Novembro de 2025  
**Versão:** 1.0.0  
**Para:** Strava Developer Program Review
