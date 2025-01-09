import { PrismaClient } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { CourseStatus, USER_RANKS, UserRank } from '../types/status';
import { 
  CourseWithStatus, 
  CourseResponse, 
  PurchaseResult 
} from '../types/course';

export class UserCourseService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
  }


  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rank: true,
        courses: {
          select: {
            courseId: true,
            isActive: true,
            isTimedOut: true,
            status: true
          }
        }
      }
    });

    if (!user || user.rank === '退会者') {
      return [];
    }

    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false
      },
      include: {
        chapters: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    return courses.map(course => {
      const userCourse = user.courses.find(uc => uc.courseId === course.id);
      
      let status: CourseStatus;
      if (userCourse) {
        status = userCourse.isTimedOut ? 'failed' : userCourse.status as CourseStatus;
      } else {
        status = this.checkCourseRequirements(
          { level: user.level, rank: user.rank },
          course
        ) ? 'available' : 'restricted';
      }

      return {
        ...course,
        status
      };
    });
  }
  async checkAccess(
    userId: string,
    courseId: string,
    chapterId: string
  ) {
    return await this.progressManager.isChapterAvailable(
      userId,
      courseId,
      chapterId
    );
  }


  async getCurrentUserCourse(userId: string, courseId?: string): Promise<CourseResponse | null> {
    const whereClause = {
      userId,
      isActive: true,
      isTimedOut: false,
      ...(courseId && { courseId })
    };

    const userCourse = await this.prisma.userCourse.findFirst({
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

    if (!userCourse) {
      return null;
    }

    // タイムアウトチェックを修正
    const timeoutCheck = await this.progressManager.checkTimeoutStatus(
      this.prisma,  // トランザクションクライアントを渡す
      userId,
      courseId || userCourse.courseId  // courseId が undefined の場合は userCourse から取得
    );

    if (timeoutCheck.isTimedOut) {
      await this.handleTimeout(userId, courseId || userCourse.courseId);
      return null;
    }

    return this.formatCourseResponse(userCourse);
  }

  

  async getUserCourses(userId: string) {
    return await this.prisma.userCourse.findMany({
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

  async getActiveCourseUsers(courseId: string) {
    const activeUsers = await this.prisma.userCourse.findMany({
      where: {
        courseId,
        isActive: true,
        status: 'active'
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  
    return {
      users: activeUsers.map(userCourse => ({
        id: userCourse.user.id,
        name: userCourse.user.name,
        avatarUrl: userCourse.user.avatarUrl
      }))
    };
  }
// userCourseService.ts の restartCourse メソッドを以下のように修正

async restartCourse(userId: string, courseId: string) {
  try {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 現在のコース状態チェック
      const currentCourse = await tx.userCourse.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });

      if (!currentCourse) {
        throw new Error('Course not found');
      }

      // 2. 再スタート可能状態チェック
      const RESTARTABLE_STATUS = ['available', 'completed', 'certified', 'failed'] as const;
      if (!RESTARTABLE_STATUS.includes(currentCourse.status as any)) {
        throw new Error(`Course with status ${currentCourse.status} cannot be restarted`);
      }

      // 3. 既存のアクティブコースを非アクティブ化
      await tx.userCourse.updateMany({
        where: {
          userId,
          isActive: true,
          NOT: {
            courseId
          }
        },
        data: {
          isActive: false,
          status: 'completed',
          completedAt: new Date()
        }
      });

      // 4. 進捗データのクリーンアップ
      await tx.userChapterProgress.deleteMany({
        where: {
          userId,
          courseId
        }
      });

      // 5. コース状態の初期化
      const updatedCourse = await tx.userCourse.update({
        where: {
          userId_courseId: { userId, courseId }
        },
        data: {
          status: 'active',
          isActive: true,
          startedAt: new Date(),
          completedAt: null,
          isTimedOut: false,
          timeOutAt: null
        }
      });

      // 6. イベント通知はProgressManagerに委譲
      await this.progressManager.handleCourseStateChange({
        courseId,
        changes: {
          isPublished: true
        },
        affectedUserIds: [userId]
      });

      return updatedCourse;
    });

  } catch (error) {
    console.error('Error in restartCourse:', error);
    throw error;
  }
}

  async checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
    const userCourse = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!userCourse || userCourse.isTimedOut) {
      return false;
    }

    // タイムアウトチェックを修正
    const timeoutCheck = await this.progressManager.checkTimeoutStatus(
      this.prisma,
      userId,
      courseId
    );

    return !timeoutCheck.isTimedOut;
  }




  async checkPurchaseEligibility(userId: string, courseId: string): Promise<PurchaseResult> {
    const [user, course] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          rank: true,
          gems: true
        }
      }),
      this.prisma.course.findUnique({
        where: { id: courseId }
      })
    ]);

    if (!user || !course) {
      return { 
        success: false, 
        error: 'User or course not found' 
      };
    }

    if (!this.checkCourseRequirements(user, course)) {
      return { 
        success: false, 
        error: 'Requirements not met' 
      };
    }
    if (!course.isPublished) {
      return {
        success: false,
        error: 'Course is not available for purchase'
      };
    }

    return { success: true };
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

  private async handleTimeout(userId: string, courseId: string): Promise<void> {
    await this.prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'failed',
        isTimedOut: true,
        timeOutAt: new Date(),
        isActive: false,
        certificationEligibility: false
      }
    });
  }
  
  private formatCourseResponse(userCourse: any): CourseResponse {
    const timeInfo = {
      timeLimit: userCourse.course.timeLimit,
      startedAt: userCourse.startedAt,
      timeOutAt: userCourse.timeOutAt,
      remainingDays: this.calculateRemainingDays(
        userCourse.startedAt, 
        userCourse.course.timeLimit
      )
    };

    return {
      id: userCourse.course.id,
      title: userCourse.course.title,
      description: userCourse.course.description,
      status: userCourse.status,
      levelRequired: userCourse.course.levelRequired,
      rankRequired: userCourse.course.rankRequired,
      timeLimit: userCourse.course.timeLimit,
      timeInfo,
      certificationEligibility: userCourse.certificationEligibility,
      gradient: userCourse.course.gradient,
      archiveUntil: userCourse.course.archiveUntil,
      lastAccessedChapterId: userCourse.lastAccessedChapterId,
      chapters: userCourse.course.chapters // ここにchaptersを追加
    };
  }
  private calculateRemainingDays(startedAt: Date, timeLimit?: number): number | undefined {
    if (!startedAt || !timeLimit) return undefined;
    
    const now = new Date();
    const timeLimitMs = timeLimit * 24 * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - startedAt.getTime();
    const remainingMs = timeLimitMs - elapsedMs;
    
    return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
  }
}

export const userCourseService = new UserCourseService();