// backend/src/courses/submissions/submissionService.ts

import { PrismaClient } from '@prisma/client';
import { 
  CreateSubmissionDTO, 
  SubmissionResult,
  PeerSubmissionResponse,
  GetPeerSubmissionsResponse,
  SubmissionDisplayControl,
  DbSubmission,
  UserSubmissionStatus,
  SubmissionWithDetails
} from './submissionTypes';
import { timeoutService } from '../timeouts/timeoutService';
import { evaluationService } from './evaluationService';
import { SubmissionVisibilityState } from '../types/progress';

const prisma = new PrismaClient();

export class SubmissionService {
  async createSubmission(data: CreateSubmissionDTO): Promise<SubmissionResult> {
    if (!data.userId || !data.taskId) {
      throw new Error('ユーザーIDとタスクIDは必須です');
    }

    return await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
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

      if (!task?.chapter) {
        throw new Error('Task or chapter not found');
      }

      const courseTimeout = await timeoutService.checkCourseTimeout(
        data.userId,
        task.chapter.courseId
      );

      if (courseTimeout.isTimedOut) {
        throw new Error('コースの期限が終了しています。再購入が必要です。');
      }

      const chapterTimeout = await timeoutService.checkChapterTimeout(
        data.userId,
        task.chapter.courseId,
        task.chapter.id
      );

      if (chapterTimeout.isTimedOut) {
        throw new Error('チャプターの制限時間が終了しています。');
      }

      const materials = this.extractSection(task.systemMessage, 'materials');
      const taskContent = this.extractSection(task.systemMessage, 'task');
      const evaluationCriteria = this.extractSection(task.systemMessage, 'evaluation_criteria');

      const evaluationResult = await evaluationService.evaluateSubmission({
        materials,
        task: taskContent,
        evaluationCriteria,
        submission: data.submission
      });

      const submission = await tx.submission.create({
        data: {
          content: data.submission,
          userId: data.userId,
          taskId: data.taskId,
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step || null,
          evaluatedAt: new Date(),
          submittedAt: new Date()
        }
      });

      // 進捗状況の更新
      await tx.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId: data.userId,
            courseId: task.chapter.courseId,
            chapterId: task.chapter.id
          }
        },
        data: {
          status: 'TASK_IN_PROGRESS',
          score: submission.points,
          completedAt: submission.points >= 70 ? new Date() : null
        }
      });

      const visibility = this.calculateVisibility(
        chapterTimeout.isTimedOut,
        true,
        submission.points
      );

      return {
        submission: {
          id: submission.id,
          content: submission.content,
          points: submission.points,
          feedback: submission.feedback,
          nextStep: submission.nextStep
        },
        visibility,
        finalScore: evaluationResult.evaluation.total_score,
        originalScore: evaluationResult.evaluation.total_score,
        feedback: evaluationResult.evaluation.feedback
      };
    });
  }

  async getLatestSubmission(userId: string, chapterId: string) {
    const submission = await prisma.submission.findFirst({
      where: {
        userId,
        task: {
          chapter: {
            id: chapterId
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      select: {
        id: true,
        points: true,
        feedback: true,
        nextStep: true,
        submittedAt: true
      }
    });

    if (!submission) {
      throw new Error('提出結果が見つかりません');
    }

    return submission;
  }
  async getSubmission(submissionId: string): Promise<SubmissionWithDetails | null> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: {
          include: {
            chapter: {
              select: {
                title: true,
                releaseTime: true
              }
            },
          },
          select: {
            title: true,
            maxPoints: true,
          }
        }
      }
    });

    if (!submission) return null;

    const submissionWithDetails: SubmissionWithDetails = {
      ...submission,
      task: {
        title: submission.task.title,
        maxPoints: submission.task.maxPoints,
        timeLimit: undefined
      },
      chapter: {
        title: submission.task.chapter?.title || '',
        releaseTime: submission.task.chapter?.releaseTime || undefined  // nullの場合はundefinedに変換
      }
    };

    return submissionWithDetails;
}
  async getUserTaskStatus(userId: string, taskId: string): Promise<UserSubmissionStatus> {
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

  private calculateVisibility(
    isTimedOut: boolean,
    isOwnSubmission: boolean,
    points: number
  ): SubmissionVisibilityState {
    if (isTimedOut) {
      const hasMinimumScore = points >= 80;
      return {
        canViewContent: isOwnSubmission || hasMinimumScore,
        canViewPoints: true,
        canViewAiFeedback: true
      };
    }

    return {
      canViewContent: true,
      canViewPoints: false,
      canViewAiFeedback: false
    };
  }

  async getPeerSubmissions(
    chapterId: string,
    currentUserId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<GetPeerSubmissionsResponse> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        userProgress: {
          where: { userId: currentUserId }
        }
      }
    });

    if (!chapter || !chapter.taskId) {
      throw new Error('Chapter not found or has no task');
    }

    const isTimedOut = chapter.userProgress[0]?.isTimedOut ?? false;
    const timeOutAt = chapter.userProgress[0]?.timeOutAt ?? undefined;

    const orderBy = isTimedOut
      ? [{ points: 'desc' as const }, { submittedAt: 'desc' as const }]
      : [{ submittedAt: 'desc' as const }];

    const submissions = await prisma.submission.findMany({
      where: {
        taskId: chapter.taskId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rank: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage
    });

    const total = await prisma.submission.count({
      where: {
        taskId: chapter.taskId
      }
    });

    const processedSubmissions = submissions.map(submission => {
      const visibility = this.calculateVisibility(
        isTimedOut,
        submission.userId === currentUserId,
        submission.points
      );

      return {
        id: submission.id,
        content: submission.content,
        points: visibility.canViewPoints ? submission.points : null,
        feedback: visibility.canViewAiFeedback ? submission.feedback : null,
        submittedAt: submission.submittedAt,
        user: {
          id: submission.user.id,
          name: submission.user.name ?? '名称未設定',
          avatarUrl: submission.user.avatarUrl,
          rank: submission.user.rank,
          isCurrentUser: submission.userId === currentUserId
        },
        visibility
      };
    });

    return {
      submissions: processedSubmissions,
      total,
      page,
      perPage,
      timeoutStatus: {
        isTimedOut,
        timeOutAt
      }
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