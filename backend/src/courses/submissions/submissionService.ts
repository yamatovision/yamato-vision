import { PrismaClient } from '@prisma/client';
import { 
  CreateSubmissionDTO, 
  SubmissionResult,  
  UserSubmissionStatus,
  DbSubmission
} from './submissionTypes';
import { taskService } from '../tasks/taskService';
import { timeoutService } from '../timeouts/timeoutService';
import { evaluationService } from './evaluationService';  // 追加


const prisma = new PrismaClient();

export class SubmissionService {
  async createSubmission(data: CreateSubmissionDTO): Promise<SubmissionResult> {
    // データの存在チェック
    if (!data.userId || !data.taskId) {
      throw new Error('ユーザーIDとタスクIDは必須です');
    }

    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                users: {
                  where: { userId: data.userId }
                }
              }
            }
          }
        }
      }
    });

    if (!task || !task.chapter) {
      throw new Error('課題が見つかりません');
    }

    // コースのタイムアウトチェック
    const courseTimeout = await timeoutService.checkCourseTimeout(
      data.userId,
      task.chapter.courseId
    );

    if (courseTimeout.isTimedOut) {
      throw new Error('コースの期限が終了しています。再購入が必要です。');
    }

    // チャプターのタイムアウトチェック
    const chapterTimeout = await timeoutService.checkChapterTimeout(
      data.userId,
      task.chapter.courseId,
      task.chapter.id
    );

    if (chapterTimeout.isTimedOut) {
      throw new Error('チャプターの制限時間が終了しています。');
    }

    // システムメッセージから各セクションを抽出
    const materials = this.extractSection(task.systemMessage, 'materials');
    const taskContent = this.extractSection(task.systemMessage, 'task');
    const evaluationCriteria = this.extractSection(task.systemMessage, 'evaluation_criteria');

    // 評価用のXMLデータを構築
    const evaluationXML = `
<materials>${materials}</materials>
<task>${taskContent}</task>
<evaluation_criteria>${evaluationCriteria}</evaluation_criteria>
<submission>${data.submission}</submission>`;

    const evaluationResult = await evaluationService.evaluateSubmission({
      materials,
      task: taskContent,
      evaluationCriteria,
      submission: data.submission
    });

    const submission = await prisma.submission.create({
      data: {
        content: data.submission,
        userId: data.userId,
        taskId: data.taskId,
        points: evaluationResult.evaluation.total_score,
        feedback: evaluationResult.evaluation.feedback,
        evaluatedAt: new Date(),
        submittedAt: new Date()
      }
    }) as DbSubmission;

    return {
      submission: {
        id: submission.id,
        content: submission.content,
        points: submission.points ?? undefined,  // nullをundefinedに変換
        feedback: submission.feedback ?? undefined  // nullをundefinedに変換
      },
      finalScore: evaluationResult.evaluation.total_score,
      originalScore: evaluationResult.evaluation.total_score,
      feedback: evaluationResult.evaluation.feedback
    };
  }

  async getSubmission(submissionId: string) {
    return prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          select: {
            title: true,
            maxPoints: true,
            chapter: {
              select: {
                title: true,
                timeLimit: true
              }
            }
          }
        }
      }
    });
  }

  async getUserTaskStatus(
    userId: string,
    taskId: string
  ): Promise<UserSubmissionStatus> {
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

    const isLate = submission.task.chapter?.timeLimit
      ? this.checkIfSubmissionIsLate(
          submission.submittedAt,
          submission.task.chapter.timeLimit
        )
      : false;

    return {
      completed: true,
      submittedAt: submission.submittedAt,
      score: submission.points ?? undefined,
      feedback: submission.feedback ?? undefined,
      isLate
    };
  }

  async getChapterProgress(userId: string, chapterId: string) {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
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

    if (!chapter?.task) {
      return { completed: false, score: 0 };
    }

    const submission = chapter.task.submissions[0];
    return {
      completed: !!submission,
      score: submission?.points ?? 0,
      submittedAt: submission?.submittedAt
    };
  }

  private extractSection(text: string, tag: string): string {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private checkIfSubmissionIsLate(submittedAt: Date, timeLimit: number): boolean {
    const submissionTime = submittedAt.getTime();
    const timeLimitMs = timeLimit * 60 * 1000;
    return submissionTime > timeLimitMs;
  }
}

export const submissionService = new SubmissionService();