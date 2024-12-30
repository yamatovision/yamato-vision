-- CreateTable
CREATE TABLE "UserChapterMediaProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "deviceId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChapterMediaProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChapterMediaProgress_userId_chapterId_key" ON "UserChapterMediaProgress"("userId", "chapterId");

-- AddForeignKey
ALTER TABLE "UserChapterMediaProgress" ADD CONSTRAINT "UserChapterMediaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChapterMediaProgress" ADD CONSTRAINT "UserChapterMediaProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
