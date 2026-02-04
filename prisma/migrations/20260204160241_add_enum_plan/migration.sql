/*
  Warnings:

  - Changed the type of `plan` on the `subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'pro');

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL;
