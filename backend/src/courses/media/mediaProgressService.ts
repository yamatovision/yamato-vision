import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WATCH_RATE_THRESHOLD = 70; // 70%の視聴率閾値

export class MediaProgressService {
  async saveProgress(
    userId: string, 
    chapterId: string, 
    position: number, 
    duration: number,  // 追加: メディアの総再生時間
    deviceId?: string
  ) {
    // 視聴率の計算
    const watchRate = Math.min((position / duration) * 100, 100);

    const result = await prisma.$transaction(async (tx) => {
      // メディア進捗の更新
      const mediaProgress = await tx.userChapterMediaProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
        update: {
          position,
          deviceId,
          updatedAt: new Date(),
        },
        create: {
          userId,
          chapterId,
          position,
          deviceId,
        },
      });

      // チャプター進捗の視聴率を更新
      const chapterProgress = await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId: (await tx.chapter.findUnique({ 
              where: { id: chapterId },
              select: { courseId: true }
            }))!.courseId,
            chapterId,
          },
        },
        update: {
          lessonWatchRate: watchRate,
        },
        create: {
          userId,
          courseId: (await tx.chapter.findUnique({ 
            where: { id: chapterId },
            select: { courseId: true }
          }))!.courseId,
          chapterId,
          lessonWatchRate: watchRate,
          status: 'NOT_STARTED'
        },
      });

      // 視聴率が閾値未満の場合、certificationEligibilityを更新
      if (watchRate < WATCH_RATE_THRESHOLD) {
        await tx.userCourse.update({
          where: {
            userId_courseId: {
              userId,
              courseId: chapterProgress.courseId,
            },
          },
          data: {
            certificationEligibility: false,
          },
        });
      }

      return { mediaProgress, chapterProgress, watchRate };
    });

    return result;
  }

  async getProgress(userId: string, chapterId: string) {
    const progress = await prisma.userChapterMediaProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });
    return progress?.position || 0;
  }

  async getWatchRate(userId: string, chapterId: string) {
    const progress = await prisma.userChapterProgress.findFirst({
      where: {
        userId,
        chapterId,
      },
      select: {
        lessonWatchRate: true
      }
    });
    return progress?.lessonWatchRate || 0;
  }

  async resetProgress(userId: string, chapterId: string) {
    return  await prisma.$transaction(async (tx) => {
      // メディア進捗をリセット
      await tx.userChapterMediaProgress.delete({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
      }).catch(() => null);

      // チャプターの視聴率もリセット
      await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId: (await tx.chapter.findUnique({ 
              where: { id: chapterId },
              select: { courseId: true }
            }))!.courseId,
            chapterId,
          },
        },
        data: {
          lessonWatchRate: 0,
        },
      }).catch(() => null);
    });
  }
}

export const mediaProgressService = new MediaProgressService();
