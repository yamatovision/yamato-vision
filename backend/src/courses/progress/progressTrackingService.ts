import { PrismaClient } from '@prisma/client';
import { timeoutService } from '../timeouts/timeoutService';
import { 
  ChapterStatus, 
  WATCH_RATE_THRESHOLDS,
  ChapterProgressDetails,
  ProgressTrackingResult 
} from './progressTypes';

const prisma = new PrismaClient();

export class ProgressTrackingService {
  async updateLessonProgress(
    userId: string,
    courseId: string,
    chapterId: string,
    position: number,
    duration: number,
    deviceId?: string
  ): Promise<ProgressTrackingResult> {
    return await prisma.$transaction(async (tx) => {
      // 1. タイムアウトチェック
      const timeoutCheck = await timeoutService.checkChapterTimeout(userId, courseId, chapterId);
      if (timeoutCheck.isTimedOut) {
        return this.handleTimeout(tx, userId, courseId, chapterId);
      }

      // 2. メディア進捗の保存
      const mediaProgress = await tx.userChapterMediaProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId
          }
        },
        update: {
          position,
          deviceId: deviceId || undefined,  // null の代わりに undefined を使用
          updatedAt: new Date()
        },
        create: {
          userId,
          chapterId,
          position,
          deviceId: deviceId || undefined,  // null の代わりに undefined を使用
        }
      });
  

      // 3. 視聴率の計算
      const watchRate = Math.min((position / duration) * 100, 100);

      // 4. 現在の進捗状態を取得
      const currentProgress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        }
      });

      // 5. 新しい状態の判定
      let newStatus = currentProgress?.status as ChapterStatus;
      if (!currentProgress || newStatus === 'ready') {
        newStatus = 'in_progress';
      }
      if (watchRate >= WATCH_RATE_THRESHOLDS.COMPLETION) {
        newStatus = 'lesson_completed';
      }

      // 6. 認定資格の判定
      const certificationEligible = watchRate >= WATCH_RATE_THRESHOLDS.FRAUD_DETECTION;

      // 7. チャプター進捗の更新
      const updatedProgress = await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        update: {
          status: newStatus,
          lessonWatchRate: watchRate,
          startedAt: newStatus === 'in_progress' && !currentProgress?.startedAt 
            ? new Date() 
            : currentProgress?.startedAt || undefined  // null の代わりに undefined を使用
        },
        create: {
          userId,
          courseId,
          chapterId,
          status: newStatus,
          lessonWatchRate: watchRate,
          startedAt: newStatus === 'in_progress' ? new Date() : null
        }
      });

      // 8. 不正検知による認定資格の更新
      if (!certificationEligible) {
        await tx.userCourse.update({
          where: {
            userId_courseId: {
              userId,
              courseId
            }
          },
          data: {
            certificationEligibility: false
          }
        });
      }

      return {
        mediaProgress: {
          ...mediaProgress,
          deviceId: mediaProgress.deviceId || undefined  // null を undefined に変換
        },
        previousStatus: currentProgress?.status as ChapterStatus || 'locked',
        newStatus,
        progress: {
          status: newStatus,
          lessonWatchRate: watchRate,
          startedAt: updatedProgress.startedAt || undefined,
          completedAt: updatedProgress.completedAt || undefined,
          timeoutAt: updatedProgress.timeOutAt || undefined,
          isTimedOut: false,
          certification: {
            eligible: certificationEligible,
            watchRateSufficient: watchRate >= WATCH_RATE_THRESHOLDS.COMPLETION,
            hasValidSubmission: false
          }
        },
        isCompleted: false
      };
    });
  }
 

  // メディア進捗の取得
  async getMediaProgress(userId: string, chapterId: string) {
    const progress = await prisma.userChapterMediaProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId
        }
      }
    });
    return progress?.position || 0;
  }

  // 進捗のリセット
  async resetProgress(userId: string, courseId: string, chapterId: string) {
    return await prisma.$transaction(async (tx) => {
      // メディア進捗をリセット
      await tx.userChapterMediaProgress.delete({
        where: {
          userId_chapterId: {
            userId,
            chapterId
          }
        }
      }).catch(() => null);

      // チャプター進捗をリセット
      await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        data: {
          status: 'ready',
          lessonWatchRate: 0,
          startedAt: null,
          completedAt: null
        }
      });
    });
  }

  // 課題提出の処理
  async handleTaskSubmission(
    userId: string,
    courseId: string,
    chapterId: string,
    score: number
  ): Promise<ProgressTrackingResult> {
    return await prisma.$transaction(async (tx) => {
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

      if (!progress) {
        throw new Error('Chapter progress not found');
      }

      // 経験値の計算
      const experienceGained = Math.floor(score * (progress.chapter.experienceWeight || 100) / 100);

      const updatedProgress = await tx.userChapterProgress.update({
        where: { id: progress.id },
        data: {
          status: 'chapter_completed',
          completedAt: new Date()
        }
      });

      // 経験値の付与
      await tx.user.update({
        where: { id: userId },
        data: {
          experience: {
            increment: experienceGained
          }
        }
      });

      // 次のチャプターの解放処理
      const nextChapter = await this.unlockNextChapter(tx, userId, courseId, progress.chapter.orderIndex);

      return {
        previousStatus: progress.status as ChapterStatus,
        newStatus: 'chapter_completed',
        progress: {
          status: 'chapter_completed',
          lessonWatchRate: progress.lessonWatchRate,
          startedAt: progress.startedAt || undefined,
          completedAt: progress.completedAt || undefined,
          timeoutAt: progress.timeOutAt || undefined,
          isTimedOut: false,
          certification: {
            eligible: true,
            watchRateSufficient: progress.lessonWatchRate >= WATCH_RATE_THRESHOLDS.COMPLETION,
            hasValidSubmission: true
          }
        },
        experienceGained,
        isCompleted: true,
        nextChapterId: nextChapter?.id  // 修正: nextChapter から id を取得
      };
    });
  }



  private async handleTimeout(
    tx: any,
    userId: string,
    courseId: string,
    chapterId: string
  ): Promise<ProgressTrackingResult> {
    const progress = await tx.userChapterProgress.update({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      data: {
        status: 'chapter_completed',
        isTimedOut: true,
        timeOutAt: new Date()
      }
    });

    // メディア進捗も取得（結果に含めるため）
    const mediaProgress = await tx.userChapterMediaProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId
        }
      }
    });

    return {
      mediaProgress,
      previousStatus: progress.status as ChapterStatus,
      newStatus: 'chapter_completed',
      progress: {
        status: 'chapter_completed',
        lessonWatchRate: progress.lessonWatchRate,
        startedAt: progress.startedAt || undefined,    // undefined変換を追加
        completedAt: progress.completedAt || undefined, // undefined変換を追加
        timeoutAt: progress.timeOutAt || undefined,    // undefined変換を追加
        isTimedOut: true,
        certification: {
          eligible: true,
          watchRateSufficient: progress.lessonWatchRate >= WATCH_RATE_THRESHOLDS.COMPLETION,
          hasValidSubmission: false
        }
      },
      isCompleted: true
    };
  }

  private async unlockNextChapter(
    tx: any,
    userId: string,
    courseId: string,
    currentOrderIndex: number
  ) {
    const nextChapter = await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          gt: currentOrderIndex
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    if (nextChapter) {
      await tx.userChapterProgress.create({
        data: {
          userId,
          courseId,
          chapterId: nextChapter.id,
          status: 'ready',
          lessonWatchRate: 0
        }
      });
      return nextChapter;
    } else {
      // 最終チャプター完了時のコース完了処理
      await this.handleCourseCompletion(tx, userId, courseId);
      return null;
    }
  }

  private async handleCourseCompletion(tx: any, userId: string, courseId: string) {
    const courseProgress = await this.calculateCourseProgress(userId, courseId);
    
    await tx.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: courseProgress.badge || 'completed',
        completedAt: new Date(),
        isActive: false
      }
    });
  }

  private async calculateCourseProgress(userId: string, courseId: string) {
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      include: {
        userProgress: {
          where: { userId }
        },
        task: {
          include: {
            submissions: {
              where: { userId },
              orderBy: { submittedAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    let totalPossibleExp = 0;
    let totalEarnedExp = 0;
    let allTasksSubmitted = true;

    for (const chapter of chapters) {
      const progress = chapter.userProgress[0];
      const submission = chapter.task?.submissions[0];

      if (!submission) {
        allTasksSubmitted = false;
      }

      const weight = chapter.experienceWeight || 100;
      totalPossibleExp += weight;

      if (progress?.status === 'chapter_completed' && submission?.points) {
        totalEarnedExp += (submission.points / 100) * weight;
      }
    }

    const achievementRate = totalPossibleExp > 0 
      ? (totalEarnedExp / totalPossibleExp) * 100 
      : 0;

    return {
      achievementRate,
      totalPossibleExp,
      totalEarnedExp,
      allTasksSubmitted,
      badge: this.determineBadgeType(achievementRate, allTasksSubmitted)
    };
  }

  private determineBadgeType(
    achievementRate: number, 
    allTasksSubmitted: boolean
  ): 'perfect' | 'certified' | 'completed' | null {
    if (achievementRate >= 95) return 'perfect';
    if (achievementRate >= 85) return 'certified';
    if (allTasksSubmitted) return 'completed';
    return null;
  }
}

export const progressTrackingService = new ProgressTrackingService();

