import { PrismaClient } from '@prisma/client';
import { CourseStatus } from '../courseTypes';  // 定数をインポート

import { 
  CourseWithStatus, 
  USER_RANKS, 
  UserRank,
} from './userCourseTypes';
import { timeoutService } from '../timeouts/timeoutService';

const prisma = new PrismaClient();

export class UserCourseService {
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rank: true,
        courses: {
          select: { 
            courseId: true,
            isActive: true,
            isTimedOut: true,
            status: true,
            certificationEligibility: true
          }
        }
      }
    });

    if (!user || user.rank === '退会者') {
      return [];
    }

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false,
      },
      include: {
        chapters: true,
      },
    });

    return courses.map(course => {
      const userCourse = user.courses.find(uc => uc.courseId === course.id);
      
      let status: CourseStatus;
      if (userCourse) {
        if (userCourse.isTimedOut) {
          status = CourseStatus.FAILED;  // 定数を使用
        } else {
          status = userCourse.status as CourseStatus;
        }
      } else if (this.checkCourseRequirements(user, course)) {
        status = CourseStatus.AVAILABLE;
      } else {
        status = CourseStatus.RESTRICTED;
      }
            

      return {
        ...course,
        status,
      };
    });
  }

  private checkCourseRequirements(
    user: { level: number; rank: string },
    course: { levelRequired?: number | null; rankRequired?: string | null; requirementType: string }
  ): boolean {
    const levelCheck = !course.levelRequired || user.level >= course.levelRequired;
    const rankCheck = !course.rankRequired || 
      USER_RANKS[user.rank as UserRank] >= USER_RANKS[course.rankRequired as UserRank];

    return course.requirementType === 'AND' 
      ? levelCheck && rankCheck 
      : levelCheck || rankCheck;
  }

  async startCourse(userId: string, courseId: string) {
    return await prisma.$transaction(async (tx) => {

      // 既存のアクティブなコースを失敗状態に
      const existingActiveCourse = await tx.userCourse.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });

      if (existingActiveCourse) {
        await tx.userCourse.update({
          where: { id: existingActiveCourse.id },
          data: { 
            isActive: false,
            status: 'FAILED',
            certificationEligibility: false
          },
        });
      }

      // 新しいコースの開始
      const userCourse = await tx.userCourse.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        update: {
          isActive: true,
          startedAt: new Date(),
          status: 'ACTIVE',
          progress: 0,
          completedAt: null,
          isTimedOut: false,
          timeOutAt: null,
        },
        create: {
          userId,
          courseId,
          status: 'ACTIVE',
          isActive: true,
          startedAt: new Date(),
          certificationEligibility: true
        },
      });

      // 最初のチャプターの進捗を作成
      const firstChapter = await tx.chapter.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
      });

      if (firstChapter) {
        await tx.userChapterProgress.create({
          data: {
            userId,
            courseId,
            chapterId: firstChapter.id,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            lessonWatchRate: 0
          },
        });
      }

      return { success: true, data: userCourse };
    });
  }

  async getCurrentUserCourse(userId: string, courseId?: string) {
    const whereClause: any = {
      userId,
      isActive: true,
      isTimedOut: false
    };
  
    if (courseId) {
      whereClause.courseId = courseId;
    }
  
    const userCourse = await prisma.userCourse.findFirst({
      where: whereClause,
      include: {
        course: {
          include: {
            chapters: {
              orderBy: {
                orderIndex: 'asc'
              }
            }
          }
        }
      }
    });
  
    if (userCourse) {
      // タイムアウトチェック
      if (userCourse.courseId) {
        const timeoutCheck = await timeoutService.checkCourseTimeout(userId, userCourse.courseId);
        if (timeoutCheck.isTimedOut) {
          await this.handleTimeout(userId, userCourse.courseId);
          return null;
        }
      }
    }
  
    return userCourse;
  }

  // 復活させた getCurrentChapter
  async getCurrentChapter(userId: string, courseId: string) {
    console.log('Getting current chapter for:', { userId, courseId });
  
    // Get all chapter progress for this course
    const chapterProgress = await prisma.userChapterProgress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        chapter: true,
      },
      orderBy: {
        chapter: {
          orderIndex: 'asc',
        },
      },
    });
  
    // Get all chapters for this course
    const courseChapters = await prisma.chapter.findMany({
      where: {
        courseId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  
    // Find the first incomplete chapter
    const nextChapter = courseChapters.find(chapter => {
      const progress = chapterProgress.find(p => p.chapterId === chapter.id);
      return !progress || progress.status !== 'COMPLETED';
    });
  
    // If all chapters are completed, return the last chapter
    return nextChapter || courseChapters[courseChapters.length - 1];
  }

  // 復活させた getUserCourses
  async getUserCourses(userId: string) {
    return prisma.userCourse.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: {
                orderIndex: 'asc'
              }
            }
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
  }

  private async handleTimeout(userId: string, courseId: string) {
    await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'FAILED',
        isTimedOut: true,
        timeOutAt: new Date(),
        isActive: false,
        certificationEligibility: false
      }
    });
  }

  async calculateFinalStatus(
    userId: string,
    courseId: string,
    totalExperienceRate: number
  ) {
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!userCourse?.certificationEligibility) {
      return 'COMPLETED';
    }

    if (totalExperienceRate >= 95) {
      return 'PERFECT';
    } else if (totalExperienceRate >= 85) {
      return 'CERTIFIED';
    } else {
      return 'COMPLETED';
    }
  }

  async updateCourseStatus(
    userId: string,
    courseId: string,
    totalExperienceRate: number
  ) {
    const finalStatus = await this.calculateFinalStatus(
      userId,
      courseId,
      totalExperienceRate
    );

    return await prisma.userCourse.update({
      where: {
        userId_courseId: { userId, courseId }
      },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        isActive: false
      }
    });
  }
}

export const userCourseService = new UserCourseService();
