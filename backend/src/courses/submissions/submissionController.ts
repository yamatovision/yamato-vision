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

 // submissionController.ts
 async submitAndEvaluate(req: AuthRequest, res: Response) {
  try {
    console.log('【課題提出開始】', {
      ユーザーID: req.user?.id,
      コースID: req.params.courseId,
      チャプターID: req.params.chapterId,
      タイムスタンプ: new Date().toISOString()
    });

    if (!req.user || !req.user.id) {
      console.error('【認証エラー】ユーザーIDが見つかりません');
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { courseId, chapterId } = req.params;
    
    // 1. タスク情報の取得
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
      return res.status(404).json({
        success: false,
        message: 'チャプターに対応する課題が見つかりません'
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: chapter.taskId },
      select: {
        id: true,
        systemMessage: true,
        materials: true,
        task: true,
        evaluationCriteria: true
      }
    });

    if (!task) {
      console.error('【エラー】タスクが見つかりません');
      return res.status(404).json({
        success: false,
        message: '課題が見つかりません'
      });
    }

    console.log('【タスク情報】取得完了', {
      タスクID: task.id,
      システムメッセージ存在: !!task.systemMessage
    });

    // 2. 評価用データの準備と評価の実行
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

    // 3. トランザクション処理
    console.log('【トランザクション】開始');
    const result = await prisma.$transaction(async (tx) => {
      // 現在の進捗状況を取得
      const currentProgress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId: req.user.id,
            courseId,
            chapterId
          }
        },
        include: {
          bestSubmission: true
        }
      });

      console.log('【現在の進捗】', {
        現在のスコア: currentProgress?.score,
        ステータス: currentProgress?.status,
        ベストスコア提出ID: currentProgress?.bestSubmissionId
      });

      // 新しい提出を保存
      const newSubmission = await tx.submission.create({
        data: {
          userId: req.user.id,
          taskId: task.id,
          content: req.body.submission,
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step || '',
          evaluatedAt: new Date(),
          submittedAt: new Date()
        }
      });

      console.log('【新規提出】作成完了', {
        提出ID: newSubmission.id,
        スコア: newSubmission.points
      });

      // 最高得点の判定
      const isNewBestScore = !currentProgress?.score || 
                            evaluationResult.evaluation.total_score > currentProgress.score;

      console.log('【スコア判定】', {
        新記録判定: isNewBestScore,
        新スコア: evaluationResult.evaluation.total_score,
        旧スコア: currentProgress?.score
      });

      if (isNewBestScore) {
        console.log('【最高得点更新】処理開始');
        // インスタンスメソッドとして呼び出し
        await this.courseProgressManager.handleSubmissionComplete(tx, {
          userId: req.user.id,
          courseId,
          chapterId,
          submissionId: newSubmission.id,
          score: evaluationResult.evaluation.total_score
        });
      }

      return {
        submission: newSubmission,
        evaluation: evaluationResult.evaluation,
        isNewBestScore,
        previousBestScore: currentProgress?.score || 0
      };
    });

    console.log('【処理完了】', {
      提出ID: result.submission.id,
      最終スコア: result.submission.points,
      新記録: result.isNewBestScore
    });

    // 4. クライアントへのレスポンス
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
          isNewBestScore: result.isNewBestScore,
          previousBestScore: result.previousBestScore
        },
        evaluation: {
          total_score: result.evaluation.total_score,
          feedback: result.evaluation.feedback,
          next_step: result.evaluation.next_step
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
      message: error instanceof Error ? error.message : '課題の提出と評価に失敗しました'
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

  async getSubmission(
    req: Request<{ submissionId: string }>,
    res: Response
  ) {
    try {
      const submission = await submissionService.getSubmission(
        req.params.submissionId
      );

      if (!submission) {
        return res.status(404).json({ message: '提出内容が見つかりません' });
      }

      return res.json({ data: submission });
    } catch (error) {
      console.error('Error fetching submission:', error);
      return res.status(500).json({ message: '提出内容の取得に失敗しました' });
    }
  }

  async getUserTaskStatus(
    req: Request<{ taskId: string; userId: string }>,
    res: Response
  ) {
    try {
      const status = await submissionService.getUserTaskStatus(
        req.params.userId,
        req.params.taskId
      );

      return res.json({ data: status });
    } catch (error) {
      console.error('Error fetching user task status:', error);
      return res.status(500).json({ message: '提出状況の確認に失敗しました' });
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