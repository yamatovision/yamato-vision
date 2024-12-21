/*
  Warnings:

  - The values [OTAMESHI,TAIKEI,SHODEN,CHUDEN,OKUDEN,KAIDEN,ADMIN] on the enum `UserRank` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRank_new" AS ENUM ('お試し', '初伝', '中伝', '奥伝', '皆伝', '管理者', '退会者');
ALTER TABLE "User" ALTER COLUMN "rank" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "rank" TYPE "UserRank_new" USING ("rank"::text::"UserRank_new");
ALTER TYPE "UserRank" RENAME TO "UserRank_old";
ALTER TYPE "UserRank_new" RENAME TO "UserRank";
DROP TYPE "UserRank_old";
ALTER TABLE "User" ALTER COLUMN "rank" SET DEFAULT 'お試し';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "rank" SET DEFAULT 'お試し';
