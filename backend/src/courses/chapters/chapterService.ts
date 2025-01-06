import { PrismaClient } from '@prisma/client';
import { timeoutService } from '../timeouts/timeoutService';
import { CourseStatus } from '../courseTypes';  // 追加

import { 
  CreateChapterDTO, 
  UpdateChapterDTO, 
  ChapterOrderItem, 
  ChapterWithTask,
  ChapterAccessStatus,
  ChapterProgressStatus,
  ChapterEvaluationStatus,  // 追加
  SubmissionVisibilityState
} from './chapterTypes';

const prisma = new PrismaClient();


export class ChapterService {


  async updateChapterProgress(
    userId: string,
    courseId: string,
    chapterId: string,
    lessonWatchRate?: number,
    submissionPoints?: number
  ) {
    const progress = await prisma.$transaction(async (tx) => {
      const current = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        }
      });

      if (!current) {
        throw new Error('Chapter progress not found');
      }

      // タイムアウトチェック
      const timeoutCheck = await timeoutService.checkChapterTimeout(
        userId,
        courseId,
        chapterId
      );

      let newStatus = current.status;
      let completedAt = current.completedAt;

      // 状態遷移ロジック
      if (timeoutCheck.isTimedOut) {
        newStatus = 'COMPLETED';
        completedAt = new Date();
      } else if (lessonWatchRate !== undefined) {
        if (lessonWatchRate >= 95) {
          if (current.status === 'LESSON_IN_PROGRESS') {
            newStatus = 'LESSON_COMPLETED';
          }
        } else if (current.status === 'NOT_STARTED') {
          newStatus = 'LESSON_IN_PROGRESS';
        }
      }

      if (submissionPoints !== undefined && !timeoutCheck.isTimedOut) {
        if (current.status === 'LESSON_COMPLETED') {
          newStatus = 'TASK_IN_PROGRESS';
        }
        if (submissionPoints >= 70) {
          newStatus = 'COMPLETED';
          completedAt = new Date();
        }
      }

      // 進捗更新
      const updated = await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        data: {
          status: newStatus,
          lessonWatchRate: lessonWatchRate ?? current.lessonWatchRate,
          score: submissionPoints ?? current.score,
          completedAt,
          isTimedOut: timeoutCheck.isTimedOut,
          timeOutAt: timeoutCheck.isTimedOut ? new Date() : null
        }
      });

      // 完了時は次のチャプターを解放
      if (newStatus === 'COMPLETED' && !current.completedAt) {
        await this.unlockNextChapter(tx, userId, courseId, chapterId);
      }

      return updated;
    });

    return progress;
  }

  // 新規追加: 評価状態の計算
  private calculateEvaluationStatus(
    points: number | null,
    isTimedOut: boolean
  ): ChapterEvaluationStatus {
    if (isTimedOut && !points) return 'FAILED';
    if (!points) return 'PASS';
    if (points >= 95) return 'PERFECT';
    if (points >= 85) return 'GREAT';
    if (points >= 70) return 'GOOD';
    return 'PASS';
  }

  // 新規追加: 次のチャプター解放
  private async unlockNextChapter(
    tx: any,
    userId: string,
    courseId: string,
    currentChapterId: string
  ) {
    const currentChapter = await tx.chapter.findUnique({
      where: { id: currentChapterId },
      select: { orderIndex: true }
    });

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

    if (nextChapter) {
      await tx.userChapterProgress.create({
        data: {
          userId,
          courseId,
          chapterId: nextChapter.id,
          status: 'NOT_STARTED',
          lessonWatchRate: 0
        }
      });
    }
  }

async createChapter(courseId: string, data: CreateChapterDTO) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 最大 orderIndex の取得
      const maxOrderIndex = await tx.chapter.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });

      const newOrderIndex = (maxOrderIndex?.orderIndex ?? -1) + 1;

      // 1. Chapter作成 - 必須フィールドを最小限に
      const chapter = await tx.chapter.create({
        data: {
          courseId,
          title: data.title,
          subtitle: data.subtitle || '',
          content: {
            type: data.content?.type || 'video',
            videoId: data.content?.videoId || '',
            transcription: data.content?.transcription || ''
          },
          timeLimit: data.timeLimit || 0,
          releaseTime: data.releaseTime || 0,
          orderIndex: newOrderIndex,
          isVisible: true
        }
      });

      // 2. Task作成 - 必須フィールドを最小限に
      const task = await tx.task.create({
        data: {
          courseId,
          title: data.title,
          description: data.task?.description || '',
          systemMessage: data.task?.systemMessage || '',
          referenceText: data.task?.referenceText || '',
          maxPoints: data.task?.maxPoints || 100,
          chapter: {
            connect: { id: chapter.id }
          }
        }
      });

      // 3. ChapterのtaskId更新
      return tx.chapter.update({
        where: { id: chapter.id },
        data: { taskId: task.id },
        include: { task: true }
      });
    });

    return result;
  } catch (error) {
    console.error('Error in createChapter:', error);
    throw error;
  }
}

  // チャプター更新
// chapterService.ts の updateChapter メソッドを修正
private getFinalStatus(isPerfect: boolean): CourseStatus {
  if (isPerfect) {
    return 'perfect';  // 小文字に変更
  }
  return 'completed';  // 小文字に変更
}
// chapterService.ts
async updateChapter(chapterId: string, data: UpdateChapterDTO) {
  try {
    // デバッグログ追加
    console.log('Updating chapter with data:', {
      chapterId,
      taskContent: data.taskContent
    });

    const updateData: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
      ...(data.releaseTime !== undefined && { releaseTime: data.releaseTime }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      ...(data.isFinalExam !== undefined && { isFinalExam: data.isFinalExam }),
      ...(data.isPerfectOnly !== undefined && { isPerfectOnly: data.isPerfectOnly })
    };

    // content の処理
    if (data.content) {
      updateData.content = typeof data.content === 'string'
        ? JSON.parse(data.content)
        : data.content;
    }

    // taskContent の処理（独立したフィールドとして扱う）
    if (data.taskContent) {
      // taskContentが文字列の場合はパースし、オブジェクトの場合はそのまま使用
      const parsedTaskContent = typeof data.taskContent === 'string'
        ? JSON.parse(data.taskContent)
        : data.taskContent;

      // データベースに保存する前に構造を確認
      console.log('Saving taskContent:', parsedTaskContent);

      updateData.taskContent = parsedTaskContent;
    }

    // Taskの更新処理
    if (data.task) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { taskId: true }
      });

      if (chapter?.taskId) {
        await prisma.task.update({
          where: { id: chapter.taskId },
          data: {
            ...(data.task.description !== undefined && { 
              description: data.task.description 
            }),
            ...(data.task.systemMessage !== undefined && { 
              systemMessage: data.task.systemMessage 
            }),
            ...(data.task.referenceText !== undefined && { 
              referenceText: data.task.referenceText 
            }),
            ...(data.task.maxPoints !== undefined && { 
              maxPoints: data.task.maxPoints 
            })
          }
        });
      }
    }

    // デバッグログ追加
    console.log('Final update data:', updateData);

    // Chapterの更新を実行
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
      include: {
        task: true
      }
    });

    // デバッグログ追加
    console.log('Updated chapter:', updatedChapter);

    return updatedChapter;
  } catch (error) {
    console.error('Error in updateChapter:', error);
    throw error;
  }
}



  // Helper method to get taskId by chapterId
  private async getTaskIdByChapterId(chapterId: string): Promise<string> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { taskId: true }
    });
    if (!chapter?.taskId) throw new Error('Task not found for this chapter');
    return chapter.taskId;
  }

  // チャプター削除
  async deleteChapter(chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { taskId: true }
    });

    if (chapter?.taskId) {
      await prisma.task.delete({
        where: { id: chapter.taskId }
      });
    }

    return prisma.chapter.delete({
      where: { id: chapterId }
    });
  }

// backend/src/courses/chapters/chapterService.ts に追加
async completeChapter(userId: string, courseId: string, chapterId: string) {
  return await prisma.$transaction(async (tx) => {
    const userChapter = await tx.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId,
        }
      },
      include: {
        chapter: {
          include: {
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
        }
      }
    });

    if (!userChapter) {
      throw new Error('Chapter progress not found');
    }

    const submission = userChapter.chapter.task?.submissions[0];
    const isPerfect = submission?.points ? submission.points >= 95 : false;


    await tx.userChapterProgress.update({
      where: { id: userChapter.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      }
    });

    // 次のチャプター取得
    const nextChapter = await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          gt: userChapter.chapter.orderIndex
        }
      },
      orderBy: {
        orderIndex: 'asc',
      }
    });

    if (nextChapter) {
      await tx.userChapterProgress.create({
        data: {
          userId,
          courseId,
          chapterId: nextChapter.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        }
      });
    } else {
      // コース完了処理
      const allChaptersResult = await this.checkAllChaptersPerfect(tx, userId, courseId);
      
      await tx.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        },
        data: {
          status: this.getFinalStatus(allChaptersResult.allPerfect),
          completedAt: new Date(),
          isActive: false
        }
      });      
    }

    return nextChapter;
  });
}

private async checkAllChaptersPerfect(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  userId: string,
  courseId: string
) {
  const chapters = await tx.chapter.findMany({
    where: { courseId },
    include: {
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

  const allPerfect = chapters.every(chapter => {
    const submission = chapter.task?.submissions[0];
    return submission?.points ? submission.points >= 95 : false;
  });

  return { allPerfect };
}

// chapterService.ts
async startChapter(userId: string, courseId: string, chapterId: string) {
  const exists = await prisma.userChapterProgress.findUnique({
    where: {
      userId_courseId_chapterId: {
        userId,
        courseId,
        chapterId
      }
    }
  });

  if (exists) {
    return await this.updateChapterProgress(userId, courseId, chapterId);
  }

  return await prisma.userChapterProgress.create({
    data: {
      userId,
      courseId,
      chapterId,
      status: 'NOT_STARTED',
      lessonWatchRate: 0
    }
  });
}

async updateWatchProgress(
  userId: string,
  courseId: string,
  chapterId: string,
  watchRate: number
) {
  return await this.updateChapterProgress(
    userId,
    courseId,
    chapterId,
    watchRate
  );
}

async updateChapterVisibility(chapterId: string, isVisible: boolean) {
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { isVisible }
  });
}

async updateChapterPerfectOnly(chapterId: string, isPerfectOnly: boolean) {
  return prisma.chapter.update({
    where: { id: chapterId },
    data: { isPerfectOnly }
  });
}




async getChapters(courseId: string): Promise<ChapterWithTask[]> {
  try {
    console.log('Fetching chapters for course:', { courseId });

    const chapters = await prisma.chapter.findMany({
      where: { 
        courseId,
        isVisible: true  // 可視状態のチャプターのみ取得
      },
      include: {
        task: true
      },
      orderBy: {
        orderIndex: 'asc'  // 順序順に取得
      }
    });

    console.log('Chapters found:', {
      courseId,
      count: chapters.length
    });

    // contentのパース処理を追加
    const parsedChapters = chapters.map(chapter => ({
      ...chapter,
      content: typeof chapter.content === 'string' 
        ? JSON.parse(chapter.content) 
        : chapter.content
    }));

    return parsedChapters;
  } catch (error) {
    console.error('Error fetching chapters:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      courseId
    });
    throw error;
  }
}
async getChapter(chapterId: string, userId?: string): Promise<ChapterWithTask | null> {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        task: true,
        userProgress: userId ? {
          where: { userId }
        } : undefined
      }
    });

    if (!chapter) return null;

    // progressの取得を同時に行う
    if (userId) {
      const progress = await prisma.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId: chapter.courseId,
            chapterId: chapter.id
          }
        }
      });

      return {
        ...chapter,
        userProgress: progress ? [progress] : []
      };
    }

    return chapter;
  } catch (error) {
    console.error('Error in getChapter service:', error);
    throw error;
  }
}

  // チャプター順序更新
  async updateChaptersOrder(orders: ChapterOrderItem[]) {
    const updates = orders.map(({ id, orderIndex }) =>
      prisma.chapter.update({
        where: { id },
        data: { orderIndex }
      })
    );

    await prisma.$transaction(updates);
  }


async checkChapterAccess(
  userId: string, 
  courseId: string, 
  chapterId: string
): Promise<ChapterAccessStatus> {
  const chapter = await this.getChapter(chapterId);
  if (!chapter) {
    return { canAccess: false, message: 'チャプターが見つかりません' };
  }

  // Perfect専用チャプターのチェックを追加
  if (chapter.isPerfectOnly) {
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!userCourse || userCourse.status !== 'perfect') {
      return {
        canAccess: false,
        message: 'このチャプターはPerfect達成者専用です'
      };
    }
  }

    // コースのタイムアウトチェック
    const courseTimeout = await timeoutService.checkCourseTimeout(userId, courseId);
    if (courseTimeout.isTimedOut) {
      return { 
        canAccess: false, 
        message: 'コースの期限が終了しています。再購入が必要です。'
      };
    }

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

    if (!userCourse) {
      return { canAccess: false, message: 'コースに登録されていません' };
    }

    // パーフェクト達成者は常にアクセス可能
    if (userCourse.status === 'perfect') {
      return { canAccess: true };
    }


    if (['COMPLETED', 'CERTIFIED', 'PERFECT'].includes(userCourse.status)) {
      return { canAccess: true };
    }


    // 前のチャプターの完了チェック
    if (chapter.orderIndex > 0) {
      const previousChapter = await prisma.chapter.findFirst({
        where: {
          courseId,
          orderIndex: chapter.orderIndex - 1
        }
      });

      if (previousChapter?.taskId) {
        const previousSubmission = await prisma.submission.findFirst({
          where: {
            userId,
            taskId: previousChapter.taskId
          }
        });

        if (!previousSubmission) {
          return { 
            canAccess: false, 
            message: '前のチャプターを完了させてください' 
          };
        }
      }
    }

    // チャプターの解放時間チェック
    if (chapter.releaseTime) {
      const courseStartTime = userCourse.startedAt;
      if (!courseStartTime) {
        return { 
          canAccess: false, 
          message: 'コースが開始されていません' 
        };
      }
      const releaseTime = new Date(courseStartTime.getTime() + (chapter.releaseTime * 60 * 1000));
      
      if (new Date() < releaseTime) {
        return { 
          canAccess: false, 
          message: `このチャプターは ${releaseTime.toLocaleString()} に解放されます` 
        };
      }
    }

    // チャプターのタイムアウトチェック
    const chapterTimeout = await timeoutService.checkChapterTimeout(userId, courseId, chapterId);
    if (chapterTimeout.isTimedOut) {
      return {
        canAccess: true,
        timePenalty: true,
        message: 'このチャプターは制限時間を超過しています。提出は減点対象となります。'
      };
    }

    return { canAccess: true };
  }
}


export const chapterService = new ChapterService();
