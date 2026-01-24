-- CreateEnum
CREATE TYPE "INTEGRATIONS" AS ENUM ('INSTAGRAM');

-- CreateEnum
CREATE TYPE "MEDIA_TYPE" AS ENUM ('IMAGE', 'VIDEO', 'CAROSEL_ALBUM');

-- CreateEnum
CREATE TYPE "LISTENERS" AS ENUM ('SMARTAI', 'MESSAGE');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration" (
    "id" TEXT NOT NULL,
    "name" "INTEGRATIONS" NOT NULL DEFAULT 'INSTAGRAM',
    "token" TEXT NOT NULL,
    "instagramId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Sem título',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dms" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "recieverId" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "automationId" TEXT,

    CONSTRAINT "Dms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "caption" TEXT,
    "media" TEXT NOT NULL,
    "mediaType" "MEDIA_TYPE" NOT NULL DEFAULT 'IMAGE',
    "automationId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listerner" (
    "id" TEXT NOT NULL,
    "automationId" TEXT,
    "listener" "LISTENERS" NOT NULL DEFAULT 'MESSAGE',
    "prompt" TEXT NOT NULL,
    "commentReply" TEXT,
    "dmCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Listerner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "automationId" TEXT,

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "automationId" TEXT,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "integration_token_key" ON "integration"("token");

-- CreateIndex
CREATE UNIQUE INDEX "integration_instagramId_key" ON "integration"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "Listerner_automationId_key" ON "Listerner"("automationId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_automationId_word_key" ON "Keyword"("automationId", "word");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration" ADD CONSTRAINT "integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation" ADD CONSTRAINT "automation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dms" ADD CONSTRAINT "Dms_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listerner" ADD CONSTRAINT "Listerner_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
