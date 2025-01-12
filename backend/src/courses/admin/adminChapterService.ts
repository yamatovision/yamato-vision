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


interface ExamSection {
  title: string;
  task: {
    materials: string;
    task: string;
    evaluationCriteria: string;
  };
}

interface ExamSettings {
  sections: ExamSection[];
}

interface CreateExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime: number;
  examSettings: ExamSettings;
}

interface UpdateExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime: number;
  examSettings: ExamSettings;
}


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
  
  private formatTaskContent(content: TaskContent | undefined): Record<string, any> {
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

  async createChapter(courseId: string, data: CreateChapterDTO): Promise<ChapterWithTask> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 現在のチャプターリストを取得して適切なorderIndexを決定
      const chapters = await tx.chapter.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
        select: { orderIndex: true }
      });
  
      let newOrderIndex = 0;
      for (let i = 0; i <= chapters.length; i++) {
        if (!chapters.find(c => c.orderIndex === i)) {
          newOrderIndex = i;
          break;
        }
      }
  
      // チャプターの作成
      const chapter = await tx.chapter.create({
        data: {
          courseId,
          title: data.title,
          subtitle: data.subtitle || '',
          content: this.formatChapterContent(data.content) as Prisma.InputJsonValue,
          taskContent: data.taskContent 
            ? (this.formatTaskContent(data.taskContent) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          referenceFiles: this.formatReferenceFiles(data.referenceFiles),
          timeLimit: data.timeLimit || 0,
          releaseTime: data.releaseTime || 0,
          orderIndex: newOrderIndex,
          isVisible: true,
          experienceWeight: data.experienceWeight || 100
        }
      });
  
      // 通常の課題タスクが設定されている場合
      if (data.task) {
        const task = await tx.task.create({
          data: {
            courseId: chapter.courseId,
            materials: data.task.materials || '',
            task: data.task.task || '',
            evaluationCriteria: data.task.evaluationCriteria || '',
            maxPoints: data.task.maxPoints,
            systemMessage: '',  // 空文字列でも必須フィールドを満たす
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
  
      return await tx.chapter.findUnique({
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
    });
  
    if (!result) {
      throw new Error('Failed to create chapter');
    }
  
    return result as ChapterWithTask;
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
  
    // 最終試験チャプターの更新を防ぐ
    if (chapter.isFinalExam) {
      throw new Error('Cannot update exam chapter with regular update method');
    }
  
    const updatedChapter = await this.prisma.$transaction(async (tx) => {
      // チャプターの更新
      const updateResult = await tx.chapter.update({
        where: { id: chapterId },
        data: {
          title: data.title !== undefined ? data.title : chapter.title,
          subtitle: data.subtitle !== undefined ? data.subtitle : chapter.subtitle,
          content: data.content 
            ? this.formatChapterContent(data.content) 
            : (chapter.content as Prisma.InputJsonValue),
          taskContent: data.taskContent 
            ? this.formatTaskContent(data.taskContent)
            : (chapter.taskContent as Prisma.InputJsonValue),
          referenceFiles: data.referenceFiles 
            ? this.formatReferenceFiles(data.referenceFiles) 
            : (chapter.referenceFiles ?? Prisma.JsonNull),
          timeLimit: data.timeLimit !== undefined ? data.timeLimit : chapter.timeLimit,
          releaseTime: data.releaseTime !== undefined ? data.releaseTime : chapter.releaseTime,
          isVisible: data.isVisible !== undefined ? data.isVisible : chapter.isVisible,
          isPerfectOnly: data.isPerfectOnly !== undefined ? data.isPerfectOnly : chapter.isPerfectOnly,
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
  
      // 課題タスクの更新
      if (data.task) {
        if (chapter.taskId) {
          // 既存のタスクを更新
          await tx.task.update({
            where: { id: chapter.taskId },
            data: {
              title: data.task.title,
              materials: data.task.materials || '',
              task: data.task.task || '',
              evaluationCriteria: data.task.evaluationCriteria || '',
              maxPoints: data.task.maxPoints,
              systemMessage: ''  // 追加
            }
          });
        } else {
          // 新規にタスクを作成
          const task = await tx.task.create({
            data: {
              courseId: chapter.courseId,
              title: data.task.title,
              materials: data.task.materials || '',
              task: data.task.task || '',
              evaluationCriteria: data.task.evaluationCriteria || '',
              maxPoints: data.task.maxPoints,
              systemMessage: '',  // 追加
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
      }
  
      return updateResult;
    });
  
    return updatedChapter as ChapterWithTask;
  }
  // formatExamSettings のヘルパー関数も追加
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





  async createExamChapter(courseId: string, data: CreateExamChapterDTO): Promise<ChapterWithTask> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 現在のチャプターリストを取得して適切なorderIndexを決定
      const chapters = await tx.chapter.findMany({
        where: { courseId },
        orderBy: { orderIndex: 'asc' },
        select: { orderIndex: true }
      });
  
      let newOrderIndex = 0;
      for (let i = 0; i <= chapters.length; i++) {
        if (!chapters.find(c => c.orderIndex === i)) {
          newOrderIndex = i;
          break;
        }
      }
  
      // チャプターの作成
      const chapter = await tx.chapter.create({
        data: {
          courseId,
          title: data.title,
          subtitle: data.subtitle || '',
          content: {} as Prisma.InputJsonValue,
          // InputJsonValueの型エラーを修正
          examSettings: JSON.parse(JSON.stringify(data.examSettings)) as Prisma.InputJsonValue,
          isFinalExam: true,
          timeLimit: data.timeLimit,
          releaseTime: data.releaseTime,
          orderIndex: newOrderIndex,
          isVisible: true
        }
      });
  
      // セクションの内容を結合
      const combinedMaterials = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.materials}`
        ).join('\n\n');
  
      const combinedTasks = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.task}`
        ).join('\n\n');
  
      const combinedCriteria = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.evaluationCriteria}`
        ).join('\n\n');
  
      // タスクの作成（systemMessageを必須フィールドとして追加）
      const task = await tx.task.create({
        data: {
          courseId,
          title: `${chapter.title} - 最終試験`,
          materials: combinedMaterials,
          task: combinedTasks,
          evaluationCriteria: combinedCriteria,
          maxPoints: 100,
          systemMessage: '', // 必須フィールドなので空文字列を設定
          chapter: {
            connect: { id: chapter.id }
          }
        }
      });
  
      await tx.chapter.update({
        where: { id: chapter.id },
        data: { taskId: task.id }
      });
  
      return await tx.chapter.findUnique({
        where: { id: chapter.id },
        include: {
          task: {
            select: {
              id: true,
              materials: true,
              task: true,
              evaluationCriteria: true,
              maxPoints: true
            }
          }
        }
      });
    });
  
    if (!result) {
      throw new Error('Failed to create exam chapter');
    }
  
    return result as ChapterWithTask;
  }




  async updateExamChapter(chapterId: string, data: UpdateExamChapterDTO): Promise<ChapterWithTask> {
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
  
    if (!chapter.isFinalExam) {
      throw new Error('This chapter is not an exam chapter');
    }
  
    const updatedChapter = await this.prisma.$transaction(async (tx) => {
      // システムメッセージの生成
      const systemMessage = `<exam_settings>
        ${data.examSettings.sections.map((section, index) => `
          <section number="${index + 1}" title="${section.title}">
            <materials>${section.task.materials}</materials>
            <task>${section.task.task}</task>
            <evaluation_criteria>${section.task.evaluationCriteria}</evaluation_criteria>
          </section>
        `).join('')}
      </exam_settings>`;
  
      // セクションの内容を結合
      const combinedMaterials = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.materials}`
        ).join('\n\n');
  
      const combinedTasks = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.task}`
        ).join('\n\n');
  
      const combinedCriteria = data.examSettings.sections
        .map((section, index) => 
          `【セクション${index + 1}】${section.title}\n${section.task.evaluationCriteria}`
        ).join('\n\n');
  
      // チャプターの更新
      const updateResult = await tx.chapter.update({
        where: { id: chapterId },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          examSettings: JSON.parse(JSON.stringify(data.examSettings)) as Prisma.InputJsonValue,
          timeLimit: data.timeLimit,
          releaseTime: data.releaseTime,
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
  
      // タスクの更新
      if (chapter.taskId) {
        await tx.task.update({
          where: { id: chapter.taskId },
          data: {
            title: `${updateResult.title} - 最終試験`,
            materials: combinedMaterials,
            task: combinedTasks,
            evaluationCriteria: combinedCriteria,
            systemMessage: systemMessage
          }
        });
      }
  
      return updateResult;
    });
  
    return updatedChapter as ChapterWithTask;
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