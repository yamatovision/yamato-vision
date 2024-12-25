-- CreateTable
ALTER TABLE "Course" ADD COLUMN "thumbnail" TEXT;
ALTER TABLE "Course" ADD COLUMN "timeLimit" INTEGER;
ALTER TABLE "Course" ADD COLUMN "passingScore" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Course" ADD COLUMN "excellentScore" INTEGER NOT NULL DEFAULT 95;
ALTER TABLE "Course" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Course" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "timeLimit" INTEGER,
    "waitTime" INTEGER,
    "initialWait" INTEGER,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFinalExam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "chapterId" TEXT;
ALTER TABLE "Task" ADD COLUMN "systemMessage" TEXT;
ALTER TABLE "Task" ADD COLUMN "referenceText" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_courseId_orderIndex_key" ON "Chapter"("courseId", "orderIndex");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
