-- TokenTracking テーブルの追加
CREATE TABLE "TokenTracking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyTokens" INTEGER NOT NULL DEFAULT 0,
    "unprocessedTokens" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenTracking_pkey" PRIMARY KEY ("id")
);

-- インデックスの追加
CREATE UNIQUE INDEX "TokenTracking_userId_key" ON "TokenTracking"("userId");

-- 外部キー制約の追加
ALTER TABLE "TokenTracking" ADD CONSTRAINT "TokenTracking_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
