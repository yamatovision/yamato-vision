-- CreateTable
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

-- CreateTable
CREATE TABLE "LevelMessage" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LevelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenTracking_userId_key" ON "TokenTracking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LevelMessage_level_key" ON "LevelMessage"("level");

-- AddForeignKey
ALTER TABLE "TokenTracking" ADD CONSTRAINT "TokenTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
