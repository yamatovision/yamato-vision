import { PrismaClient } from '@prisma/client';
import { 
  CreateSubmissionDTO, 
  SubmissionResult, 
  SubmissionStats,
  UserSubmissionStatus 
} from './submissionTypes';
import { taskService } from '../tasks/taskService';

const prisma = new PrismaClient();

export class SubmissionService {
  // 課題提出
  async createSubmission(data: CreateSubmissionDTO): Promise<SubmissionResult> {
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

    if (!task) {
      throw new Error('課題が見つかりません');
    }

    const userCourse = task.chapter?.course.users[0];
    const timePenalty = task.chapter?.timeLimit 
      ? taskService.calculateTimePenalty(
          new Date(),
          userCourse?.startedAt || new Date(),
          task.chapter.timeLimit
        ) < 1
      : false;

    const evaluationResult = await taskService.evaluateSubmission({
      systemMessage: task.systemMessage,
      referenceText: task.referenceText || '',
      submission: data.content,
      maxPoints: task.maxPoints
    });

    const originalScore = evaluationResult.points;
    const finalScore = timePenalty 
      ? Math.floor(originalScore * 0.33) 
      : originalScore;

    const submission = await prisma.submission.create({
      data: {
        content: data.content,
        userId: data.userId,
        taskId: data.taskId,
        points: finalScore,
        feedback: evaluationResult.feedback,
        evaluatedAt: new Date(),
        submittedAt: new Date()
      }
    });

    return {
      submission,
      timePenalty,
      finalScore,
      originalScore,
      feedback: evaluationResult.feedback
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
      include: {
        task: {
          include: {
            chapter: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    if (!submission) {
      return {
        completed: false,
        isLate: false
      };
    }

    const task = submission.task;
    const chapter = task.chapter;
    const timeLimit = chapter?.timeLimit;

    const isLate = timeLimit
      ? (submission.submittedAt.getTime() - chapter.createdAt.getTime()) > (timeLimit * 60 * 1000)
      : false;

    return {
      completed: true,
      submittedAt: submission.submittedAt,
      score: submission.points ?? undefined,
      isLate,
      feedback: submission.feedback ?? undefined
    };
  }

  async getTaskSubmissionStats(taskId: string): Promise<SubmissionStats> {
    const submissions = await prisma.submission.findMany({
      where: { taskId },
      include: {
        task: {
          include: {
            chapter: true
          }
        }
      }
    });

    const totalSubmissions = submissions.length;
    if (totalSubmissions === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        timelySubmissions: 0,
        lateSubmissions: 0
      };
    }

    let timelyCount = 0;
    let lateCount = 0;
    let totalScore = 0;
    let highestScore = 0;

    submissions.forEach(submission => {
      const timeLimit = submission.task.chapter?.timeLimit;
      const submissionTime = submission.submittedAt.getTime() - 
        submission.task.chapter!.createdAt.getTime();

      if (timeLimit && submissionTime > (timeLimit * 60 * 1000)) {
        lateCount++;
      } else {
        timelyCount++;
      }

      totalScore += submission.points ?? 0;
      highestScore = Math.max(highestScore, submission.points ?? 0);
    });

    return {
      totalSubmissions,
      averageScore: totalScore / totalSubmissions,
      highestScore,
      timelySubmissions: timelyCount,
      lateSubmissions: lateCount
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
}

export const submissionService = new SubmissionService();
