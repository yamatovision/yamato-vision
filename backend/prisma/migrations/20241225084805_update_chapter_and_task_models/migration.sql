/*
  Warnings:

  - You are about to drop the column `initialWait` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `waitTime` on the `Chapter` table. All the data in the column will be lost.
  - You are about to drop the column `timeLimit` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Task` table. All the data in the column will be lost.
  - Added the required column `content` to the `Chapter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemMessage` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chapter" DROP COLUMN "initialWait",
DROP COLUMN "waitTime",
ADD COLUMN     "releaseTime" INTEGER,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "timeLimit",
DROP COLUMN "type",
ADD COLUMN     "referenceText" TEXT,
ADD COLUMN     "systemMessage" TEXT NOT NULL,
ALTER COLUMN "maxPoints" SET DEFAULT 100;
