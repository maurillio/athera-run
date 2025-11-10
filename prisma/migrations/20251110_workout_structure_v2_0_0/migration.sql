-- Sistema Avançado de Apresentação de Treinos v2.0.0
-- Adiciona estrutura detalhada e enriquecimento educacional aos workouts

-- Adicionar novos campos de estrutura detalhada
ALTER TABLE "custom_workouts" 
  ADD COLUMN IF NOT EXISTS "warmUpStructure" JSONB,
  ADD COLUMN IF NOT EXISTS "mainWorkoutStruct" JSONB,
  ADD COLUMN IF NOT EXISTS "coolDownStructure" JSONB;

-- Adicionar campos de enriquecimento educacional
ALTER TABLE "custom_workouts"
  ADD COLUMN IF NOT EXISTS "objective" TEXT,
  ADD COLUMN IF NOT EXISTS "scientificBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "tips" JSONB,
  ADD COLUMN IF NOT EXISTS "commonMistakes" JSONB,
  ADD COLUMN IF NOT EXISTS "successCriteria" JSONB;

-- Adicionar métricas avançadas
ALTER TABLE "custom_workouts"
  ADD COLUMN IF NOT EXISTS "intensityLevel" INTEGER CHECK ("intensityLevel" >= 1 AND "intensityLevel" <= 5),
  ADD COLUMN IF NOT EXISTS "expectedRPE" INTEGER CHECK ("expectedRPE" >= 1 AND "expectedRPE" <= 10),
  ADD COLUMN IF NOT EXISTS "heartRateZones" JSONB,
  ADD COLUMN IF NOT EXISTS "intervals" JSONB,
  ADD COLUMN IF NOT EXISTS "expectedDuration" INTEGER;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "custom_workouts_intensity_idx" ON "custom_workouts"("intensityLevel");
CREATE INDEX IF NOT EXISTS "custom_workouts_type_idx" ON "custom_workouts"("type");
CREATE INDEX IF NOT EXISTS "custom_workouts_date_idx" ON "custom_workouts"("date");

-- Comentários de documentação
COMMENT ON COLUMN "custom_workouts"."warmUpStructure" IS 'Estrutura detalhada do aquecimento (fase 1) em JSON';
COMMENT ON COLUMN "custom_workouts"."mainWorkoutStruct" IS 'Estrutura detalhada da parte principal (fase 2) em JSON';
COMMENT ON COLUMN "custom_workouts"."coolDownStructure" IS 'Estrutura detalhada do desaquecimento (fase 3) em JSON';
COMMENT ON COLUMN "custom_workouts"."objective" IS 'Objetivo fisiológico do treino';
COMMENT ON COLUMN "custom_workouts"."scientificBasis" IS 'Fundamento científico que embasa o treino';
COMMENT ON COLUMN "custom_workouts"."tips" IS 'Array de dicas práticas em JSON';
COMMENT ON COLUMN "custom_workouts"."commonMistakes" IS 'Erros comuns a evitar em JSON';
COMMENT ON COLUMN "custom_workouts"."successCriteria" IS 'Critérios de sucesso em JSON';
COMMENT ON COLUMN "custom_workouts"."intensityLevel" IS 'Nível de intensidade (1=Muito Leve, 5=Muito Intenso)';
COMMENT ON COLUMN "custom_workouts"."expectedRPE" IS 'Rate of Perceived Exertion esperado (1-10)';
COMMENT ON COLUMN "custom_workouts"."heartRateZones" IS 'Zonas de frequência cardíaca por fase em JSON';
COMMENT ON COLUMN "custom_workouts"."intervals" IS 'Estrutura de intervalos se aplicável em JSON';
COMMENT ON COLUMN "custom_workouts"."expectedDuration" IS 'Duração total esperada em minutos';
