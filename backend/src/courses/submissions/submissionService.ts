
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateSubmissionDTO, SubmissionResult } from './submissionTypes';
import { evaluationService } from './evaluationService';
import { CourseProgressManager } from '../progress/courseProgressManager';

const prisma = new PrismaClient();
const progressManager = new CourseProgressManager();

export class SubmissionService {
  async createSubmission(data: CreateSubmissionDTO): Promise<SubmissionResult> {
    return await prisma.$transaction(async (tx) => {
      if (!data.userId || !data.taskId) {
        throw new Error('ユーザーIDとタスクIDは必須です');
      }

      // タスクとチャプター情報の取得
      const task = await tx.task.findUnique({
        where: { id: data.taskId },
        include: {
          chapter: true
        }
      });

      if (!task?.chapter) {
        throw new Error('Task or chapter not found');
      }

      // AIによる評価の実行
      const materials = this.extractSection(task.systemMessage, 'materials');
      const taskContent = this.extractSection(task.systemMessage, 'task');
      const evaluationCriteria = this.extractSection(task.systemMessage, 'evaluation_criteria');

      const evaluationResult = await evaluationService.evaluateSubmission({
        materials,
        task: taskContent,
        evaluationCriteria,
        submission: data.submission
      });

      // 新しい提出を作成
      const submission = await tx.submission.create({
        data: {
          userId: data.userId,
          taskId: data.taskId,
          content: data.submission,
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step || null,
          evaluatedAt: new Date(),
          submittedAt: new Date()
        }
      });

      // CourseProgressManagerを使用して提出完了処理を実行
      const progressResult = await progressManager.handleSubmissionComplete(tx, {
        userId: data.userId,
        courseId: task.chapter.courseId,
        chapterId: task.chapter.id,
        submissionId: submission.id,
        score: evaluationResult.evaluation.total_score
      });

      return {
        submission: {
          id: submission.id,
          content: submission.content,
          points: submission.points,
          feedback: submission.feedback,
          nextStep: submission.nextStep
        },
        visibility: {
          canViewContent: true,
          canViewPoints: true,
          canViewAiFeedback: true
        },
        finalScore: evaluationResult.evaluation.total_score,
        originalScore: evaluationResult.evaluation.total_score,
        feedback: evaluationResult.evaluation.feedback
      };
    });
  }


  

  async getSubmission(submissionId: string) {
    return await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            chapter: true
          }
        }
      }
    });
  }

  async getUserTaskStatus(userId: string, taskId: string) {
    const submission = await prisma.submission.findFirst({
      where: {
        userId,
        taskId
      },
      orderBy: {
        submittedAt: 'desc'
      },
      include: {
        task: {
          include: {
            chapter: true
          }
        }
      }
    });

    if (!submission) {
      return {
        completed: false,
        isLate: false
      };
    }

    return {
      completed: true,
      submittedAt: submission.submittedAt,
      score: submission.points,
      feedback: submission.feedback
    };
  }




  async getChapterProgress(userId: string, chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { courseId: true }
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          chapterId,
          courseId: chapter.courseId
        }
      }
    });

    return {
      completed: !!progress?.completedAt,
      score: progress?.score ?? 0,
      submittedAt: progress?.completedAt
    };
  }

  private extractSection(text: string, tag: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }
}

export const submissionService = new SubmissionService();