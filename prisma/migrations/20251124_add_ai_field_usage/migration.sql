-- CreateTable
-- v2.8.0 - AI Transparency System
CREATE TABLE "ai_field_usage" (
    "id" TEXT NOT NULL,
    "planId" INTEGER,
    "userId" TEXT NOT NULL,
    "fieldName" VARCHAR(100) NOT NULL,
    "fieldValue" TEXT,
    "wasUsed" BOOLEAN NOT NULL DEFAULT false,
    "importance" VARCHAR(20),
    "howUsed" TEXT,
    "impact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_field_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_field_usage_planId_idx" ON "ai_field_usage"("planId");

-- CreateIndex
CREATE INDEX "ai_field_usage_userId_idx" ON "ai_field_usage"("userId");

-- CreateIndex
CREATE INDEX "ai_field_usage_fieldName_idx" ON "ai_field_usage"("fieldName");
