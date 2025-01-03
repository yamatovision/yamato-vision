import { PrismaClient } from '@prisma/client';
import { TimeoutCheckResult, TimeCalculation, TimeWarningLevel } from './timeoutTypes';

const prisma = new PrismaClient();

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_MINUTE = 60 * 1000;

export class TimeoutService {
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
    const timeLimit = progress.chapter.timeLimit * MILLISECONDS_PER_DAY;
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
    const timeLimit = userCourse.course.timeLimit * MILLISECONDS_PER_DAY;
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
    return Math.max(0, Math.floor(timeLimit - (timeDiff / MILLISECONDS_PER_DAY)));
  }

  calculateRemainingTimeDetailed(startTime: Date, timeLimit: number): TimeCalculation {
    const now = new Date();
    const timeDiff = now.getTime() - startTime.getTime();
    const remainingMs = Math.max(0, (timeLimit * MILLISECONDS_PER_DAY) - timeDiff);
    
    const days = Math.floor(remainingMs / MILLISECONDS_PER_DAY);
    const hours = Math.floor((remainingMs % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR);
    const minutes = Math.floor((remainingMs % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
    const seconds = Math.floor((remainingMs % MILLISECONDS_PER_MINUTE) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      totalDays: days + (hours / 24) + (minutes / (24 * 60)),
      timeOutAt: this.calculateTimeOutDate(startTime, timeLimit).toISOString()
    };
  }

  calculateTimeOutDate(startDate: Date, timeLimit: number): Date {
    const timeOutDate = new Date(startDate);
    timeOutDate.setDate(timeOutDate.getDate() + timeLimit);
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
      return `${timeCalc.days}日 ${timeCalc.hours.toString().padStart(2, '0')}:${timeCalc.minutes.toString().padStart(2, '0')}`;
    }
    return `${timeCalc.hours.toString().padStart(2, '0')}:${timeCalc.minutes.toString().padStart(2, '0')}:${timeCalc.seconds.toString().padStart(2, '0')}`;
  }
}

export const timeoutService = new TimeoutService();