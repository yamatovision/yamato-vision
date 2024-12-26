import { PrismaClient } from '@prisma/client';
import { 
  CreateChapterDTO, 
  UpdateChapterDTO, 
  ChapterOrderItem, 
  ChapterWithTask,
  ChapterAccessStatus
} from './chapterTypes';

const prisma = new PrismaClient();export class ChapterService {
  // チャプター作成
  async createChapter(courseId: string, data: CreateChapterDTO) {
    try {
      // トランザクションで Chapter と Task を作成
      const result = await prisma.$transaction(async (tx) => {
        // 現在のコースの最大 orderIndex を取得
        const maxOrderIndex = await tx.chapter.findFirst({
          where: { courseId },
          orderBy: { orderIndex: 'desc' },
          select: { orderIndex: true }
        });

        // 新しい orderIndex を設定（既存の最大値 + 1、または 0）
        const newOrderIndex = (maxOrderIndex?.orderIndex ?? -1) + 1;

        // 1. まずChapterを作成
        const chapter = await tx.chapter.create({
          data: {
            courseId,
            title: data.title,
            subtitle: data.subtitle,
            content: JSON.stringify(data.content),
            timeLimit: data.timeLimit || 0,
            releaseTime: data.releaseTime || 0,
            orderIndex: newOrderIndex,
            isVisible: true
          }
        });

        // 2. 次にTaskを作成し、Chapterと関連付け
        const task = await tx.task.create({
          data: {
            courseId,
            title: data.title,
            description: data.task.description,
            systemMessage: data.task.systemMessage,
            referenceText: data.task.referenceText,
            maxPoints: data.task.maxPoints || 100,
            chapter: {
              connect: { id: chapter.id }
            }
          }
        });

        // 3. ChapterのtaskIdを更新
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
  async updateChapter(chapterId: string, data: UpdateChapterDTO) {
    const updateData: any = {
      ...(data.title && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.content && { content: JSON.stringify(data.content) }),
      ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
      ...(data.releaseTime !== undefined && { releaseTime: data.releaseTime }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      ...(data.isFinalExam !== undefined && { isFinalExam: data.isFinalExam })
    };

    if (data.task) {
      await prisma.task.update({
        where: { id: await this.getTaskIdByChapterId(chapterId) },
        data: {
          description: data.task.description,
          systemMessage: data.task.systemMessage,
          referenceText: data.task.referenceText,
          maxPoints: data.task.maxPoints
        }
      });
    }

    return prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
      include: {
        task: true
      }
    });
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
    // チャプター進捗を完了に更新
    await tx.userChapterProgress.upsert({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        chapterId,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // 次のチャプターを開始
    const nextChapter = await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          gt: (await tx.chapter.findUnique({ where: { id: chapterId } }))?.orderIndex
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    if (nextChapter) {
      await tx.userChapterProgress.create({
        data: {
          userId,
          courseId,
          chapterId: nextChapter.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    } else {
      // コースの完了処理
      await tx.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    return nextChapter;
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

async getChapter(chapterId: string): Promise<ChapterWithTask | null> {
  try {
    // デバッグログ：クエリ開始
    console.log('Getting chapter from database:', { chapterId });

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        task: true
      }
    });

    // デバッグログ：クエリ結果
    console.log('Database query result:', {
      found: !!chapter,
      chapterId,
      title: chapter?.title
    });

    return chapter;
  } catch (error) {
    console.error('Error in getChapter service:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      chapterId
    });
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

  // チャプターアクセス状態チェック
  async checkChapterAccess(
    userId: string, 
    courseId: string, 
    chapterId: string
  ): Promise<ChapterAccessStatus> {
    const chapter = await this.getChapter(chapterId);
    if (!chapter) {
      return { canAccess: false, message: 'チャプターが見つかりません' };
    }

    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!userCourse) {
      return { canAccess: false, message: 'コースに登録されていません' };
    }

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


    if (chapter.releaseTime) {
      const courseStartTime = userCourse.startedAt;
      // Nullチェックを追加
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

    if (chapter.timeLimit && chapter.taskId) {
      const submission = await prisma.submission.findFirst({
        where: {
          userId,
          taskId: chapter.taskId
        }
      });
    
      if (submission && userCourse.startedAt) { // Nullチェックを追加
        const submissionTime = submission.submittedAt;
        const timeDiff = submissionTime.getTime() - userCourse.startedAt.getTime();
        const isOverTime = timeDiff > (chapter.timeLimit * 60 * 1000);
        return { 
          canAccess: true, 
          timePenalty: isOverTime 
        };
      }
    }

    return { canAccess: true };
  }
}

export const chapterService = new ChapterService();
