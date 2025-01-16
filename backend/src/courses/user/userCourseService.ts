// src/courses/user/userCourseService.ts

import { PrismaClient } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { CourseStatusManager } from '../progress/courseStatusManager';
import { 
  CourseWithStatus, 
  CourseResponse, 
  PurchaseResult 
} from '../types/course';
import { CourseStatus, UserRank, USER_RANKS } from '../types/status';


interface CourseRequirement {
  levelRequired?: number | null;
  rankRequired?: string | null;
  requirementType?: string;
}

export class UserCourseService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;
  private statusManager: CourseStatusManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
    this.statusManager = new CourseStatusManager();
  
    // イベントリスナーの追加
    this.statusManager.onStatusChange(this.handleStatusChange.bind(this));
  }
  async getActiveCourseUsers(courseId: string) {
    const activeUsers = await this.prisma.userCourse.findMany({
      where: {
        courseId,
        status: 'active'
      },
      include: {
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

  async initializeUserSession(userId: string): Promise<void> {
    try {
      await this.statusManager.resumeUserSession(userId);
    } catch (error) {
      console.error('Error initializing user session:', error);
      throw new Error('セッションの初期化に失敗しました');
    }
  }

  // カレントコース情報の取得
  async getCurrentCourseInfo(userId: string): Promise<CourseResponse | null> {
    const currentState = await this.statusManager.getCurrentCourseState(userId);
    if (!currentState) return null;

    return this.formatCourseResponse({
      ...currentState,
      course: await this.prisma.course.findUnique({
        where: { id: currentState.courseId },
        include: {
          chapters: {
            orderBy: {
              orderIndex: 'asc'
            }
          }
        }
      })
    });
  }







  // 追加: ユーザーのすべてのコース情報取得
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
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    const [user, userCourses] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, rank: true }
      }),
      this.prisma.userCourse.findMany({
        where: { userId }
      })
    ]);
  
    // statusのみで判定
    const hasActiveCourse = userCourses.some(uc => uc.status === 'active');
  
    const courses = await this.prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false
      },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  
    if (!hasActiveCourse) {
      // blocked状態のコースをavailableに戻す
      await this.prisma.userCourse.updateMany({
        where: {
          userId,
          status: 'blocked'
        },
        data: { status: 'available' }
      });
      
      // ユーザーコース情報を再取得
      userCourses.splice(0, userCourses.length, 
        ...(await this.prisma.userCourse.findMany({ where: { userId } }))
      );
    }
  
    return courses.map(course => {
      const userCourse = userCourses.find(uc => uc.courseId === course.id);
      const status = this.convertToStatusType(
        userCourse?.status || this.determineInitialStatus(user, course)
      );
      
      return {
        ...course,
        status,
        isCurrent: userCourse?.isCurrent || false
      } as CourseWithStatus;
    });
  }
  
  // 新しく追加するヘルパーメソッド
  private convertToStatusType(status: string): CourseStatus {
    // 大文字小文字の違いを吸収するため、小文字に統一して比較
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'restricted': return CourseStatus.RESTRICTED;
      case 'blocked': return CourseStatus.BLOCKED;
      case 'available': return CourseStatus.AVAILABLE;
      case 'active': return CourseStatus.ACTIVE;
      case 'completed': return CourseStatus.COMPLETED;
      case 'perfect': return CourseStatus.PERFECT;
      case 'failed': return CourseStatus.FAILED;
      default: return CourseStatus.RESTRICTED;
    }
  }





  async getCurrentUserCourse(userId: string): Promise<CourseResponse | null> {
    const userCourse = await this.prisma.userCourse.findFirst({
      where: {
        userId,
        isCurrent: true
      },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    return userCourse ? this.formatCourseResponse(userCourse) : null;
  }

  



  async selectCourse(userId: string, courseId: string): Promise<void> {
    await this.statusManager.selectCourse(userId, courseId);
  }

  // コース開始処理
  async activateCourse(userId: string, courseId: string): Promise<void> {
    await this.statusManager.activateCourse(userId, courseId);
  }

  // コース初期化処理
  async formatCourse(userId: string, courseId: string): Promise<void> {
    await this.statusManager.formatCourse(userId, courseId);
  }
  
  private determineInitialStatus(
    user: { level: number; rank: string } | null,
    course: { 
      levelRequired?: number | null, 
      rankRequired?: string | null,
    }
  ): string {
    if (!user) return 'restricted';
    
    // 第一関門：階級チェック
    if (course.rankRequired) {
      const userRankValue = USER_RANKS[user.rank as UserRank];
      const requiredRankValue = USER_RANKS[course.rankRequired as UserRank];
      
      if (userRankValue < requiredRankValue) {
        return 'restricted';
      }
    }
    
    // 第二関門：レベルチェック
    if (course.levelRequired && user.level < course.levelRequired) {
      return 'restricted';
    }
    
    // 全ての要件を満たした
    return 'available';
  }






  async getCourseById(userId: string, courseId: string): Promise<CourseResponse | null> {
  const userCourse = await this.prisma.userCourse.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    },
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

  return userCourse ? this.formatCourseResponse(userCourse) : null;
}



  // イベントハンドリング用メソッド
  private async handleStatusChange(event: {
    type: string;
    userId: string;
    courseId: string;
    oldStatus: CourseStatus;
    newStatus: CourseStatus;
    data?: any;
  }): Promise<void> {
    switch (event.type) {
      case 'CURRENT_CHANGED':
        console.log(`Current course changed for user ${event.userId}`);
        break;
      case 'STATUS_CHANGED':
        console.log(`Course status changed from ${event.oldStatus} to ${event.newStatus}`);
        break;
      case 'TIMEOUT_OCCURRED':
        console.log(`Timeout occurred for course ${event.courseId}`);
        break;
    }
  }

  private async handleTimeout(userId: string, courseId: string): Promise<void> {
    await this.statusManager.handleTimeout(userId, courseId);
  }

  async restartCourse(userId: string, courseId: string) {
    // コースの再開処理を StatusManager に委譲
    return await this.statusManager.formatCourse(userId, courseId);
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

    if (!userCourse) {
      return false;
    }

    // アクセス権チェックを StatusManager に委譲
    return await this.statusManager.canAccess(userId, courseId);
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

  private determineStatus(
    userCourse: any, 
    user: { level: number; rank: string }, 
    course: { levelRequired?: number | null; rankRequired?: string | null }
  ): CourseStatus {
    if (userCourse) {
      // isCurrent の考慮を追加
      if (userCourse.isTimedOut) return 'failed';
      if (userCourse.isCurrent && userCourse.status === 'active') return 'active';
      return userCourse.status as CourseStatus;
    }
    
    return this.checkCourseRequirements(user, course) ? 'available' : 'restricted';
  }

  
  private checkCourseRequirements(
    user: { level: number; rank: string },
    course: CourseRequirement
  ): boolean {
    const levelCheck = !course.levelRequired || user.level >= course.levelRequired;
    const rankCheck = !course.rankRequired || 
      USER_RANKS[user.rank as UserRank] >= USER_RANKS[course.rankRequired as UserRank];
  
    return (course.requirementType === 'AND') 
      ? levelCheck && rankCheck 
      : levelCheck || rankCheck;
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
      isCurrent: userCourse.isCurrent,  // この行を追加
      rankRequired: userCourse.course.rankRequired,
      timeLimit: userCourse.course.timeLimit,
      timeInfo,
      certificationEligibility: userCourse.certificationEligibility,
      gradient: userCourse.course.gradient,
      archiveUntil: userCourse.course.archiveUntil,
      lastAccessedChapterId: userCourse.lastAccessedChapterId,
      chapters: userCourse.course.chapters
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