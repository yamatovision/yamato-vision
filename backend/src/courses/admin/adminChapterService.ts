import { PrismaClient, Prisma } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { 
  CreateChapterDTO, 
  UpdateChapterDTO, 
  ChapterOrderItem,
  ChapterWithTask,
  ChapterContent
} from '../types/chapter';

export class AdminChapterService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;

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

  async createChapter(courseId: string, data: CreateChapterDTO): Promise<ChapterWithTask> {
    const result = await this.prisma.$transaction(async (tx) => {
      const maxOrderIndex = await tx.chapter.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true }
      });

      const newOrderIndex = (maxOrderIndex?.orderIndex ?? -1) + 1;
      const contentValue = this.formatChapterContent(data.content);

      const chapter = await tx.chapter.create({
        data: {
          courseId,
          title: data.title,
          subtitle: data.subtitle || '',
          content: contentValue,
          timeLimit: data.timeLimit || 0,
          releaseTime: data.releaseTime || 0,
          orderIndex: newOrderIndex,
          isVisible: true
        }
      });

      if (data.task) {
        const task = await tx.task.create({
          data: {
            courseId,
            title: data.title,
            description: data.task.description || '',
            systemMessage: data.task.systemMessage || '',
            referenceText: data.task.referenceText || '',
            maxPoints: data.task.maxPoints || 100,
            evaluationCriteria: null,
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
        include: { task: true }
      });

      if (!finalChapter) {
        throw new Error('Failed to create chapter');
      }

      return finalChapter;
    });

    return result as ChapterWithTask;
  }

  async updateChapter(chapterId: string, data: UpdateChapterDTO): Promise<ChapterWithTask> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { task: true }
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const contentValue: Prisma.InputJsonValue = data.content 
      ? this.formatChapterContent(data.content)
      : (chapter.content as Prisma.InputJsonValue);

    const updatedChapter = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: data.title || chapter.title,
        subtitle: data.subtitle || chapter.subtitle,
        content: contentValue,
        timeLimit: data.timeLimit ?? chapter.timeLimit,
        releaseTime: data.releaseTime ?? chapter.releaseTime,
        isVisible: data.isVisible ?? chapter.isVisible,
        isPerfectOnly: data.isPerfectOnly ?? chapter.isPerfectOnly
      },
      include: { task: true }
    });

    return updatedChapter as ChapterWithTask;
  }







  async getChapter(chapterId: string): Promise<ChapterWithTask> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        task: {
          select: {
            id: true,
            courseId: true,
            title: true,
            description: true,
            systemMessage: true,
            referenceText: true,
            maxPoints: true,
            createdAt: true,
            updatedAt: true,
            evaluationCriteria: true
          }
        }
      }
    });
  
    if (!chapter) {
      throw new Error('Chapter not found');
    }
  
    // データの変換処理を追加
    const formattedChapter = {
      ...chapter,
      content: typeof chapter.content === 'string'
        ? JSON.parse(chapter.content)
        : chapter.content,
      taskContent: typeof chapter.taskContent === 'string'
        ? JSON.parse(chapter.taskContent)
        : chapter.taskContent || { description: '' },
      task: chapter.task ? {
        ...chapter.task,
        description: chapter.task.description || '',
        systemMessage: chapter.task.systemMessage || '',
        referenceText: chapter.task.referenceText || ''
      } : null,
      experienceWeight: chapter.experienceWeight || 100
    };
  
    return formattedChapter as ChapterWithTask;
  }

  async getChapters(courseId: string): Promise<ChapterWithTask[]> {
    const chapters = await this.prisma.chapter.findMany({
      where: { courseId },
      include: {
        task: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return chapters as unknown as ChapterWithTask[];
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

      // 関連する進捗データを削除
      await tx.userChapterProgress.deleteMany({
        where: { chapterId }
      });

      // タスクが存在する場合は削除
      if (chapter.taskId) {
        await tx.task.delete({
          where: { id: chapter.taskId }
        });
      }

      // チャプターを削除
      await tx.chapter.delete({
        where: { id: chapterId }
      });
    });
  }

  async updateChaptersOrder(orders: ChapterOrderItem[]): Promise<void> {
    await this.prisma.$transaction(
      orders.map(({ id, orderIndex }) =>
        this.prisma.chapter.update({
          where: { id },
          data: { orderIndex }
        })
      )
    );
  }

}
