-- CreateTable
CREATE TABLE "MessageButton" (
    "id" TEXT NOT NULL,
    "listenerId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "MessageButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageButton_listenerId_idx" ON "MessageButton"("listenerId");

-- AddForeignKey
ALTER TABLE "MessageButton" ADD CONSTRAINT "MessageButton_listenerId_fkey" FOREIGN KEY ("listenerId") REFERENCES "Listerner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
