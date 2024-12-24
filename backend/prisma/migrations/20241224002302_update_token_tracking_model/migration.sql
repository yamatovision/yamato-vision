-- AlterTable
ALTER TABLE "TokenTracking" ADD COLUMN     "purchasedTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklyLimit" INTEGER NOT NULL DEFAULT 0;
