-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'NEEDS_RECONNECT');

-- AlterTable
ALTER TABLE "integration" ADD COLUMN     "lastRefreshError" TEXT,
ADD COLUMN     "lastRefreshedAt" TIMESTAMP(3),
ADD COLUMN     "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE';
