import { PrismaClient } from '@prisma/client';
import { TimeoutCheckResult } from './timeoutTypes';

const prisma = new PrismaClient();

export class TimeoutService {
  // チャプターのタイムアウトチェック
  async checkChapterTimeout(userId: string, courseId: string, chapterId: string): Promise<TimeoutCheckResult> {
    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId,
        }
      },
      include: {
        chapter: true
      }
    });

    if (!progress?.startedAt || !progress.chapter.timeLimit) {
      return { isTimedOut: false, type: null };
    }

    const now = new Date();
    const timeLimit = progress.chapter.timeLimit * 60 * 1000; // minutes to milliseconds
    const timeDiff = now.getTime() - progress.startedAt.getTime();

    if (timeDiff > timeLimit && !progress.isTimedOut) {
      // タイムアウト状態を記録
      await prisma.userChapterProgress.update({
        where: { id: progress.id },
        data: {
          isTimedOut: true,
          timeOutAt: now
        }
      });

      return {
        isTimedOut: true,
        type: 'chapter',
        message: 'チャプターの制限時間を超過しました。以降の提出は減点対象となります。'
      };
    }

    return { isTimedOut: false, type: 'chapter' };
  }

  // コース全体のタイムアウトチェック
  async checkCourseTimeout(userId: string, courseId: string): Promise<TimeoutCheckResult> {
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: true
      }
    });

    if (!userCourse?.startedAt || !userCourse.course.timeLimit) {
      return { isTimedOut: false, type: null };
    }

    const now = new Date();
    const timeLimit = userCourse.course.timeLimit * 60 * 1000; // minutes to milliseconds
    const timeDiff = now.getTime() - userCourse.startedAt.getTime();

    if (timeDiff > timeLimit && !userCourse.isTimedOut) {
      const repurchasePrice = Math.floor(userCourse.course.gemCost * 0.1); // 10分の1の価格

      // コースのタイムアウト状態を記録
      await prisma.userCourse.update({
        where: { id: userCourse.id },
        data: {
          isTimedOut: true,
          timeOutAt: now,
          status: 'repurchasable',
          isActive: false,    // この行を追加
          repurchasePrice
        }
      });

      return {
        isTimedOut: true,
        type: 'course',
        message: 'コースの期限が終了しました。再購入が必要です。'
      };
    }

    return { isTimedOut: false, type: 'course' };
  }

  // 残り時間の計算（秒単位）
  calculateRemainingTime(startTime: Date, timeLimit: number): number {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    return Math.max(0, timeLimit - Math.floor(timeDiff / 1000));
  }
}

export const timeoutService = new TimeoutService();
