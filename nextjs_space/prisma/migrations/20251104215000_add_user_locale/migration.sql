-- AlterTable
ALTER TABLE "users" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'pt-BR';

-- CreateIndex
CREATE INDEX "users_locale_idx" ON "users"("locale");
