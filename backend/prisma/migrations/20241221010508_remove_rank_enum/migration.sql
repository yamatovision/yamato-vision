/*
  Warnings:

  - The `rank` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "rank",
ADD COLUMN     "rank" TEXT NOT NULL DEFAULT 'お試し';

-- DropEnum
DROP TYPE "UserRank";
