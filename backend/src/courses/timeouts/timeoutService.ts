import { PrismaClient } from '@prisma/client';
import { TimeoutCheckResult, TimeCalculation, TimeWarningLevel } from './timeoutTypes';

const prisma = new PrismaClient();

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

export class TimeoutService {
  private static readonly MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

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
    // 時間単位での計算に変更
    const timeLimit = progress.chapter.timeLimit * MILLISECONDS_PER_HOUR;
    const timeDiff = now.getTime() - progress.startedAt.getTime();

    if (timeDiff > timeLimit && !progress.isTimedOut) {
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
    // 時間単位での計算に変更
    const timeLimit = userCourse.course.timeLimit * MILLISECONDS_PER_HOUR;
    const timeDiff = now.getTime() - userCourse.startedAt.getTime();

    if (timeDiff > timeLimit && !userCourse.isTimedOut) {
      await prisma.userCourse.update({
        where: { id: userCourse.id },
        data: {
          isTimedOut: true,
          timeOutAt: now,
          status: 'FAILED',
          isActive: false,
          certificationEligibility: false
        }
      });

      return {
        isTimedOut: true,
        type: 'course',
        message: 'コースの期限が終了しました。'
      };
    }

    return { isTimedOut: false, type: 'course' };
  }

  calculateRemainingTime(startTime: Date, timeLimit: number): number {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    // 時間単位での計算に変更
    return Math.max(0, Math.floor(timeLimit - (timeDiff / MILLISECONDS_PER_HOUR)));
  }

  calculateRemainingTimeDetailed(startTime: Date, timeLimit: number): TimeCalculation {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    // 時間単位での計算に変更
    const remainingMs = Math.max(0, (timeLimit * MILLISECONDS_PER_HOUR) - timeDiff);
    
    const days = Math.floor(remainingMs / (24 * MILLISECONDS_PER_HOUR));
    const hours = Math.floor((remainingMs % (24 * MILLISECONDS_PER_HOUR)) / MILLISECONDS_PER_HOUR);
    const minutes = Math.floor((remainingMs % MILLISECONDS_PER_HOUR) / (60 * 1000));
    const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalHours: timeLimit,
      timeOutAt: this.calculateTimeOutDate(startTime, timeLimit).toISOString()
    };
  }

  calculateTimeOutDate(startDate: Date, timeLimit: number): Date {
    const timeOutDate = new Date(startDate);
    // 時間単位での計算に変更
    timeOutDate.setHours(timeOutDate.getHours() + timeLimit);
    return timeOutDate;
  }

  getWarningLevel(remainingTime: TimeCalculation): TimeWarningLevel {
    const totalHours = (remainingTime.days * 24) + remainingTime.hours;
    
    if (totalHours <= 6) return 'danger';
    if (totalHours <= 24) return 'warning';
    return 'none';
  }

  formatTimeDisplay(timeCalc: TimeCalculation): string {
    if (timeCalc.days > 0) {
      return `${timeCalc.days}日 ${timeCalc.hours.toString().padStart(2, '0')}時間`;
    }
    if (timeCalc.hours > 0) {
      return `${timeCalc.hours}時間 ${timeCalc.minutes.toString().padStart(2, '0')}分`;
    }
    return `${timeCalc.minutes}分 ${timeCalc.seconds.toString().padStart(2, '0')}秒`;
  }
}

export const timeoutService = new TimeoutService();