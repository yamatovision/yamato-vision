import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';
import { ChapterProgressWithStatus } from '../types/progress';
import { 
  ChapterProgressStatus,
  ChapterStatus,
  CourseStatus
} from '../types/status';
import {
  ChapterWithTask,
  ChapterContent
} from '../types/chapter';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { evaluationService } from '../submissions/evaluationService';

export class UserChapterService extends EventEmitter {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;
  private readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
  }


  

  async getCurrentChapter(userId: string, courseId: string) {
    const userCourse = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
  
    if (!userCourse || !userCourse.isActive) {
      throw new Error('Active course not found');
    }
  
    const chapterProgress = await this.prisma.userChapterProgress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        chapter: {
          include: {
            task: true
          }
        }
      },
      orderBy: {
        chapter: {
          orderIndex: 'asc'
        }
      }
    });
  
    // 現在のチャプターを特定
    const currentChapter = chapterProgress.find(progress => 
      progress.status !== 'COMPLETED'
    );
  
    // 見つからない場合は最後のチャプターを返す
    if (!currentChapter && chapterProgress.length > 0) {
      return chapterProgress[chapterProgress.length - 1];
    }
  
    // タイムアウトチェック
    if (currentChapter) {
      const timeoutStatus = await this.progressManager.checkTimeoutStatus(
        this.prisma,  // トランザクションクライアントとしてPrismaインスタンスを渡す
        userId,
        courseId,
        currentChapter.chapterId
      );
  
      if (timeoutStatus.isTimedOut) {
        await this.progressManager.handleTimeout(
          userId,
          courseId,
          currentChapter.chapterId
        );
      }
    }
  
    return currentChapter;
  }





  async getChapterDetails(userId: string, courseId: string, chapterId: string) {
    const [chapter, progress] = await Promise.all([
      this.prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          task: true
        }
      }),
      this.prisma.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        }
      })
    ]);

    if (!chapter) {
      throw new Error('Chapter not found');
    }
  
    const accessStatus = await this.progressManager.isChapterAvailable(
      userId,
      courseId,
      chapterId
    );

    const navigation = await this.getChapterNavigation(userId, courseId, chapterId);
    const content = this.prepareChapterContent(chapter.content as unknown as ChapterContent);

  
    return {
      ...chapter,
      content,
      progress: progress || {
        status: 'NOT_STARTED',
        lessonWatchRate: 0
      },
      navigation,
      accessInfo: {
        canAccess: accessStatus.isAvailable,
        message: accessStatus.reason
      }
    };
  }

  async updateWatchProgress(
    userId: string,
    courseId: string,
    chapterId: string,
    watchRate: number
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // アクセス権確認
      const accessStatus = await this.progressManager.isChapterAvailable(
        userId,
        courseId,
        chapterId
      );
  
      if (!accessStatus.isAvailable) {
        throw new Error(accessStatus.reason || 'Access denied');
      }
  
      // タイムアウトチェック
      const timeoutStatus = await this.progressManager.checkTimeoutStatus(
        tx,
        userId,
        courseId,
        chapterId
      );
  
      // 現在の進捗を取得
      const currentProgress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        }
      });
  
      // 新しい状態を決定
      let newStatus: ChapterProgressStatus;
      const isFirstAccess = !currentProgress || currentProgress.status === 'NOT_STARTED';
  
      if (watchRate >= 95) {
        newStatus = 'LESSON_COMPLETED';
      } else if (isFirstAccess) {
        newStatus = 'LESSON_IN_PROGRESS';
      } else {
        newStatus = currentProgress.status as ChapterProgressStatus;
      }
  
      // 進捗更新
      const updatedProgress = await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        create: {
          userId,
          courseId,
          chapterId,
          status: newStatus,
          lessonWatchRate: watchRate,
          startedAt: new Date()
        },
        update: {
          status: newStatus,
          lessonWatchRate: watchRate,
          updatedAt: new Date(),
          startedAt: isFirstAccess ? new Date() : currentProgress?.startedAt
        }
      });
  
      // タイムアウト状態の反映
      if (timeoutStatus.isTimedOut && !currentProgress?.isTimedOut) {
        await tx.userChapterProgress.update({
          where: {
            userId_courseId_chapterId: {
              userId,
              courseId,
              chapterId
            }
          },
          data: {
            isTimedOut: true,
            timeOutAt: timeoutStatus.timeOutAt,
            status: 'FAILED',
            completedAt: new Date()
          }
        });
      }
  
      // レッスン完了時の次のチャプター解放チェック
      if (newStatus === 'LESSON_COMPLETED' && currentProgress?.status !== 'LESSON_COMPLETED') {
        await this.progressManager.unlockNextChapter(
          tx,
          userId,
          courseId,
          chapterId
        );
      }
  
      return {
        ...updatedProgress,
        isFirstAccess,
        timeoutStatus: {
          isTimedOut: timeoutStatus.isTimedOut,
          timeOutAt: timeoutStatus.timeOutAt
        }
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

  async recordSubmission(
    userId: string,
    courseId: string,
    chapterId: string,
    submission: {
      content: string;
    }
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // チャプターとタスクの取得
      const chapter = await tx.chapter.findUnique({
        where: { id: chapterId },
        include: {
          task: true
        }
      });

      if (!chapter?.task) {
        throw new Error('Chapter task not found');
      }

      // 進捗状態の確認
      const progress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        }
      });

      // 提出データの保存
      const submissionRecord = await tx.submission.create({
        data: {
          userId,
          taskId: chapter.task.id,
          content: submission.content,
          points: 0,
          feedback: '',
          submittedAt: new Date(),
          evaluatedAt: new Date()
        }
      });

      // AI採点の実行
      const evaluationResult = await evaluationService.evaluateSubmission({
        materials: chapter.task.systemMessage,
        task: chapter.task.description,
        evaluationCriteria: chapter.task.evaluationCriteria ?? '', // nullish coalescing operatorを使用
        submission: submission.content
      });

      // 採点結果の保存
      const updatedSubmission = await tx.submission.update({
        where: { id: submissionRecord.id },
        data: {
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step || null
        }
      });

      // 進捗状態の更新
      const updatedProgress = await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        data: {
          status: 'TASK_IN_PROGRESS',
          score: evaluationResult.evaluation.total_score,
          completedAt: evaluationResult.evaluation.total_score >= 70 ? new Date() : null,
          updatedAt: new Date()
        }
      });

      // 次のチャプターの解放チェック
      const nextChapter = await this.progressManager.unlockNextChapter(
        tx,
        userId,
        courseId,
        chapterId
      );

      // コース完了チェック
      const completed = !nextChapter;
      if (completed) {
        await this.progressManager.handleCourseCompletion(
          tx,
          userId,
          courseId
        );
      }

      return {
        submission: {
          id: updatedSubmission.id,
          content: updatedSubmission.content,
          points: updatedSubmission.points,
          feedback: updatedSubmission.feedback,
          nextStep: updatedSubmission.nextStep
        },
        progress: updatedProgress,
        nextChapter,
        completed,
        evaluation: {
          totalScore: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step
        }
      };
    });
  }


  // Peer Learning Features
  async getChapterPeerSubmissions(
    courseId: string,
    chapterId: string,
    currentUserId: string,
    page: number = 1,
    perPage: number = 10
  ) {
    // アクセス権のチェック
    const userProgress = await this.prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId: currentUserId,
          courseId,
          chapterId
        }
      }
    });

    if (!userProgress || userProgress.status !== 'COMPLETED') {
      throw new Error('Must complete the chapter to view peer submissions');
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { task: true }
    });

    if (!chapter?.taskId) {
      throw new Error('Chapter task not found');
    }

    // 提出物の取得 (status による検索を削除)
    const submissions = await this.prisma.submission.findMany({
      where: {
        taskId: chapter.taskId,
        userId: { not: currentUserId }
      },
      include: {
        task: {
          include: {
            chapter: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rank: true
          }
        }
      },
      skip: (page - 1) * perPage,
      take: perPage
    });

    const total = await this.prisma.submission.count({
      where: {
        taskId: chapter.taskId,
        userId: { not: currentUserId }
      }
    });

    // 可視性の制御
    const visibleSubmissions = submissions.map(submission => {
      const visibilityState = this.determineSubmissionVisibility(
        submission,
        userProgress
      );

      return {
        id: submission.id,
        user: {
          id: submission.user.id,
          name: submission.user.name,
          avatarUrl: submission.user.avatarUrl,
          rank: submission.user.rank
        },
        content: visibilityState.canViewContent ? submission.content : null,
        points: visibilityState.canViewPoints ? submission.points : null,
        feedback: visibilityState.canViewAiFeedback ? submission.feedback : null,
        submittedAt: submission.submittedAt,
        visibilityState
      };
    });

    return {
      submissions: visibleSubmissions,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    };
  }



  
  async getPeerSubmissionDetails(
    submissionId: string,
    userId: string
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            chapter: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rank: true
          }
        }
      }
    });
  
    if (!submission) {
      throw new Error('Submission not found');
    }
  
    if (!submission.task?.chapter) {
      throw new Error('Invalid submission: Chapter information not found');
    }
  
    const { chapter } = submission.task;
    
    // アクセス権のチェック
    const userProgress = await this.prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId: chapter.courseId,
          chapterId: chapter.id
        }
      }
    });
  
    if (!userProgress || userProgress.status !== 'COMPLETED') {
      throw new Error('Must complete the chapter to view submission details');
    }
  

    // 可視性の制御
    const visibilityState = this.determineSubmissionVisibility(
      submission,
      userProgress
    );

    return {
      id: submission.id,
      user: submission.user,
      content: visibilityState.canViewContent ? submission.content : null,
      points: visibilityState.canViewPoints ? submission.points : null,
      feedback: visibilityState.canViewAiFeedback ? submission.feedback : null,
      submittedAt: submission.submittedAt,
      visibilityState
    };
  }



 private async getChapterNavigation(
    userId: string,
    courseId: string,
    chapterId: string
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { orderIndex: true }
    });

    if (!chapter) return null;

    const [previous, next] = await Promise.all([
      this.prisma.chapter.findFirst({
        where: {
          courseId,
          orderIndex: {
            lt: chapter.orderIndex
          }
        },
        orderBy: {
          orderIndex: 'desc'
        },
        include: {
          userProgress: {
            where: { userId }
          }
        }
      }),
      this.prisma.chapter.findFirst({
        where: {
          courseId,
          orderIndex: {
            gt: chapter.orderIndex
          }
        },
        orderBy: {
          orderIndex: 'asc'
        }
      })
    ]);

    return {
      previous: previous ? {
        id: previous.id,
        title: previous.title,
        isCompleted: previous.userProgress[0]?.status === 'COMPLETED'
      } : null,
      next: next ? {
        id: next.id,
        title: next.title,
        isLocked: !previous?.userProgress[0]?.completedAt
      } : null
    };
  }

  private prepareChapterContent(content: ChapterContent) {
    if (!content) return null;

    const cdnUrl = process.env.BUNNY_CDN_URL;
    if (!cdnUrl) return content;

    return {
      ...content,
      videoUrl: content.videoId ? `${cdnUrl}/${content.videoId}` : undefined,
      thumbnailUrl: content.videoId ? `${cdnUrl}/${content.videoId}/thumbnail.jpg` : undefined
    };
  }
  private async validateProgress(
    userId: string,
    courseId: string,
    chapterId: string
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId }
    });
  
    if (!chapter) {
      throw new Error('Chapter not found');
    }
  
    const userCourse = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
  
    if (!userCourse || !userCourse.isActive) {
      throw new Error('Active course enrollment not found');
    }
  
    return {
      chapter,
      userCourse
    };
  }

  private calculateProgressStatus(
    currentStatus: ChapterProgressStatus,
    watchRate: number,
    isTimedOut: boolean
  ): ChapterProgressStatus {
    if (isTimedOut) {
      return 'FAILED';
    }

    if (watchRate >= 95) {
      return 'LESSON_COMPLETED';
    }

    if (watchRate > 0 && currentStatus === 'NOT_STARTED') {
      return 'LESSON_IN_PROGRESS';
    }

    return currentStatus;
  }
  private async handleSubmissionCompletion(
    tx: any,
    userId: string,
    courseId: string,
    chapterId: string,
    points: number,
    isTimedOut: boolean
  ) {
    // 進捗状態の更新
    const progress = await tx.userChapterProgress.update({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: points,
        isTimedOut,
        timeOutAt: isTimedOut ? new Date() : null
      }
    });

    // 次のチャプターの解放チェック
    const nextChapter = await this.progressManager.unlockNextChapter(
      tx,
      userId,
      courseId,
      chapterId
    );

    // コース完了チェック
    const completed = !nextChapter;
    if (completed) {
      await this.progressManager.handleCourseCompletion(
        tx,
        userId,
        courseId
      );
    }

    return {
      progress,
      nextChapter,
      completed
    };
  }


  private determineSubmissionVisibility(
    submission: any,
    userProgress: any
  ) {
    // ベースとなる可視性状態
    const baseState = {
      canViewContent: false,
      canViewPoints: false,
      canViewAiFeedback: false
    };

    // 未完了の場合は何も見えない
    if (userProgress.status !== 'COMPLETED') {
      return baseState;
    }

    // 完了後の可視性制御
    const submissionDate = new Date(submission.submittedAt);
    const completionDate = new Date(userProgress.completedAt);
    const timeDiff = Math.abs(completionDate.getTime() - submissionDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // 提出後30日以内は部分的に見える
    if (daysDiff <= 30) {
      return {
        canViewContent: true,
        canViewPoints: userProgress.score !== null,
        canViewAiFeedback: userProgress.score !== null
      };
    }

    // 30日以降は全て見える
    return {
      canViewContent: true,
      canViewPoints: true,
      canViewAiFeedback: true
    };
  }




  // 内部ヘルパーメソッド
  private async getReleaseCandidates() {
    return await this.prisma.chapter.findMany({
      where: {
        isVisible: true,
        releaseTime: { not: null }
      },
      include: {
        course: {
          include: {
            users: {
              where: { isActive: true }
            }
          }
        }
      }
    });
  }




}


export const userChapterService = new UserChapterService();