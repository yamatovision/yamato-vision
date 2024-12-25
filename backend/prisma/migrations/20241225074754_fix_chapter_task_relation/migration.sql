-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "excellentScore" INTEGER NOT NULL DEFAULT 95,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passingScore" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "timeLimit" INTEGER;

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "timeLimit" INTEGER,
    "waitTime" INTEGER,
    "initialWait" INTEGER,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isFinalExam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_taskId_key" ON "Chapter"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_courseId_orderIndex_key" ON "Chapter"("courseId", "orderIndex");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
