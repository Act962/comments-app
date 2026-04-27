-- CreateEnum
CREATE TYPE "SORTEIO_STATUS" AS ENUM ('DRAFT', 'COLLECTING', 'CLOSED', 'DRAWN');

-- CreateTable
CREATE TABLE "sorteio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Sem título',
    "prizeName" TEXT,
    "prizeDescription" TEXT,
    "prizeImage" TEXT,
    "winnersCount" INTEGER NOT NULL DEFAULT 1,
    "status" "SORTEIO_STATUS" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT NOT NULL,
    "lastDrawnAt" TIMESTAMP(3),
    "rules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sorteio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteio_post" (
    "id" TEXT NOT NULL,
    "sorteioId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "caption" TEXT,
    "media" TEXT NOT NULL,
    "mediaType" "MEDIA_TYPE" NOT NULL DEFAULT 'IMAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sorteio_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteio_comment" (
    "id" TEXT NOT NULL,
    "sorteioId" TEXT NOT NULL,
    "sorteioPostId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "fromUsername" TEXT,
    "text" TEXT NOT NULL,
    "commentedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sorteio_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteio_winner" (
    "id" TEXT NOT NULL,
    "sorteioId" TEXT NOT NULL,
    "sorteioCommentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "drawnAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sorteio_winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_slug_key" ON "sorteio"("slug");

-- CreateIndex
CREATE INDEX "sorteio_userId_idx" ON "sorteio"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_post_sorteioId_postId_key" ON "sorteio_post"("sorteioId", "postId");

-- CreateIndex
CREATE INDEX "sorteio_comment_sorteioId_fromId_idx" ON "sorteio_comment"("sorteioId", "fromId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_comment_sorteioId_commentId_key" ON "sorteio_comment"("sorteioId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_winner_sorteioCommentId_key" ON "sorteio_winner"("sorteioCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_winner_sorteioId_sorteioCommentId_key" ON "sorteio_winner"("sorteioId", "sorteioCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "sorteio_winner_sorteioId_position_key" ON "sorteio_winner"("sorteioId", "position");

-- AddForeignKey
ALTER TABLE "sorteio" ADD CONSTRAINT "sorteio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio_post" ADD CONSTRAINT "sorteio_post_sorteioId_fkey" FOREIGN KEY ("sorteioId") REFERENCES "sorteio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio_comment" ADD CONSTRAINT "sorteio_comment_sorteioId_fkey" FOREIGN KEY ("sorteioId") REFERENCES "sorteio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio_comment" ADD CONSTRAINT "sorteio_comment_sorteioPostId_fkey" FOREIGN KEY ("sorteioPostId") REFERENCES "sorteio_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio_winner" ADD CONSTRAINT "sorteio_winner_sorteioId_fkey" FOREIGN KEY ("sorteioId") REFERENCES "sorteio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sorteio_winner" ADD CONSTRAINT "sorteio_winner_sorteioCommentId_fkey" FOREIGN KEY ("sorteioCommentId") REFERENCES "sorteio_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
