import { PrismaClient, Prisma } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { 
  CreateChapterDTO, 
  UpdateChapterDTO, 
  ChapterOrderItem,
  ChapterWithTask,
  ChapterContent,
  TaskContent,
  ReferenceFile
} from '../types/chapter';

export class AdminChapterService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;

  private async reorderChapters(tx: Prisma.TransactionClient, courseId: string): Promise<void> {
    const chapters = await tx.chapter.findMany({
      where: { courseId },
      orderBy: { orderIndex: 'asc' },
      select: { id: true }
    });

    await Promise.all(
      chapters.map((chapter, index) =>
        tx.chapter.update({
          where: { id: chapter.id },
          data: { orderIndex: index }
        })
      )
    );
  }

  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
  }

  
  private formatChapterContent(content: ChapterContent | undefined): Prisma.InputJsonValue {
    if (!content) return {};
    return {
      type: content.type,
      videoId: content.videoId,
      transcription: content.transcription || ''
    };
  }
  
  private formatTaskContent(content: TaskContent | undefined): Prisma.InputJsonValue {
    if (!content) return {};
    return {
      description: content.description || ''
    };
  }
  
  private formatReferenceFiles(files: ReferenceFile[] | undefined): Prisma.InputJsonValue {
    if (!files) return [];
    return files.map(file => ({
      id: file.id,
      name: file.name,
      url: file.url,
      type: file.type,
      size: file.size,
      uploadedAt: file.uploadedAt
    }));
  }
  async updateChapter(chapterId: string, data: UpdateChapterDTO): Promise<ChapterWithTask> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { 
        task: {
          select: {
            id: true,
            materials: true,
            task: true,
            evaluationCriteria: true,
            maxPoints: true,
            systemMessage: true,
          }
        }
      }
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const updatedChapter = await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.chapter.update({
        where: { id: chapterId },
        data: {
          title: data.title || chapter.title,
          subtitle: data.subtitle || chapter.subtitle,
          content: data.content 
            ? this.formatChapterContent(data.content) 
            : (chapter.content || Prisma.JsonNull),
          taskContent: data.taskContent 
            ? this.formatTaskContent(data.taskContent) 
            : (chapter.taskContent || Prisma.JsonNull),
          referenceFiles: data.referenceFiles 
            ? this.formatReferenceFiles(data.referenceFiles) 
            : (chapter.referenceFiles || Prisma.JsonNull),
          timeLimit: data.timeLimit ?? chapter.timeLimit,
          releaseTime: data.releaseTime ?? chapter.releaseTime,
          isVisible: data.isVisible ?? chapter.isVisible,
          isPerfectOnly: data.isPerfectOnly ?? chapter.isPerfectOnly,
        },
        include: {
          task: {
            select: {
              id: true,
              materials: true,
              task: true,
              evaluationCriteria: true,
              maxPoints: true,
              systemMessage: true,
            }
          }
        }
      });
      if (data.task && chapter.taskId) {
        const systemMessage = `<materials>
${data.task.materials || ''}
</materials>
<task>
${data.task.task || ''}
</task>
<evaluation_criteria>
${data.task.evaluationCriteria || ''}
</evaluation_criteria>`;

        await tx.task.update({
          where: { id: chapter.taskId },
          data: {
            title: chapter.title, // チャプタータイトルを使用
            materials: data.task.materials || null,
            task: data.task.task || null,
            evaluationCriteria: data.task.evaluationCriteria || null,
            maxPoints: 100, // 固定値として設定
            systemMessage: systemMessage
          }
        });
      }

      return updateResult;
    });

    return updatedChapter as ChapterWithTask;
  }

  async createChapter(courseId: string, data: CreateChapterDTO): Promise<ChapterWithTask> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 現在のチャプターリストを取得して適切なorderIndexを決定
      const chapters = await tx.chapter.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
        select: { orderIndex: true }
      });
  
      // 最初の欠番を探すか、最後の番号+1を使用
      let newOrderIndex = 0;
      for (let i = 0; i <= chapters.length; i++) {
        if (!chapters.find(c => c.orderIndex === i)) {
          newOrderIndex = i;
          break;
        }
      }
  
      const chapter = await tx.chapter.create({
        data: {
          courseId,
          title: data.title,
          subtitle: data.subtitle || '',
          content: this.formatChapterContent(data.content),
          taskContent: this.formatTaskContent(data.taskContent),
          referenceFiles: this.formatReferenceFiles(data.referenceFiles),
          timeLimit: data.timeLimit || 0,
          releaseTime: data.releaseTime || 0,
          orderIndex: newOrderIndex,
          isVisible: true,
          experienceWeight: data.experienceWeight || 100
        },
        include: {
          task: {
            select: {
              id: true,
              materials: true,
              task: true,
              evaluationCriteria: true,
              maxPoints: true,
              systemMessage: true,
            }
          }
        }
      });
  
      if (data.task) {
        const systemMessage = `<materials>
  ${data.task.materials || ''}
  </materials>
  <task>
  ${data.task.task || ''}
  </task>
  <evaluation_criteria>
  ${data.task.evaluationCriteria || ''}
  </evaluation_criteria>`;
  
        const task = await tx.task.create({
          data: {
            courseId,
            title: chapter.title,  // チャプタータイトルを使用
            materials: data.task.materials || null,
            task: data.task.task || null,
            evaluationCriteria: data.task.evaluationCriteria || null,
            maxPoints: data.task.maxPoints || 100,
            systemMessage: systemMessage,
            chapter: {
              connect: { id: chapter.id }
            }
          }
        });
  
        await tx.chapter.update({
          where: { id: chapter.id },
          data: { taskId: task.id }
        });
      }
  
      const finalChapter = await tx.chapter.findUnique({
        where: { id: chapter.id },
        include: {
          task: {
            select: {
              id: true,
              materials: true,
              task: true,
              evaluationCriteria: true,
              maxPoints: true,
              systemMessage: true,
            }
          }
        }
      });
  
      if (!finalChapter) {
        throw new Error('Failed to create chapter');
      }
  
      return finalChapter;
    });
  
    return result as ChapterWithTask;
  }
  async getChapter(chapterId: string): Promise<ChapterWithTask> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        task: {
          select: {
            id: true,
            materials: true,
            task: true,
            evaluationCriteria: true,
            maxPoints: true,
            systemMessage: true,
          }
        }
      }
    });
  
    if (!chapter) {
      throw new Error('Chapter not found');
    }
  
    return {
      ...chapter,
      content: typeof chapter.content === 'string'
        ? JSON.parse(chapter.content as string)
        : chapter.content,
      taskContent: typeof chapter.taskContent === 'string'
        ? JSON.parse(chapter.taskContent as string)
        : chapter.taskContent || null,
      referenceFiles: typeof chapter.referenceFiles === 'string'
        ? JSON.parse(chapter.referenceFiles as string)
        : chapter.referenceFiles || null,
      task: chapter.task ? {
        ...chapter.task,
      } : null
    } as ChapterWithTask;
  }

  async reorderAllChapters(courseId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const chapters = await tx.chapter.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
      });
  
      await Promise.all(
        chapters.map((chapter, index) =>
          tx.chapter.update({
            where: { id: chapter.id },
            data: { orderIndex: index }
          })
        )
      );
    });
  }
  async resetOrderIndices(courseId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const chapters = await tx.chapter.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' }
      });
  
      // orderIndexを0から順番に振り直す
      await Promise.all(
        chapters.map((chapter, index) =>
          tx.chapter.update({
            where: { id: chapter.id },
            data: { orderIndex: index }
          })
        )
      );
    });
  }

  async getChapters(courseId: string): Promise<ChapterWithTask[]> {
    const chapters = await this.prisma.chapter.findMany({
      where: { courseId },
      include: {
        task: {
          select: {
            id: true,
            materials: true,
            task: true,
            evaluationCriteria: true,
            maxPoints: true,
            systemMessage: true,
          }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return chapters.map(chapter => ({
      ...chapter,
      content: typeof chapter.content === 'string'
        ? JSON.parse(chapter.content as string)
        : chapter.content,
      taskContent: typeof chapter.taskContent === 'string'
        ? JSON.parse(chapter.taskContent as string)
        : chapter.taskContent || null,
      referenceFiles: typeof chapter.referenceFiles === 'string'
        ? JSON.parse(chapter.referenceFiles as string)
        : chapter.referenceFiles || null,
    })) as ChapterWithTask[];
  }

  async deleteChapter(chapterId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const chapter = await tx.chapter.findUnique({
        where: { id: chapterId },
        include: { task: true }
      });

      if (!chapter) {
        throw new Error('Chapter not found');
      }

      const courseId = chapter.courseId;

      // 既存の削除処理
      await tx.userChapterProgress.deleteMany({
        where: { chapterId }
      });

      if (chapter.taskId) {
        await tx.task.delete({
          where: { id: chapter.taskId }
        });
      }

      await tx.chapter.delete({
        where: { id: chapterId }
      });

      // 残りのチャプターを再整列
      await this.reorderChapters(tx, courseId);
    });
  }
  async updateChaptersOrder(orders: ChapterOrderItem[]): Promise<void> {
    if (orders.length === 0) return;

    await this.prisma.$transaction(async (tx) => {
      // 一時的に順序を更新
      await Promise.all(
        orders.map(({ id, orderIndex }) =>
          tx.chapter.update({
            where: { id },
            data: { orderIndex }
          })
        )
      );

      // courseIdを取得（最初のチャプターから）
      const firstChapter = await tx.chapter.findUnique({
        where: { id: orders[0].id },
        select: { courseId: true }
      });

      if (firstChapter) {
        // 最終的に0からの連番に整列
        await this.reorderChapters(tx, firstChapter.courseId);
      }
    });
  }
}