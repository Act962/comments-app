-- CreateTable
CREATE TABLE "comments_integration_consents" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scopes" TEXT[],
    "redirectUri" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_integration_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments_integration_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "secretCiphertext" TEXT NOT NULL,
    "scopes" TEXT[],
    "consentByUserId" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_integration_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comments_integration_consents_code_key" ON "comments_integration_consents"("code");

-- CreateIndex
CREATE INDEX "comments_integration_consents_code_idx" ON "comments_integration_consents"("code");

-- CreateIndex
CREATE INDEX "comments_integration_consents_expiresAt_idx" ON "comments_integration_consents"("expiresAt");

-- CreateIndex
CREATE INDEX "comments_integration_consents_userId_idx" ON "comments_integration_consents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "comments_integration_keys_apiKey_key" ON "comments_integration_keys"("apiKey");

-- CreateIndex
CREATE INDEX "comments_integration_keys_userId_idx" ON "comments_integration_keys"("userId");

-- CreateIndex
CREATE INDEX "comments_integration_keys_apiKey_idx" ON "comments_integration_keys"("apiKey");

-- AddForeignKey
ALTER TABLE "comments_integration_consents" ADD CONSTRAINT "comments_integration_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments_integration_keys" ADD CONSTRAINT "comments_integration_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
