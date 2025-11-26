# 🚀 DEPLOY v3.2.1 - INSTRUÇÕES FINAIS

**Status:** ✅ Código enviado para GitHub  
**Vercel:** 🔄 Deploy automático iniciado  
**Próximo passo:** ⚠️ MIGRATION NO NEON

---

## 📋 PASSO A PASSO

### 1️⃣ APLICAR MIGRATION NO NEON (OBRIGATÓRIO)

**⚠️ FAZER ANTES DE USAR A APLICAÇÃO**

1. Abrir: https://console.neon.tech
2. Selecionar projeto: `atherarun`
3. Ir em: **SQL Editor**
4. Copiar todo o conteúdo de: `MIGRATION_v3_2_1_STRAVA_COMPLETE.sql`
5. Colar no editor
6. Clicar: **Run**
7. Verificar resultado:
   ```
   ✅ Deve retornar 4 linhas:
   - athlete_profiles | strava_zones | jsonb | YES
   - athlete_profiles | strava_profile_data | jsonb | YES
   - strava_gear | converted_distance | character varying | YES
   - strava_gear | notification_distance | double precision | YES
   ```

### 2️⃣ VERIFICAR DEPLOY NO VERCEL

1. Abrir: https://vercel.com/maurillios-projects/athera-run
2. Aguardar build completar
3. Status esperado: ✅ **Ready**
4. URL: https://atherarun.com

### 3️⃣ TESTAR EM PRODUÇÃO

**Cenário 1: Usuário Premium com Strava**
```bash
1. Logar em https://atherarun.com
2. Ir em: Perfil → Strava
3. Clicar: "Sincronizar Dados"
4. Verificar resposta:
   {
     "success": true,
     "results": {
       "stats": { "success": true },
       "prs": { "success": true },
       "gear": { "success": true },
       "zones": { "success": true } // ← NOVO!
     }
   }
```

**Cenário 2: Testar API de Zonas**
```bash
curl -X GET https://atherarun.com/api/strava/zones \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# Resposta esperada:
{
  "success": true,
  "heartRateZones": { ... },
  "paceZones": { ... },
  "profileData": { ... }
}
```

### 4️⃣ VALIDAR NO BANCO (Opcional)

**Neon SQL Editor:**
```sql
-- Verificar dados importados
SELECT 
  id,
  strava_connected,
  strava_zones IS NOT NULL as tem_zonas,
  strava_profile_data IS NOT NULL as tem_perfil
FROM athlete_profiles
WHERE strava_connected = true
LIMIT 5;

-- Verificar gear
SELECT 
  name,
  distance,
  converted_distance,
  notification_distance
FROM strava_gear
LIMIT 5;
```

---

## ✅ CHECKLIST COMPLETO

- [x] Código commitado
- [x] Push para GitHub
- [ ] **Migration aplicada no Neon** ⚠️
- [ ] **Deploy completo no Vercel**
- [ ] Testado em produção
- [ ] Validado no banco

---

## 📊 O QUE FOI IMPLEMENTADO

### Novos Recursos (v3.2.1)

1. **Zonas de Treino**
   - ✅ Importa zonas de FC do Strava
   - ✅ Calcula zonas de pace baseadas em PRs
   - ✅ API: `/api/strava/zones`

2. **Perfil Completo**
   - ✅ Peso, sexo, cidade, país
   - ✅ FTP, premium status
   - ✅ Followers, amigos

3. **Equipamentos Detalhados**
   - ✅ Distância convertida
   - ✅ Alertas de km para troca

4. **Sincronização Completa**
   - ✅ Stats + PRs + Gear + Zones
   - ✅ 1 botão para tudo

### Arquivos Criados
- `lib/strava-zones.ts`
- `app/api/strava/zones/route.ts`
- `MIGRATION_v3_2_1_STRAVA_COMPLETE.sql`

### Arquivos Modificados
- `lib/strava-stats.ts`
- `lib/strava-gear.ts`
- `app/api/strava/sync-all/route.ts`
- `prisma/schema.prisma`
- `package.json` (v3.2.1)

---

## 🐛 TROUBLESHOOTING

### Erro: "Column does not exist"
**Causa:** Migration não aplicada  
**Solução:** Aplicar `MIGRATION_v3_2_1_STRAVA_COMPLETE.sql` no Neon

### Erro: "Strava não conectado"
**Causa:** Usuário não tem Strava vinculado  
**Solução:** Ir em Perfil → Conectar Strava

### Erro: "Recurso Premium"
**Causa:** Usuário free tentando usar zonas  
**Solução:** Upgrade para Premium ou usar entrada manual

---

## 📞 SUPORTE

**Documentação completa:** `STRAVA_v3_2_1_COMPLETE_FINAL.md`  
**Migration SQL:** `MIGRATION_v3_2_1_STRAVA_COMPLETE.sql`  
**Build log:** `/tmp/build_strava_zones.log`

---

## 🎉 RESUMO

✅ **Código pronto**  
✅ **Build passou**  
✅ **Push concluído**  
⚠️ **AGUARDANDO: Migration no Neon**  
🚀 **ENTÃO: Sistema 100% operacional**

---

**Próxima ação:** Aplicar migration no Neon! 🎯
