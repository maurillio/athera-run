# 🧪 Como Testar o Hotfix v3.2.17

**Deploy Status:** ✅ Completado  
**Aguardar:** 2-3 minutos para propagação  
**Versão:** v3.2.17

---

## 📋 Passo a Passo

### 1. **Aguardar Deploy Propagar**
⏱️ Aguarde **2-3 minutos** após este commit (53fb6dad)

### 2. **Fazer Logout/Login**
1. Acesse: https://atherarun.com
2. Faça logout
3. Faça login novamente com: `mmaurillio2@gmail.com`

### 3. **Abrir DevTools Console**
1. Pressione **F12** (ou Cmd+Opt+I no Mac)
2. Vá para aba **Console**
3. **NÃO FECHE** esta aba

### 4. **Ir para Perfil**
1. Clique no menu superior
2. Vá para **Perfil**
3. Aguarde a página carregar

### 5. **Observar Console**
Você deve ver logs assim:

```
[SYNC] Session: { hasSession: true, userId: "...", email: "mmaurillio2@gmail.com" }
[SYNC] Profile found: { hasProfile: true, hasStrava: true, hasPlan: true }
[SYNC] Searching for workouts after: 2025-11-25T...
[SYNC] Found planned workouts: X
[SYNC] Fetching Strava activities...
[SYNC] Strava API response status: 200
[SYNC] Fetched Strava activities: Y
[SYNC] ✅ Workout abc marcado como completo (Strava ID: 123456)
[SYNC] Sync complete: X/Y workouts synced
```

---

## ✅ Cenários Possíveis

### Cenário 1: **SUCESSO** ✅
**Console mostra:**
```
POST /api/workouts/sync-strava 200 (OK)
```

**E vê logs:**
```
[SYNC] Sync complete: 2/3 workouts synced
```

**Ação:** ✅ PROBLEMA RESOLVIDO! Treinos sincronizados.

---

### Cenário 2: **ERRO 500 PERSISTE** ❌
**Console mostra:**
```
POST /api/workouts/sync-strava 500 (Internal Server Error)
```

**Mas VÊ logs [SYNC]**

**Ação:** 
1. ✅ Copie TODOS os logs `[SYNC]`
2. ✅ Procure o ÚLTIMO log antes do erro
3. ✅ Me envie os logs
4. 🔧 Identificaremos a causa exata

**Exemplo:**
```
[SYNC] Session: { ... }
[SYNC] Profile found: { ... }
[SYNC] Searching for workouts after: ...
[SYNC] Database error finding workouts: PrismaClientKnownRequestError
    ☝️ AQUI ESTÁ O PROBLEMA!
```

---

### Cenário 3: **SEM LOGS [SYNC]** ⚠️
**Console NÃO mostra nenhum `[SYNC]`**

**Ação:**
1. ⏱️ Aguarde mais 2 minutos (deploy ainda propagando)
2. 🔄 Faça **hard refresh**: Ctrl+Shift+R (Cmd+Shift+R no Mac)
3. 🔄 Tente novamente

---

## �� Verificar Logs no Vercel (Opcional)

Se quiser ver os logs do servidor:

1. Acesse: https://vercel.com/maurillio/athera-run/logs
2. Filtre por: `[SYNC]`
3. Veja os logs completos do servidor

---

## 📸 O Que Enviar (Se Erro Persistir)

### 1. Screenshot do Console
Mostre todos os logs `[SYNC]` + o erro 500

### 2. Cópia dos Logs
Copie e cole TODOS os logs que aparecerem:
```
[SYNC] Session: ...
[SYNC] Profile found: ...
[SYNC] ...
```

### 3. Horário do Teste
Ex: "Testei às 15:45 horário de Brasília"

---

## ⏱️ Timeline

| Horário | Ação |
|---------|------|
| 12:45 UTC | Deploy iniciado (commit a016c005) |
| 12:47 UTC | Deploy completado |
| 12:50 UTC | ✅ Sistema propagado e pronto |

**Teste após 12:50 UTC = 09:50 horário de Brasília**

---

## 🎯 Resumo

1. Aguarde 2-3 min
2. Faça logout/login
3. Abra DevTools Console (F12)
4. Vá para Perfil
5. Observe logs `[SYNC]`
6. Copie e envie se erro persistir

---

**Status:** 🟡 AGUARDANDO SEU TESTE  
**Próxima Ação:** Testar em https://atherarun.com
