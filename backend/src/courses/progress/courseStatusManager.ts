// src/courses/progress/CourseStatusManager.ts

import { 
  PrismaClient, 
  Prisma,
  UserCourse
} from '@prisma/client';
import { CourseStatus, ChapterProgressStatus } from '../types/status';
import { TimeoutService } from '../timeouts/timeoutService';
import { CourseProgressManager } from './courseProgressManager';
import { EventEmitter } from 'events';
import { UserChapterService } from '../user/userChapterService';



interface CurrentCourseState {
  courseId: string;
  status: CourseStatus;
  currentChapter: {
    id: string;
    status: ChapterProgressStatus;
    lastAccessedAt: Date;
  } | null;
  timeInfo: {
    timeRemaining?: number;
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
}

interface StatusChangeEvent {
  type: 'STATUS_CHANGED' | 'TIMEOUT_OCCURRED' | 'COURSE_COMPLETED' | 'CURRENT_CHANGED';
  userId: string;
  courseId: string;
  oldStatus: CourseStatus;
  newStatus: CourseStatus;
  timestamp: Date;
  data?: StatusChangeEventData;
}
  interface StatusChangeEventData {
    grade?: string;
    gradePoint?: number;
    timeOutAt?: Date;
    certificationEligibility?: boolean;
    isCurrent?: boolean;
    currentChapterId?: string;
    timeRemaining?: number;
    isTimedOut?: boolean;
  }

export class CourseStatusManager {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;
  private timeoutService: TimeoutService;
  private eventEmitter: EventEmitter;
  private userChapterService: UserChapterService;
  private readonly COURSE_STATUSES = {
    RESTRICTED: 'restricted',
    BLOCKED: 'blocked',
    AVAILABLE: 'available',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PERFECT: 'perfect',
    FAILED: 'failed'
  } as const;

  // セレクト可能な状態の判定
  private isSelectable(status: string): boolean {
    const selectableStatuses = [
      'active',
      'completed',
      'perfect',
      'failed'
    ];
    return selectableStatuses.includes(status.toLowerCase());
  }
  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
    this.timeoutService = new TimeoutService();
    this.eventEmitter = new EventEmitter();
    this.userChapterService = new UserChapterService();
  }
  // CourseStatusManager.ts

async getCurrentCourseState(userId: string): Promise<CurrentCourseState | null> {
  return await this.prisma.$transaction(async (tx) => {
    const userCourse = await tx.userCourse.findFirst({
      where: {
        userId,
        isCurrent: true
      }
    });

    if (!userCourse) return null;

    let chapterProgress = null;
    try {
      chapterProgress = await this.userChapterService.getCurrentChapter(
        userId, 
        userCourse.courseId
      );
    } catch (error) {
      console.log('Failed to get chapter progress, continuing without it:', error);
      // エラーをスローせずに継続
    }

    const timeoutStatus = await this.checkTimeout(
      userId,
      userCourse.courseId
    );

    return {
      courseId: userCourse.courseId,
      status: userCourse.status as CourseStatus,
      currentChapter: chapterProgress ? {
        id: chapterProgress.chapterId,
        status: chapterProgress.status as ChapterProgressStatus,
        lastAccessedAt: chapterProgress.updatedAt
      } : null,
      timeInfo: {
        timeRemaining: userCourse.timeOutAt 
          ? Math.max(0, userCourse.timeOutAt.getTime() - Date.now()) 
          : undefined,
        isTimedOut: timeoutStatus.isTimedOut,
        timeOutAt: timeoutStatus.timeOutAt
      }
    };
  });
}

  async resumeUserSession(userId: string): Promise<void> {
    try {
      const currentState = await this.getCurrentCourseState(userId);
      
      if (!currentState) {
        console.log('No active course found for session resume');
        return;
      }

      if (currentState.status === 'active') {
        // タイムアウトチェックと処理
        if (currentState.timeInfo.isTimedOut) {
          await this.handleTimeout(userId, currentState.courseId);
          return;
        }

        // セッション復帰イベントの発行
        this.emitStatusChange({
          type: 'CURRENT_CHANGED',
          userId,
          courseId: currentState.courseId,
          oldStatus: currentState.status,
          newStatus: currentState.status,
          timestamp: new Date(),
          data: {
            currentChapterId: currentState.currentChapter?.id,
            timeRemaining: currentState.timeInfo.timeRemaining,
            isTimedOut: currentState.timeInfo.isTimedOut
          }
        });

        // 必要に応じてチャプターの状態も更新
        if (currentState.currentChapter) {
          await this.userChapterService.getCurrentChapter(
            userId,
            currentState.courseId
          );
        }
      }
    } catch (error) {
      console.error('Error resuming user session:', error);
      throw new Error('セッションの復帰に失敗しました');
    }
  }
  async selectCourse(userId: string, courseId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const course = await tx.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });

      if (!course || !this.isSelectable(course.status)) {
        throw new Error('This course cannot be selected');
      }

      // 現在のカレントをリセット
      await tx.userCourse.updateMany({
        where: { userId, isCurrent: true },
        data: { isCurrent: false }
      });

      // 新しいカレントを設定
      await tx.userCourse.update({
        where: { userId_courseId: { userId, courseId } },
        data: { isCurrent: true }
      });
    });
  }

  async activateCourse(userId: string, courseId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      // アクティブコースの存在チェック
      const existingActive = await tx.userCourse.findFirst({
        where: {
          userId,
          status: this.COURSE_STATUSES.ACTIVE
        }
      });

      if (existingActive) {
        throw new Error('Another course is already active');
      }

      // 他のavailableコースをblockedに変更
      await tx.userCourse.updateMany({
        where: {
          userId,
          status: this.COURSE_STATUSES.AVAILABLE,
          NOT: { courseId }
        },
        data: { status: this.COURSE_STATUSES.BLOCKED }
      });

      // 対象コースをアクティブに
      await tx.userCourse.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          status: this.COURSE_STATUSES.ACTIVE,
          isCurrent: true
        }
      });
    });
  }

  async formatActiveCourse(userId: string, courseId: string): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const course = await tx.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });

      if (!course || course.status !== this.COURSE_STATUSES.ACTIVE) {
        throw new Error('Course is not active');
      }

      // 進捗データの削除
      await tx.userChapterProgress.deleteMany({
        where: { userId, courseId }
      });

      // blocked状態のコースをavailableに戻す
      await tx.userCourse.updateMany({
        where: {
          userId,
          status: this.COURSE_STATUSES.BLOCKED
        },
        data: { status: this.COURSE_STATUSES.AVAILABLE }
      });

      // 対象コースをavailableに変更
      await tx.userCourse.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          status: this.COURSE_STATUSES.AVAILABLE,
          isCurrent: false
        }
      });
    });
  }

  // 失敗コースの処理
  async handleFailedCourse(userId: string, courseId: string, action: 'select' | 'reset'): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      const course = await tx.userCourse.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });

      if (!course || course.status !== this.COURSE_STATUSES.FAILED) {
        throw new Error('Course is not in failed status');
      }

      if (action === 'select') {
        // 現在のカレントをリセット
        await tx.userCourse.updateMany({
          where: { userId, isCurrent: true },
          data: { isCurrent: false }
        });

        // failed状態のままカレントに設定
        await tx.userCourse.update({
          where: { userId_courseId: { userId, courseId } },
          data: { isCurrent: true }
        });
      } else if (action === 'reset') {
        // 進捗データの削除
        await tx.userChapterProgress.deleteMany({
          where: { userId, courseId }
        });

        // 成績履歴の削除
        await tx.gradeHistory.deleteMany({
          where: { userId, courseId }
        });

        // コースをavailableに戻す
        await tx.userCourse.update({
          where: { userId_courseId: { userId, courseId } },
          data: {
            status: this.COURSE_STATUSES.AVAILABLE,
            isCurrent: false
          }
        });
      }
    });
  }


  async checkTimeout(userId: string, courseId: string): Promise<{
    isTimedOut: boolean;
    timeOutAt?: Date;
  }> {
    const course = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!course || !course.timeOutAt) {
      return { isTimedOut: false };
    }

    const now = new Date();
    return {
      isTimedOut: now > course.timeOutAt,
      timeOutAt: course.timeOutAt
    };
  }



  async canAccess(userId: string, courseId: string): Promise<boolean> {
    const course = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!course) return false;

    const timeoutStatus = await this.checkTimeout(userId, courseId);
    if (timeoutStatus.isTimedOut) return false;

    return course.status === 'active' || ['completed', 'perfect'].includes(course.status);
  }


  private async canExecuteAction(
    userId: string,
    courseId: string,
    action: 'select' | 'activate' | 'format'
  ): Promise<boolean> {
    const course = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });
  
    if (!course) return false;
  
    // アクション条件を修正
    const actionConditions: Record<string, (status: string) => boolean> = {
      select: (status) => [
        'active',
        'completed',
        'perfect',
        'failed'
      ].includes(status.toLowerCase()),  // 大文字小文字の違いを吸収
      activate: (status) => status.toLowerCase() === 'available',
      format: (status) => ['active', 'failed'].includes(status.toLowerCase())
    };
  
    // デバッグログを追加
    console.log('Checking action:', {
      action,
      courseStatus: course.status,
      canExecute: actionConditions[action](course.status)
    });
  
    return actionConditions[action](course.status);
  }
  

  private async updateBlockedStatus(
    tx: Prisma.TransactionClient,
    userId: string,
    excludeCourseId?: string
  ): Promise<void> {
    await tx.userCourse.updateMany({
      where: {
        userId,
        status: 'available',
        NOT: {
          courseId: excludeCourseId
        }
      },
      data: {
        status: 'blocked'
      }
    });
  }




  async formatCourse(userId: string, courseId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const course = await tx.userCourse.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });
  
      // デバッグログを追加
      console.log('Format course check:', {
        courseExists: !!course,
        courseStatus: course?.status
      });
  
      // ステータスを小文字に変換して比較
      if (!course || !['active', 'failed'].includes(course.status.toLowerCase())) {
        throw new Error('Course cannot be formatted in current state');
      }
  
      const oldStatus = course.status as CourseStatus;
  
      // 関連データの削除
      await tx.userChapterProgress.deleteMany({
        where: { userId, courseId }
      });
  
      // failed状態の場合は成績履歴も削除
      if (course.status.toLowerCase() === 'failed') {
        await tx.gradeHistory.deleteMany({
          where: { userId, courseId }
        });
      }
  
      // コース状態の更新
      await tx.userCourse.update({
        where: {
          userId_courseId: { userId, courseId }
        },
        data: {
          status: 'available',
          startedAt: null,
          completedAt: null,
          timeOutAt: null,
          isTimedOut: false
        }
      });
  
      this.emitStatusChange({
        type: 'STATUS_CHANGED',
        userId,
        courseId,
        oldStatus,
        newStatus: 'available',
        timestamp: new Date()
      });
    });
  }

  async handleTimeout(userId: string, courseId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const course = await tx.userCourse.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });

      if (!course || course.isTimedOut) return;

      const oldStatus = course.status as CourseStatus;

      await tx.userCourse.update({
        where: {
          userId_courseId: { userId, courseId }
        },
        data: {
          status: 'failed',
          isTimedOut: true,
          timeOutAt: new Date(),
          certificationEligibility: false
        }
      });

      this.emitStatusChange({
        type: 'TIMEOUT_OCCURRED',
        userId,
        courseId,
        oldStatus,
        newStatus: 'failed',
        timestamp: new Date(),
        data: {
          timeOutAt: new Date()
        }
      });
    });
  }

  private calculateGrade(finalScore: number): {
    status: CourseStatus;
    grade: string;
    gradePoint: number;
  } {
    if (finalScore >= 90) {
      return { status: 'perfect', grade: '秀', gradePoint: 4.0 };
    }
    if (finalScore >= 80) {
      return { status: 'completed', grade: '優', gradePoint: 3.0 };
    }
    if (finalScore >= 70) {
      return { status: 'completed', grade: '良', gradePoint: 2.0 };
    }
    if (finalScore >= 60) {
      return { status: 'completed', grade: '可', gradePoint: 1.0 };
    }
    return { status: 'failed', grade: '不可', gradePoint: 0.0 };
  }

  async handleCourseCompletion(userId: string, courseId: string, finalScore: number): Promise<void> {
    console.log('コース完了処理を開始:', {
      userId,
      courseId,
      finalScore
    });
  
    await this.prisma.$transaction(async (tx) => {
      // コースの情報を取得
      const course = await tx.course.findUnique({
        where: { id: courseId },
        select: { credits: true }
      });
  
      if (!course) {
        throw new Error('Course not found');
      }
  
      // デフォルトの単位数を1とし、コースに設定がある場合はそちらを使用
      const credits = course.credits ?? 1;
  
      // 1. 成績評価の計算
      const { status, grade, gradePoint } = this.calculateGrade(finalScore);
  
      console.log('評価結果:', {
        status,
        grade,
        gradePoint,
        credits
      });
  
      // 2. コース状態の更新
      const updatedCourse = await tx.userCourse.update({
        where: { 
          userId_courseId: { userId, courseId } 
        },
        data: {
          status,
          completedAt: new Date(),
          isCurrent: false
        }
      });
  
      // 3. 成績履歴の作成
      await tx.gradeHistory.create({
        data: {
          userId,
          courseId,
          grade,
          gradePoint,
          credits,          // ← 固定値から動的な値に変更
          completedAt: new Date()
        }
      });
  
      // 4. ユーザーの総取得単位数とGPAを更新
      await this.updateUserGPA(tx, userId);
  
      // 5. ステータス変更イベントの発行
      this.emitStatusChange({
        type: 'COURSE_COMPLETED',
        userId,
        courseId,
        oldStatus: 'active',
        newStatus: status,
        timestamp: new Date(),
        data: {
          grade,
          gradePoint,
          certificationEligibility: true
        }
      });
  
      console.log('コース完了処理が完了:', {
        新ステータス: updatedCourse.status,
        評価: grade,
        取得単位: credits,
        完了日時: updatedCourse.completedAt
      });
    });
  }

  private async updateUserGPA(
    tx: Prisma.TransactionClient,
    userId: string
  ): Promise<void> {
    const grades = await tx.gradeHistory.findMany({
      where: { userId }
    });

    if (grades.length === 0) {
      await tx.user.update({
        where: { id: userId },
        data: { gpa: null }
      });
      return;
    }

    const totalPoints = grades.reduce(
      (sum, grade) => sum + (grade.gradePoint * grade.credits),
      0
    );
    const totalCredits = grades.reduce(
      (sum, grade) => sum + grade.credits,
      0
    );

    const gpa = totalPoints / totalCredits;

    await tx.user.update({
      where: { id: userId },
      data: {
        gpa,
        totalCredits
      }
    });
  }


  private emitStatusChange(event: StatusChangeEvent): void {
    this.eventEmitter.emit('STATUS_CHANGED', event);
  }

  // Event listener registration
  public onStatusChange(handler: (event: StatusChangeEvent) => void): void {
    this.eventEmitter.on('STATUS_CHANGED', handler);
  }

}
export const courseStatusManager = new CourseStatusManager();  