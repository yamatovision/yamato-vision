// backend/src/courses/submissions/submissionController.ts

import { Request, Response } from 'express';
import { submissionService } from './submissionService';
import { CreateSubmissionDTO } from './submissionTypes';
import { evaluationService } from './evaluationService';
import { AuthRequest } from '../../auth/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';

const prisma = new PrismaClient();

const extractContent = (text: string, tag: string): string => {
  const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
};



export class SubmissionController {
  async createSubmission(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
  
      const { courseId, chapterId } = req.params;
      
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { taskId: true }
      });
  
      if (!chapter?.taskId) {
        return res.status(404).json({
          success: false,
          message: 'チャプターに対応する課題が見つかりません'
        });
      }
  
      const task = await prisma.task.findUnique({
        where: { id: chapter.taskId },
        select: {
          id: true,
          systemMessage: true
        }
      });
  
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '課題が見つかりません'
        });
      }
  
      const materials = extractContent(task.systemMessage, 'materials');
      const taskContent = extractContent(task.systemMessage, 'task');
      const evaluationCriteria = extractContent(task.systemMessage, 'evaluation_criteria');
  
      const evaluationResult = await evaluationService.evaluateSubmission({
        materials,
        task: taskContent,
        evaluationCriteria,
        submission: req.body.submission
      });
  
      const submissionData: CreateSubmissionDTO = {
        taskId: task.id,
        userId: req.user.id,
        submission: req.body.submission
      };
  
      const result = await submissionService.createSubmission(submissionData);

      // 最高得点の更新チェックと保存
      await prisma.userChapterProgress.update({
        where: {
          userId_courseId_chapterId: {
            userId: req.user.id,
            courseId,
            chapterId
          }
        },
        data: {
          status: 'COMPLETED',
          score: evaluationResult.evaluation.total_score,
          bestSubmissionId: result.submission.id,
          completedAt: new Date()
        }
      });
  
      return res.status(201).json({
        success: true,
        data: {
          ...result,
          evaluation: evaluationResult.evaluation
        },
        message: '課題を提出しました'
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      return res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : '課題の提出に失敗しました' 
      });
    }
  }

  
  private courseProgressManager: CourseProgressManager;

  constructor() {
    this.courseProgressManager = new CourseProgressManager();
  }










async submitAndEvaluate(req: AuthRequest, res: Response) {
  try {
    console.log('【課題提出開始】', {
      ユーザーID: req.user?.id,
      コースID: req.params.courseId,
      チャプターID: req.params.chapterId,
      タイムスタンプ: new Date().toISOString()
    });

    if (!req.user?.id) {
      console.error('【認証エラー】ユーザーIDが見つかりません');
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { courseId, chapterId } = req.params;
    
    // 1. タスク情報の取得（トランザクション外で実行）
    console.log('【タスク情報取得】開始');
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { 
        taskId: true,
        courseId: true
      }
    });
    if (!chapter?.taskId) {
      console.error('【エラー】チャプターまたはタスクが見つかりません', {
        チャプターID: chapterId,
        検索結果: chapter
      });
      throw new Error('チャプターに対応する課題が見つかりません');
    }

    const taskId = chapter.taskId;  // string型として確定


    // タスクの情報を取得
    const task = await prisma.task.findUnique({
      where: { id: chapter.taskId },
      select: {
        materials: true,
        task: true,
        evaluationCriteria: true,
        systemMessage: true
      }
    });

    if (!task) {
      throw new Error('タスクが見つかりません');
    }

    // 2. 評価の実行（トランザクション外で実行）
    console.log('【評価処理】開始');
    const evaluationResult = await evaluationService.evaluateSubmission({
      materials: task.materials || '',
      task: task.task || '',
      evaluationCriteria: task.evaluationCriteria || '',
      submission: req.body.submission
    });

    console.log('【評価結果】', {
      スコア: evaluationResult.evaluation.total_score,
      フィードバック長: evaluationResult.evaluation.feedback.length
    });

    // 3. データベース更新処理をトランザクションで実行
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // 現在のプログレス状態を取得
      const currentProgress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId: req.user.id,
            courseId,
            chapterId
          }
        }
      });

      console.log('【現在の進捗】', {
        現在のスコア: currentProgress?.score,
        ステータス: currentProgress?.status
      });

      // 古い提出を全て削除
      await tx.submission.deleteMany({
        where: {
          userId: req.user.id,
      taskId: taskId  // 確定したtaskIdを使用
        }
      });

      // 新しい提出の作成
      const submission = await tx.submission.create({
        data: {
          userId: req.user.id,
          taskId: taskId,  // 確定したtaskIdを使用
          content: req.body.submission,
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step ?? null,
          evaluatedAt: now,
          submittedAt: now
        }
      });

      console.log('【新規提出】作成完了', {
        提出ID: submission.id,
        スコア: submission.points
      });

      // より高いスコアかどうかを判定
      const isNewBestScore = !currentProgress?.score || 
                            evaluationResult.evaluation.total_score > currentProgress.score;

   
console.log('【進捗更新前】', {
  更新予定データ: {
    userId: req.user.id,
    courseId,
    chapterId,
    提出内容: req.body.submission,
    スコア: evaluationResult.evaluation.total_score,
    isNewBestScore
  }
});
      // UserChapterProgressの更新
      const progress = await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId: req.user.id,
            courseId,
            chapterId
          }
        },
        create: {
          userId: req.user.id,
          courseId,
          chapterId,
          status: 'COMPLETED',
          score: evaluationResult.evaluation.total_score,
          bestTaskContent: req.body.submission,  // ここを追加
          bestFeedback: evaluationResult.evaluation.feedback || null,
          bestNextStep: evaluationResult.evaluation.next_step || null,
          bestEvaluatedAt: now,
          bestSubmissionId: submission.id,
          completedAt: now,
          lessonWatchRate: 0
        },
        update: {
          status: 'COMPLETED',
          ...(isNewBestScore ? {
            score: evaluationResult.evaluation.total_score,
            bestFeedback: evaluationResult.evaluation.feedback || null,
            bestTaskContent: req.body.submission,  // ここを追加
            bestNextStep: evaluationResult.evaluation.next_step || null,
            bestEvaluatedAt: now,
            bestSubmissionId: submission.id
          } : {})
        }
      });

      console.log('【進捗更新後】', {
        更新結果: {
          id: progress.id,
          bestTaskContent: progress.bestTaskContent,  // 実際に保存された内容
          score: progress.score,
          提出内容の長さ: progress.bestTaskContent?.length || 0
        }
      });

      return { submission, progress, isNewBestScore };
    }, {
      timeout: 10000 // トランザクションのタイムアウトを10秒に設定
    });


    // レスポンスの返却
    return res.status(201).json({
      success: true,
      data: {
        submission: {
          id: result.submission.id,
          content: result.submission.content,
          points: result.submission.points,
          feedback: result.submission.feedback,
          nextStep: result.submission.nextStep,
          submittedAt: result.submission.submittedAt,
          isNewBestScore: result.isNewBestScore
        },
        progress: {
          score: result.progress.score,
          bestFeedback: result.progress.bestFeedback,
          bestNextStep: result.progress.bestNextStep,
          bestEvaluatedAt: result.progress.bestEvaluatedAt
        }
      }
    });

  } catch (error) {
    console.error('【エラー発生】課題提出処理中のエラー:', {
      エラー内容: error instanceof Error ? error.message : error,
      スタック: error instanceof Error ? error.stack : undefined,
      リクエスト情報: {
        ユーザーID: req.user?.id,
        コースID: req.params.courseId,
        チャプターID: req.params.chapterId
      },
      タイムスタンプ: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '評価処理に失敗しました'
    });
  }
}




























async getLatestSubmission(req: AuthRequest, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { courseId, chapterId } = req.params;

    // チャプターからタスクIDを取得
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { taskId: true }
    });

    if (!chapter?.taskId) {
      return res.json({
        success: true,
        data: null
      });
    }

    // 最新の提出を取得
    const submission = await prisma.submission.findFirst({
      where: {
        userId: req.user.id,
        taskId: chapter.taskId
      },
      orderBy: {
        submittedAt: 'desc'
      },
      select: {
        id: true,
        content: true,
        points: true,
        feedback: true,
        nextStep: true,
        submittedAt: true
      }
    });

    return res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error fetching latest submission:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '提出結果の取得に失敗しました'
    });
  }
}

  async getHighestScoreSubmission(req: AuthRequest, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { courseId, chapterId } = req.params;

      const userProgress = await prisma.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId: req.user.id,
            courseId,
            chapterId
          }
        }
      });

      if (!userProgress?.bestSubmissionId) {
        return res.json({
          success: true,
          data: null
        });
      }

      const submission = await prisma.submission.findUnique({
        where: {
          id: userProgress.bestSubmissionId
        },
        select: {
          id: true,
          content: true,
          points: true,
          feedback: true,
          nextStep: true,
          submittedAt: true
        }
      });

      return res.json({
        success: true,
        data: submission
      });

    } catch (error) {
      console.error('Error fetching highest score submission:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '提出結果の取得に失敗しました'
      });
    }
  }
  async getSubmission(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
  
      const { courseId, chapterId } = req.params;
  
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { taskId: true }
      });
  
      if (!chapter?.taskId) {
        return res.status(404).json({
          success: false,
          message: 'チャプターが見つかりません'
        });
      }
  
      // 既存の提出を削除
      await prisma.submission.deleteMany({
        where: {
          userId: req.user.id,
          taskId: chapter.taskId
        }
      });
  
      // 削除後なので必ずnullが返される
      return res.json({
        success: true,
        data: null
      });
  
    } catch (error) {
      console.error('Error getting submission:', error);
      return res.status(500).json({
        success: false,
        message: '評価結果の取得に失敗しました'
      });
    }
  }

  async testEvaluation(req: Request, res: Response) {
    try {
      console.log('Debug evaluation request received:', req.body);
      const testData = {
        materials: "テスト教材内容",
        task: "プロンプトエンジニアリングの基本課題",
        evaluationCriteria: "1. プロンプトの構造化\n2. 制約条件の明確さ\n3. 目的の具体性",
        submission: req.body.submission || "テスト回答"
      };

      console.log('Sending test data to evaluation service:', testData);
      const result = await evaluationService.evaluateSubmission(testData);
      console.log('Evaluation result:', result);

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error('Test evaluation failed:', error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  async getChapterProgress(
    req: Request<{ chapterId: string; userId: string }>,
    res: Response
  ) {
    try {
      const progress = await submissionService.getChapterProgress(
        req.params.userId,
        req.params.chapterId
      );

      return res.json({ data: progress });
    } catch (error) {
      console.error('Error fetching chapter progress:', error);
      return res.status(500).json({ message: '進捗状況の取得に失敗しました' });
    }
  }
}

export const submissionController = new SubmissionController();