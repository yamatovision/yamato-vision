/*
  Warnings:

  - Changed the type of `missionType` on the `Mission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('DAILY', 'MONTHLY', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "MissionConditionType" AS ENUM ('REPORT', 'COMMENT', 'LIKE', 'TASK_COMPLETE', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "MissionReward" DROP CONSTRAINT "MissionReward_missionId_fkey";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "missionType",
ADD COLUMN     "missionType" "MissionType" NOT NULL;

-- CreateIndex
CREATE INDEX "Mission_missionType_idx" ON "Mission"("missionType");

-- CreateIndex
CREATE INDEX "Mission_isActive_idx" ON "Mission"("isActive");

-- CreateIndex
CREATE INDEX "MissionReward_missionId_idx" ON "MissionReward"("missionId");

-- AddForeignKey
ALTER TABLE "MissionReward" ADD CONSTRAINT "MissionReward_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
