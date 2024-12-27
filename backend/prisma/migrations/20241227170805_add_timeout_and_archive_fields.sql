-- タイムアウトと再購入のための機能追加
ALTER TABLE "UserChapterProgress"
ADD COLUMN "isTimedOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "timeOutAt" TIMESTAMP(3);

ALTER TABLE "UserCourse"
ADD COLUMN "isTimedOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "timeOutAt" TIMESTAMP(3),
ADD COLUMN "archiveUntil" TIMESTAMP(3),
ADD COLUMN "repurchasePrice" INTEGER;
