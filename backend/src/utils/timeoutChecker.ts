// backend/src/utils/timeoutChecker.ts
import { PrismaClient } from '@prisma/client';
import { timeoutService } from '../courses/timeouts/timeoutService';

const prisma = new PrismaClient();

export class TimeoutChecker {
  // 全コースのタイムアウトチェック（毎日実行）
  async checkAllCourseTimeouts() {
    try {
      console.log('Starting daily course timeout check...');
      
      // アクティブなコースを取得
      const activeCourses = await prisma.userCourse.findMany({
        where: {
          isActive: true,
          isTimedOut: false,
          startedAt: { not: null }
        },
        include: {
          course: true,
          user: true
        }
      });

      console.log(`Found ${activeCourses.length} active courses to check`);

      for (const userCourse of activeCourses) {
        await timeoutService.checkCourseTimeout(
          userCourse.userId,
          userCourse.courseId
        );
      }

      console.log('Course timeout check completed');
      return { success: true, checkedCount: activeCourses.length };
    } catch (error) {
      console.error('Error in course timeout check:', error);
      throw error;
    }
  }

  // キャッシュ付きのタイムアウトチェック（5分間キャッシュ）
  private timeoutCache = new Map<string, {
    result: boolean;
    timestamp: number;
  }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5分

  async checkTimeoutWithCache(
    userId: string,
    courseId: string,
    type: 'chapter' | 'course'
  ) {
    const cacheKey = `${type}_${userId}_${courseId}`;
    const cachedResult = this.timeoutCache.get(cacheKey);
    const now = Date.now();

    if (
      cachedResult && 
      now - cachedResult.timestamp < this.CACHE_DURATION
    ) {
      return cachedResult.result;
    }

    let isTimedOut: boolean;
    if (type === 'course') {
      const result = await timeoutService.checkCourseTimeout(userId, courseId);
      isTimedOut = result.isTimedOut;
    } else {
      // チャプターIDが必要な場合は追加のパラメータとして受け取る必要があります
      const userCourse = await prisma.userCourse.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        },
        include: {
          course: {
            include: {
              chapters: true
            }
          }
        }
      });

      const currentChapter = userCourse?.course.chapters[0]; // 現在のチャプターの取得ロジックは要調整
      if (currentChapter) {
        const result = await timeoutService.checkChapterTimeout(
          userId,
          courseId,
          currentChapter.id
        );
        isTimedOut = result.isTimedOut;
      } else {
        isTimedOut = false;
      }
    }

    this.timeoutCache.set(cacheKey, {
      result: isTimedOut,
      timestamp: now
    });

    return isTimedOut;
  }

  // キャッシュのクリア
  clearCache(userId: string, courseId: string) {
    const chapterKey = `chapter_${userId}_${courseId}`;
    const courseKey = `course_${userId}_${courseId}`;
    this.timeoutCache.delete(chapterKey);
    this.timeoutCache.delete(courseKey);
  }
}

export const timeoutChecker = new TimeoutChecker();