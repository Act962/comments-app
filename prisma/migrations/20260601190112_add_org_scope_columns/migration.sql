-- AlterTable
ALTER TABLE "automation" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "comments_integration_consents" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "comments_integration_keys" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "history" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "integration" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "sorteio" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "automation_organizationId_idx" ON "automation"("organizationId");

-- CreateIndex
CREATE INDEX "comments_integration_consents_organizationId_idx" ON "comments_integration_consents"("organizationId");

-- CreateIndex
CREATE INDEX "comments_integration_keys_organizationId_idx" ON "comments_integration_keys"("organizationId");

-- CreateIndex
CREATE INDEX "history_organizationId_date_idx" ON "history"("organizationId", "date");

-- CreateIndex
CREATE INDEX "integration_organizationId_idx" ON "integration"("organizationId");

-- CreateIndex
CREATE INDEX "notification_organizationId_createdAt_idx" ON "notification"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "sorteio_organizationId_idx" ON "sorteio"("organizationId");

-- AddForeignKey
ALTER TABLE "comments_integration_consents" ADD CONSTRAINT "comments_integration_consents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments_integration_keys" ADD CONSTRAINT "comments_integration_keys_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration" ADD CONSTRAINT "integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation" ADD CONSTRAINT "automation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio" ADD CONSTRAINT "sorteio_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
