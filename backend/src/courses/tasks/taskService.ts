import { PrismaClient } from '@prisma/client';
import { evaluationService } from '../submissions/evaluationService';

import { 
  CreateTaskDTO, 
  UpdateTaskDTO, 
  TaskEvaluationResult, 
  EvaluationContext 
} from './taskTypes';

const prisma = new PrismaClient();

export class TaskService {
  // 課題作成
  async createTask(chapterId: string, courseId: string, data: CreateTaskDTO) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        systemMessage: data.systemMessage,
        referenceText: data.referenceText,
        maxPoints: data.maxPoints,
        courseId,
        chapter: {
          connect: { id: chapterId }
        }
      }
    });
  }

  // 課題更新
  async updateTask(taskId: string, data: UpdateTaskDTO) {
    return prisma.task.update({
      where: { id: taskId },
      data
    });
  }

  // 課題取得
  async getTask(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        submissions: {
          orderBy: {
            submittedAt: 'desc'
          }
        }
      }
    });
  }

  // 課題削除
  async deleteTask(taskId: string) {
    return prisma.task.delete({
      where: { id: taskId }
    });
  }

  // 時間ペナルティ計算
  calculateTimePenalty(
    submittedAt: Date,
    startedAt: Date,
    timeLimit: number | null
  ): number {
    if (!timeLimit) return 1;
    const submissionMinutes = (submittedAt.getTime() - startedAt.getTime()) / (1000 * 60);
    return submissionMinutes > timeLimit ? 0.33 : 1;
  }

  // 課題評価
  
async evaluateSubmission(context: EvaluationContext): Promise<TaskEvaluationResult> {
  try {
    // システムメッセージから各セクションを抽出
    const materials = this.extractSection(context.systemMessage, 'materials');
    const task = this.extractSection(context.systemMessage, 'task');
    const evaluationCriteria = this.extractSection(context.systemMessage, 'evaluation_criteria');

    const result = await evaluationService.evaluateSubmission({
      materials,
      task,
      evaluationCriteria,
      submission: context.submission
    });

    return {
      points: result.evaluation.total_score,
      feedback: result.evaluation.feedback,
      detail: {
        reasoning: result.evaluation.feedback,
        breakdowns: [{
          category: "総合評価",
          score: result.evaluation.total_score,
          comment: result.evaluation.next_step
        }]
      }
    };
  } catch (error) {
    console.error('Evaluation error:', error);
    throw new Error('課題の評価に失敗しました');
  }
}

// XMLタグからコンテンツを抽出するヘルパー関数
private extractSection(text: string, tag: string): string {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

  // 評価結果保存
  async saveEvaluation(
    taskId: string,
    userId: string,
    result: TaskEvaluationResult,
    content: string
  ) {
    return prisma.submission.create({
      data: {
        taskId,
        userId,
        content,
        points: result.points,
        feedback: result.feedback,
        evaluatedAt: new Date(),
        submittedAt: new Date()
      }
    });
  }

  // 統計情報取得
  async getTaskStatistics(taskId: string) {
    const submissions = await prisma.submission.findMany({
      where: { taskId },
      select: {
        points: true,
        submittedAt: true
      }
    });

    const totalSubmissions = submissions.length;
    if (totalSubmissions === 0) {
      return {
        averageScore: 0,
        submissionCount: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const scores = submissions.map(s => s.points || 0);
    
    return {
      averageScore: scores.reduce((a, b) => a + b, 0) / totalSubmissions,
      submissionCount: totalSubmissions,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  }
}

export const taskService = new TaskService();
