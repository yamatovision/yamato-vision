-- waitTimeとinitialWaitを削除し、releaseTimeを追加
ALTER TABLE "Chapter" DROP COLUMN IF EXISTS "waitTime";
ALTER TABLE "Chapter" DROP COLUMN IF EXISTS "initialWait";
ALTER TABLE "Chapter" ADD COLUMN "releaseTime" INTEGER;

-- 既存のinitialWaitデータをreleaseTimeに移行
UPDATE "Chapter" 
SET "releaseTime" = "initialWait"
WHERE "initialWait" IS NOT NULL;
