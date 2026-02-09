/*
  Warnings:

  - The values [CAROSEL_ALBUM] on the enum `MEDIA_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MEDIA_TYPE_new" AS ENUM ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM');
ALTER TABLE "public"."Post" ALTER COLUMN "mediaType" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "mediaType" TYPE "MEDIA_TYPE_new" USING ("mediaType"::text::"MEDIA_TYPE_new");
ALTER TYPE "MEDIA_TYPE" RENAME TO "MEDIA_TYPE_old";
ALTER TYPE "MEDIA_TYPE_new" RENAME TO "MEDIA_TYPE";
DROP TYPE "public"."MEDIA_TYPE_old";
ALTER TABLE "Post" ALTER COLUMN "mediaType" SET DEFAULT 'IMAGE';
COMMIT;
