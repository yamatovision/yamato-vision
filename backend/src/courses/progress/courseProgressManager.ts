import { 
  PrismaClient, 
  Prisma,
  UserChapterProgress,
  UserStatus,
  Course,
  Chapter,
  Badge
} from '@prisma/client';


import { EventEmitter } from 'events';

import { 
  ChapterProgressStatus, 
  CourseStatus,
  ChapterAvailabilityStatus 
} from '../types/status';

interface TimeoutResult {
  currentProgress: UserChapterProgress;
  nextChapter: Chapter | null;
}


type ProgressEventType = {
  STATUS_CHANGED: {
    oldStatus?: ChapterProgressStatus | CourseStatus | null | string;
    newStatus?: ChapterProgressStatus | CourseStatus | string;
    lessonWatchRate?: number;
    score?: number;
    type?: 'admin_course_update' | 'admin_chapter_update' | 'course_restart';
    changes?: {
      isVisible?: boolean;
      isPerfectOnly?: boolean;
      isFinalExam?: boolean;
      releaseTime?: number;
      timeLimit?: number;
    };
    affectedUsers?: number;
  };
  CHAPTER_COMPLETED: {
    score: number;
    timeoutOccurred?: boolean;
  };
  COURSE_COMPLETED: {
    status: CourseStatus;
    completedAt: Date;
    badgeAwarded?: boolean;
  };
  TIMEOUT_OCCURRED: {
    level: 'course' | 'chapter';
    timeOutAt: Date;
  };
};

type BadgeCondition = 'COURSE_COMPLETE' | 'PERFECT_COMPLETE' | 'CERTIFIED_COMPLETE';



type ProgressEvent<T extends keyof ProgressEventType> = {
  type: T;
  userId?: string;  // 管理者アクション用にオプショナルに
  courseId: string;
  chapterId?: string;
  data: ProgressEventType[T];
};

export class CourseProgressManager {
  private prisma: PrismaClient;
  private eventEmitter: EventEmitter;
  private readonly MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
  private readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

  constructor() {
    this.prisma = new PrismaClient();
    this.eventEmitter = new EventEmitter();
  }



  async handleFirstAccess(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
    chapterId: string
  ) {
    console.log('【初回アクセス処理開始】', {
      処理: 'handleFirstAccess',
      ユーザーID: userId,
      コースID: courseId,
      チャプターID: chapterId,
      タイムスタンプ: new Date().toISOString()
    });
  
    const progress = await tx.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      include: {
        chapter: true
      }
    });
  
    console.log('【進捗状態確認】', {
      現在の状態: progress?.status || 'なし',
      開始日時: progress?.startedAt || 'なし',
      条件確認: {
        'NOT_STARTED状態か': progress?.status === 'NOT_STARTED'
      }
    });
  
    if (!progress) {
      const now = new Date();
      const chapter = await tx.chapter.findUnique({
        where: { id: chapterId }
      });
  
      const timeOutAt = chapter?.timeLimit 
        ? new Date(now.getTime() + chapter.timeLimit * this.MILLISECONDS_PER_HOUR)
        : null;
  
      return await tx.userChapterProgress.create({
        data: {
          userId,
          courseId,
          chapterId,
          status: 'NOT_STARTED',
          startedAt: now,
          timeOutAt,
        }
      });
    }
  


    // 条件を開始日時のチェックなしに修正
    if (progress?.status === 'NOT_STARTED') {
      const now = new Date();
      const timeOutAt = progress.chapter.timeLimit 
      ? new Date(now.getTime() + progress.chapter.timeLimit * this.MILLISECONDS_PER_HOUR) // 時間単位に変更
        : null;
  
      const updatedProgress = await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        data: {
          status: 'LESSON_IN_PROGRESS',
          timeOutAt,
          updatedAt: now
        }
      });
  
      console.log('【ステータス更新完了】', {
        更新前の状態: progress.status,
        更新後の状態: updatedProgress.status,
        タイムアウト日時: updatedProgress.timeOutAt,
        更新日時: updatedProgress.updatedAt
      });
  
      return updatedProgress;
    }
  
    console.log('【初回アクセス処理終了】', {
      結果: '条件を満たさないため更新なし',
      現在の状態: progress?.status
    });
  
    return progress;
  }


  async updateChapterProgress(
    userId: string,
    courseId: string,
    chapterId: string,
    progressData: {
      lessonWatchRate?: number;
      submissionPoints?: number;
    }
  ): Promise<UserChapterProgress> {
    try {
      console.log('【進捗更新処理開始】', {
        処理: 'updateChapterProgress',
        ユーザーID: userId,
        コースID: courseId,
        チャプターID: chapterId,
        データ: {
          視聴率: progressData.lessonWatchRate,
          提出スコア: progressData.submissionPoints
        },
        タイムスタンプ: new Date().toISOString()
      });
  
      return await this.prisma.$transaction(async (tx) => {
        const accessStatus = await this.checkAccessibility(userId, courseId, chapterId);
        if (!accessStatus.canAccess) {
          console.error('【アクセス拒否】', {
            理由: accessStatus.message,
            ステータス: accessStatus
          });
          throw new Error(accessStatus.message || 'Access denied');
        }
  
        const currentProgress = await tx.userChapterProgress.findUnique({
          where: {
            userId_courseId_chapterId: {
              userId,
              courseId,
              chapterId
            }
          }
        });
  
        console.log('【現在の進捗状態】', {
          現在のステータス: currentProgress?.status || 'なし',
          視聴率: currentProgress?.lessonWatchRate || 0,
          スコア: currentProgress?.score,
          開始日時: currentProgress?.startedAt
        });
  
        let newStatus = currentProgress?.status || 'NOT_STARTED';
        const updateData: Prisma.UserChapterProgressUpdateInput = {
          updatedAt: new Date()
        };
  
        const timeoutStatus = await this.checkTimeoutStatus(tx, userId, courseId, chapterId);
        if (timeoutStatus.isTimedOut) {
          console.log('【タイムアウト検知】', {
            タイムアウト日時: timeoutStatus.timeOutAt
          });
  
          updateData.isTimedOut = true;
          updateData.timeOutAt = new Date();
          updateData.score = 0;
          updateData.status = 'COMPLETED';
          updateData.completedAt = new Date();
  
          const updatedProgress = await tx.userChapterProgress.update({
            where: {
              userId_courseId_chapterId: {
                userId,
                courseId,
                chapterId
              }
            },
            data: updateData
          });
  
          console.log('【タイムアウトによる強制完了】', {
            新ステータス: updatedProgress.status,
            スコア: updatedProgress.score,
            完了日時: updatedProgress.completedAt
          });


// StatusChangedイベントの発行部分
this.emit({
  type: 'STATUS_CHANGED',
  userId,
  courseId,
  chapterId,
  data: {
    oldStatus: this.convertToChapterStatus(currentProgress?.status),
    newStatus: this.convertToChapterStatus(newStatus),
    score: progressData.submissionPoints ?? undefined,
    lessonWatchRate: progressData.lessonWatchRate
  }
});

// CHAPTER_COMPLETEDイベントの発行
this.emit({
  type: 'CHAPTER_COMPLETED',
  userId,
  courseId,
  chapterId,
  data: {
    score: progressData.submissionPoints ?? 0,
    timeoutOccurred: false
  }
});
          return updatedProgress;
        }
  
        if (progressData.lessonWatchRate !== undefined) {
          updateData.lessonWatchRate = progressData.lessonWatchRate;
          
          if (newStatus === 'NOT_STARTED') {
            newStatus = 'LESSON_IN_PROGRESS';
          }
          
          if (progressData.lessonWatchRate >= 95 && newStatus === 'LESSON_IN_PROGRESS') {
            newStatus = 'LESSON_COMPLETED';
          }
        }
  
        if (progressData.submissionPoints !== undefined) {
          updateData.score = progressData.submissionPoints;
          updateData.completedAt = new Date();
          newStatus = 'COMPLETED';
        }
  
        updateData.status = newStatus;
  
        const updatedProgress = await tx.userChapterProgress.update({
          where: {
            userId_courseId_chapterId: {
              userId,
              courseId,
              chapterId
            }
          },
          data: updateData
        });
  
        this.emit({
          type: 'STATUS_CHANGED',
          userId,
          courseId,
          chapterId,
          data: {
            oldStatus: currentProgress?.status,
            newStatus,
            score: progressData.submissionPoints,
            lessonWatchRate: progressData.lessonWatchRate
          }
        });
  
        if (newStatus === 'COMPLETED') {
          this.emit({
            type: 'CHAPTER_COMPLETED',
            userId,
            courseId,
            chapterId,
            data: {
              score: progressData.submissionPoints ?? 0  
            }
          });
        }
  
        return updatedProgress;
      });
    } catch (error) {
      console.error('Error in updateChapterProgress:', error);
      throw error;
    }
  }
  










  async handleTimeout(userId: string, courseId: string, chapterId?: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const timeoutStatus = await this.checkTimeoutStatus(tx, userId, courseId, chapterId);
        
        if (!timeoutStatus.isTimedOut) {
          return null;
        }

        // コースレベルのタイムアウト
        if (!chapterId) {
          return await this.handleCourseTimeout(tx, userId, courseId, timeoutStatus.timeOutAt);
        }

        // チャプターの取得と存在チェック
        const chapter = await tx.chapter.findUnique({
          where: { id: chapterId }
        });

        if (!chapter) {
          throw new Error('Chapter not found');
        }

        // 最終試験かどうかで処理を分岐
        return chapter.isFinalExam
          ? await this.handleFinalExamTimeout(tx, userId, courseId, chapterId, timeoutStatus.timeOutAt)
          : await this.handleChapterTimeout(tx, userId, courseId, chapterId, timeoutStatus.timeOutAt);
      });
    } catch (error) {
      console.error('Error in handleTimeout:', error);
      throw error;
    }
  }

  // コースタイムアウトの処理
  private async handleCourseTimeout(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
    timeOutAt: Date | undefined
  ) {
    const updatedCourse = await tx.userCourse.update({
      where: {
        userId_courseId: { userId, courseId }
      },
      data: {
        status: 'failed',
        isTimedOut: true,
        timeOutAt
      }
    });

    this.emit({
      type: 'TIMEOUT_OCCURRED',
      userId,
      courseId,
      data: {
        level: 'course',
        timeOutAt: timeOutAt ?? new Date()
      }
    });

    return updatedCourse;
  }

  // 最終試験タイムアウトの処理
  private async handleFinalExamTimeout(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
    chapterId: string,
    timeOutAt: Date | undefined
  ) {
    const examProgress = await tx.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: { userId, courseId, chapterId }
      },
      include: {
        finalExam: true
      }
    });

    if (!examProgress) {
      throw new Error('Exam progress not found');
    }

    // スコア計算
    const totalScore = this.calculateFinalExamScore(examProgress.finalExam);

    // 並行して更新処理を実行
    const [updatedProgress, updatedExam] = await Promise.all([
      // チャプター進捗の更新
      tx.userChapterProgress.update({
        where: { id: examProgress.id },
        data: {
          status: 'COMPLETED',
          score: totalScore,
          isTimedOut: true,
          timeOutAt,
          completedAt: timeOutAt
        }
      }),
      // 試験データの更新
      examProgress.finalExam && tx.finalExamProgress.update({
        where: { id: examProgress.finalExam.id },
        data: {
          examCompletedAt: timeOutAt,
          totalScore
        }
      })
    ]);

    // タイムアウトイベントの発行
    this.emit({
      type: 'TIMEOUT_OCCURRED',
      userId,
      courseId,
      chapterId,
      data: {
        level: 'chapter',
        timeOutAt: timeOutAt ?? new Date()
      }
    });

    return {
      currentProgress: updatedProgress,
      nextChapter: null // 最終試験なので次のチャプターはない
    };
  }

  // 通常チャプタータイムアウトの処理
  private async handleChapterTimeout(
    tx: Prisma.TransactionClient,
    userId: string,
    courseId: string,
    chapterId: string,
    timeOutAt: Date | undefined
  ) {
    const updatedProgress = await tx.userChapterProgress.update({
      where: {
        userId_courseId_chapterId: { userId, courseId, chapterId }
      },
      data: {
        status: 'COMPLETED',
        score: 0,
        isTimedOut: true,
        timeOutAt,
        completedAt: new Date()
      }
    });

    // 次のチャプターを取得
    const chapter = await tx.chapter.findUnique({
      where: { id: chapterId },
      select: { orderIndex: true }
    });

    const nextChapter = chapter && await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: { gt: chapter.orderIndex }
      },
      orderBy: { orderIndex: 'asc' }
    });

    // タイムアウトイベントの発行
    this.emit({
      type: 'TIMEOUT_OCCURRED',
      userId,
      courseId,
      chapterId,
      data: {
        level: 'chapter',
        timeOutAt: timeOutAt ?? new Date()
      }
    });

    return {
      currentProgress: updatedProgress,
      nextChapter
    };
  }
  private calculateFinalExamScore(finalExam: any | null): number {
    if (!finalExam) return 0;

    const sections = [
      finalExam.section1Score,
      finalExam.section2Score,
      finalExam.section3Score
    ];

    return sections
      .filter(score => score !== null)
      .reduce((sum, score) => sum + score, 0);
  }









  

  



async isChapterAvailable(
  userId: string, 
  courseId: string, 
  chapterId: string
): Promise<{
  isAvailable: boolean;
  status: ChapterAvailabilityStatus;
  reason?: string;
}> {
  try {
    // 1. コースとチャプターの基本情報を取得
    const [userCourse, chapter, previousProgress] = await Promise.all([
      this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      }),
      this.prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          course: true
        }
      }),
      this.getPreviousChapterProgress(userId, courseId, chapterId)
    ]);

    // 2. 基本チェック
    if (!chapter || !userCourse) {
      return {
        isAvailable: false,
        status: 'INVISIBLE',
        reason: 'Chapter or course not found'
      };
    }

    // 3. コースのアクティブ状態チェック
    if (userCourse.status !== 'active') {
      return {
        isAvailable: false,
        status: 'COURSE_INACTIVE',
        reason: 'Course is not active'
      };
    }

    // 4. チャプターの表示状態チェック
    if (!chapter.isVisible) {
      return {
        isAvailable: false,
        status: 'INVISIBLE',
        reason: 'Chapter is not visible'
      };
    }

    // 5. 前のチャプターの完了状態チェック
    const previousChapterCompleted = !previousProgress || previousProgress.status === 'COMPLETED';
    
    // 6. リリース時間のチェック
    let isReleaseTimeValid = true;
    if (chapter.releaseTime) {
      isReleaseTimeValid = await this.checkReleaseTime(
        userCourse.startedAt,
        chapter.releaseTime
      );
    }

    // 7. 状態の判定
    if (!previousChapterCompleted) {
      return {
        isAvailable: false,
        status: 'LOCKED_BY_PREVIOUS',
        reason: 'Previous chapter not completed'
      };
    }

    if (!isReleaseTimeValid) {
      return {
        isAvailable: false,
        status: 'LOCKED_BY_RELEASE',
        reason: 'Chapter not yet released'
      };
    }

    // 8. 全ての条件を満たす場合
    return {
      isAvailable: true,
      status: 'AVAILABLE'
    };

  } catch (error) {
    console.error('Error in isChapterAvailable:', error);
    throw error;
  }
}








async handleSubmissionComplete(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    courseId: string;
    chapterId: string;
    submissionId: string;
    score: number;
  }
) {
  try {
    console.log('【提出完了処理開始】', {
      userId: params.userId,
      courseId: params.courseId,
      chapterId: params.chapterId,
      score: params.score
    });

    // 1. 進捗状態の更新
    const updatedProgress = await tx.userChapterProgress.update({
      where: {
        userId_courseId_chapterId: {
          userId: params.userId,
          courseId: params.courseId,
          chapterId: params.chapterId
        }
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: params.score,
        bestSubmissionId: params.submissionId
      }
    });

    // 2. 次のチャプターを取得
    const currentChapter = await tx.chapter.findUnique({
      where: { id: params.chapterId },
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

    if (!currentChapter) {
      throw new Error('Chapter not found');
    }

    // 3. 次のチャプターの解放処理
    const nextChapter = currentChapter.course.chapters.find(
      ch => ch.orderIndex > currentChapter.orderIndex
    );

    if (nextChapter) {
      // 次のチャプターの進捗レコードを作成
      await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId: params.userId,
            courseId: params.courseId,
            chapterId: nextChapter.id
          }
        },
        create: {
          userId: params.userId,
          courseId: params.courseId,
          chapterId: nextChapter.id,
          status: 'NOT_STARTED',
          startedAt: new Date()
        },
        update: {} // 既に存在する場合は更新しない
      });
    } else {
      // コースの完了処理
      await this.handleCourseCompletion(tx, params.userId, params.courseId);
    }

    // イベントの発行
    this.emit({
      type: 'CHAPTER_COMPLETED',
      userId: params.userId,
      courseId: params.courseId,
      chapterId: params.chapterId,
      data: {
        score: params.score,
      }
    });

    this.emit({
      type: 'STATUS_CHANGED',
      userId: params.userId,
      courseId: params.courseId,
      chapterId: params.chapterId,
      data: {
        oldStatus: 'TASK_IN_PROGRESS',
        newStatus: 'COMPLETED',
        score: params.score
      }
    });

    return {
      progress: updatedProgress,
      nextChapter: nextChapter || null
    };

  } catch (error) {
    console.error('Error in handleSubmissionComplete:', error);
    throw error;
  }
}


async restartCourse(userId: string, courseId: string) {
  const RESTARTABLE_STATUS = ['available', 'completed', 'certified', 'failed'] as const;

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
      if (!RESTARTABLE_STATUS.includes(currentCourse.status as any)) {
        throw new Error(`Course with status ${currentCourse.status} cannot be restarted`);
      }

      // 3. 既存のアクティブコースを非アクティブ化
      await tx.userCourse.updateMany({
        where: {
          userId,
          status: 'active',
          NOT: {
            courseId
          }
        },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
      // 4. 全ての進捗データを削除
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
          startedAt: new Date(),
          completedAt: null,
          isTimedOut: false,
          timeOutAt: null
        }
      });

      return updatedCourse;
    });
  } catch (error) {
    console.error('Error in restartCourse:', error);
    throw error;
  }
}




public async unlockNextChapter(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string,
  chapterId: string
): Promise<Chapter | null> {
  try {
    const currentChapter = await tx.chapter.findUnique({
      where: { id: chapterId }
    });

    if (!currentChapter) {
      return null;
    }

    const nextChapter = await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          gt: currentChapter.orderIndex
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    if (!nextChapter) {
      // 次のチャプターが存在しない場合はコース完了処理
      await this.handleCourseCompletion(tx, userId, courseId);
      return null;
    }

    return nextChapter;
  } catch (error) {
    console.error('Error in unlockNextChapter:', error);
    throw error;
  }
}





private emit<T extends keyof ProgressEventType>(
  event: ProgressEvent<T>
): void {
  this.eventEmitter.emit(event.type, event);
}
private async checkAccessibility(
  userId: string,
  courseId: string,
  chapterId: string
): Promise<{
  canAccess: boolean;
  message?: string;
  mode: 'normal' | 'perfect';
}> {
  try {
    // トランザクションを開始
    return await this.prisma.$transaction(async (tx) => {
      // まず基本的な利用可能性をチェック
      const availabilityStatus = await this.isChapterAvailable(
        userId,
        courseId,
        chapterId
      );

      if (!availabilityStatus.isAvailable) {
        return {
          canAccess: false,
          message: availabilityStatus.reason,
          mode: 'normal'
        };
      }

      // チャプターとコースの状態を取得
      const [chapter, userCourse] = await Promise.all([
        tx.chapter.findUnique({
          where: { id: chapterId }
        }),
        tx.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId
            }
          }
        })
      ]);

      if (!chapter || !userCourse) {
        return {
          canAccess: false,
          message: 'Chapter or course not found',
          mode: 'normal'
        };
      }

      // パーフェクトチャプターの判定
      if (chapter.isPerfectOnly) {
        if (userCourse.status === 'perfect') {
          return {
            canAccess: true,
            mode: 'perfect'
          };
        }
        return {
          canAccess: false,
          message: 'This content is only available in perfect mode',
          mode: 'normal'
        };
      }

      // リリースタイムのチェック
      const releaseTimeValid = await this.checkReleaseTimeValidity(
        tx,
        userId,
        courseId,
        chapterId
      );

      if (!releaseTimeValid) {
        return {
          canAccess: false,
          message: 'Content not yet released',
          mode: 'normal'
        };
      }

      // 通常チャプターの場合
      return {
        canAccess: true,
        mode: 'normal'
      };
    });

  } catch (error) {
    console.error('Error in checkAccessibility:', error);
    throw error;
  }

}


private async handleStateTransition(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string,
  chapterId: string,
  progressData: {
    lessonWatchRate?: number;
    submissionPoints?: number;
  }
): Promise<ChapterProgressStatus> {
  try {
    const currentProgress = await tx.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      }
    });

    const timeoutStatus = await this.checkTimeoutStatus(tx, userId, courseId, chapterId);
    if (timeoutStatus.isTimedOut) {
      return 'COMPLETED';
    }

    const currentStatus = currentProgress?.status || 'NOT_STARTED';

    if (progressData.submissionPoints !== undefined) {
      return 'COMPLETED';
    }

    if (progressData.lessonWatchRate !== undefined) {
      if (currentStatus === 'NOT_STARTED') {
        return 'LESSON_IN_PROGRESS';
      }

      if (progressData.lessonWatchRate >= 95 && currentStatus === 'LESSON_IN_PROGRESS') {
        return 'LESSON_COMPLETED';
      }
    }

    return currentStatus as ChapterProgressStatus; // 明示的な型アサーション
  } catch (error) {
    console.error('Error in handleStateTransition:', error);
    return 'NOT_STARTED'; // エラー時のデフォルト値
  }
}


private async findPreviousChapterInCourse(
  courseId: string,
  chapterId: string
): Promise<{ id: string; orderIndex: number } | null> {
  try {
    // 現在のチャプターの情報を取得
    const currentChapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { orderIndex: true, courseId: true }
    });

    if (!currentChapter || currentChapter.courseId !== courseId) {
      throw new Error('Invalid chapter or course ID');
    }

    // 同じコース内で、より小さいorderIndexを持つチャプターを検索
    const previousChapter = await this.prisma.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          lt: currentChapter.orderIndex
        }
      },
      orderBy: {
        orderIndex: 'desc'
      },
      select: {
        id: true,
        orderIndex: true
      }
    });

    return previousChapter;

  } catch (error) {
    console.error('Error in findPreviousChapterInCourse:', error);
    throw error;
  }
}

public async handleCourseStateChange(params: {
  courseId: string;
  changes: {
    timeLimit?: number;
    isPublished?: boolean;
    isArchived?: boolean;
  };
  affectedUserIds?: string[];
}): Promise<void> {
  try {
    const { courseId, changes } = params;

    await this.prisma.$transaction(async (tx) => {
      // タイムリミットの変更があれば、影響を受けるユーザーのタイムアウト日時を更新
      if (changes.timeLimit !== undefined && params.affectedUserIds?.length) {
        await tx.userCourse.updateMany({
          where: {
            courseId,
            userId: { in: params.affectedUserIds },
            status: 'active'
          },
          data: {
            timeOutAt: changes.timeLimit 
              ? this.calculateTimeoutDate(new Date(), changes.timeLimit)
              : null
          }
        });
      }

      // 状態変更イベントの発行
      this.emit({
        type: 'STATUS_CHANGED',
        courseId,
        data: {
          type: 'admin_course_update',
          changes,
          affectedUsers: params.affectedUserIds?.length || 0
        }
      });
    });
  } catch (error) {
    console.error('Error in handleCourseStateChange:', error);
    throw error;
  }
}

public async handleCourseCompletion(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string
): Promise<void> {
  try {
    await tx.userChapterProgress.updateMany({
      where: {
        userId,
        courseId,
        isTimedOut: false  // 未タイムアウトのものを対象
      },
      data: {
        isTimedOut: true,
        timeOutAt: new Date()
      }
    });
    // 1. すべてのチャプター評価を取得
    const chapterEvaluations = await tx.userChapterProgress.findMany({
      where: {
        userId,
        courseId,
      },
      select: {
        chapterId: true,
        score: true,
        completedAt: true
      }
    });

    // 2. コースの最終ステータスを計算
    const finalStatus = this.calculateFinalStatus(chapterEvaluations);

    // 3. コース状態の更新
    await tx.userCourse.update({
      where: {
        userId_courseId: { userId, courseId }
      },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      }
    });

    // 4. バッジの付与
    if (finalStatus === 'perfect') {
      const badgeCondition: BadgeCondition = finalStatus === 'perfect' 
  ? 'COURSE_COMPLETE'
  : 'COURSE_COMPLETE';

      const badge = await tx.badge.findFirst({
        where: {
          condition: badgeCondition
        }
      });

      if (badge) {
        // バッジが未付与の場合のみ付与
        const existingBadge = await tx.userBadge.findFirst({
          where: {
            userId,
            badgeId: badge.id
          }
        });

        if (!existingBadge) {
          await tx.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
              earnedAt: new Date()
            }
          });
        }
      }
    }

    // 5. コース完了イベントの発行
    this.emit({
      type: 'COURSE_COMPLETED',
      userId,
      courseId,
      data: {
        status: finalStatus,
        completedAt: new Date(),
        badgeAwarded: finalStatus === 'perfect' 
      }
    });

  } catch (error) {
    console.error('Error in handleCourseCompletion:', error);
    throw error;
  }
}



private convertToChapterStatus(status: string | null | undefined): ChapterProgressStatus {
  if (!status) return 'NOT_STARTED';
  return this.isValidChapterStatus(status) ? status as ChapterProgressStatus : 'NOT_STARTED';
}

private convertToCourseStatus(status: string | null | undefined): CourseStatus {
  if (!status) return 'restricted';
  if (this.isValidCourseStatus(status)) {
    return status as CourseStatus;
  }
  return 'restricted';
}

private isValidChapterStatus(status: string): boolean {
  return ['NOT_STARTED', 'LESSON_IN_PROGRESS', 'LESSON_COMPLETED', 'TASK_IN_PROGRESS', 'COMPLETED'].includes(status);
}

private isValidCourseStatus(status: string): boolean {
  return ['restricted', 'available', 'active', 'completed', 'certified', 'perfect', 'failed'].includes(status);
}

private calculateFinalStatus(
  chapterEvaluations: { score: number | null }[]
): CourseStatus {
  const scores = chapterEvaluations
    .map(evaluation => evaluation.score ?? 0);  // ===修正後===

  if (scores.every(score => score >= 95)) {
    return 'perfect';
  }
 
  if (scores.every(score => score >= 70)) {
    return 'completed';
  }
  return 'failed';
}
private calculateTimeoutDate(startDate: Date, timeLimit: number): Date {
  return new Date(startDate.getTime() + timeLimit * this.MILLISECONDS_PER_HOUR); // 時間単位に変更
}
private async checkReleaseTimeValidity(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string,
  chapterId: string
): Promise<boolean> {
  const chapter = await tx.chapter.findUnique({
    where: { id: chapterId },
    select: { releaseTime: true }
  });

  const userCourse = await tx.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { startedAt: true }
  });

  if (!chapter?.releaseTime || !userCourse?.startedAt) {
    return true;
  }

  const releaseDate = new Date(userCourse.startedAt.getTime() + 
    chapter.releaseTime * this.MILLISECONDS_PER_HOUR);
  return new Date() >= releaseDate;
}

private async getPreviousChapterProgress(
  userId: string,
  courseId: string,
  chapterId: string
): Promise<UserChapterProgress | null> {
  try {
    const currentChapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { orderIndex: true }
    });

    if (!currentChapter) return null;

    const previousChapter = await this.prisma.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          lt: currentChapter.orderIndex
        }
      },
      orderBy: {
        orderIndex: 'desc'
      }
    });

    if (!previousChapter) return null;

    return this.prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId: previousChapter.id
        }
      }
    });
  } catch (error) {
    console.error('Error in getPreviousChapterProgress:', error);
    throw error;
  }
}

private async checkReleaseTime(
  startDate: Date | null,
  releaseTime: number
): Promise<boolean> {
  if (!startDate || !releaseTime) return true;
  const releaseDate = new Date(startDate.getTime() + releaseTime * this.MILLISECONDS_PER_DAY);
  return new Date() >= releaseDate;
}

public async checkTimeoutStatus(
  tx: Prisma.TransactionClient,
  userId: string,
  courseId: string,
  chapterId?: string
): Promise<{
  isTimedOut: boolean;
  timeOutAt?: Date;
}> {
  const now = new Date();

  if (!chapterId) {
    // コースレベルのタイムアウトチェック
    const userCourse = await tx.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!userCourse?.timeOutAt) {
      return { isTimedOut: false };
    }

    return {
      isTimedOut: now > userCourse.timeOutAt,
      timeOutAt: userCourse.timeOutAt
    };
  }

  // チャプターレベルのタイムアウトチェック
  const progress = await tx.userChapterProgress.findUnique({
    where: {
      userId_courseId_chapterId: { userId, courseId, chapterId }
    }
  });

  if (!progress?.timeOutAt) {
    return { isTimedOut: false };
  }

  return {
    isTimedOut: now > progress.timeOutAt,
    timeOutAt: progress.timeOutAt
  };
}
}



