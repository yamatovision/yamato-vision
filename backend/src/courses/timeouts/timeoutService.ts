import { PrismaClient } from '@prisma/client';
import { TimeoutCheckResult } from './timeoutTypes';

const prisma = new PrismaClient();

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

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
    // 日数をミリ秒に変換
    const timeLimit = progress.chapter.timeLimit * MILLISECONDS_PER_DAY;
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
    // 日数をミリ秒に変換
    const timeLimit = userCourse.course.timeLimit * MILLISECONDS_PER_DAY;
    const timeDiff = now.getTime() - userCourse.startedAt.getTime();

    if (timeDiff > timeLimit && !userCourse.isTimedOut) {
      const repurchasePrice = Math.floor(userCourse.course.gemCost * 0.1);

      // コースのタイムアウト状態を記録
      await prisma.userCourse.update({
        where: { id: userCourse.id },
        data: {
          isTimedOut: true,
          timeOutAt: now,
          status: 'repurchasable',
          isActive: false,
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

  // 残り時間の計算（日単位）
  calculateRemainingTime(startTime: Date, timeLimit: number): number {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    // ミリ秒を日数に変換（小数点以下を切り捨て）
    return Math.max(0, Math.floor(timeLimit - (timeDiff / MILLISECONDS_PER_DAY)));
  }

  // 残り時間の詳細計算（日、時間、分）
  calculateRemainingTimeDetailed(startTime: Date, timeLimit: number) {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    const remainingMs = Math.max(0, (timeLimit * MILLISECONDS_PER_DAY) - timeDiff);
    
    const days = Math.floor(remainingMs / MILLISECONDS_PER_DAY);
    const hours = Math.floor((remainingMs % MILLISECONDS_PER_DAY) / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    return {
      days,
      hours,
      minutes,
      totalDays: days + (hours / 24) + (minutes / (24 * 60))
    };
  }

  // タイムアウト日時の計算
  calculateTimeOutDate(startDate: Date, timeLimit: number): Date {
    const timeOutDate = new Date(startDate);
    timeOutDate.setDate(timeOutDate.getDate() + timeLimit);
    return timeOutDate;
  }
}

export const timeoutService = new TimeoutService();