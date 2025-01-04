import { Request, Response } from 'express';
import { submissionService } from './submissionService';
import { CreateSubmissionDTO } from './submissionTypes';
import { evaluationService } from './evaluationService';  // 追加


export class SubmissionController {
  // 課題提出処理
  async createSubmission(
    req: Request<{ taskId: string }, {}, CreateSubmissionDTO>,
    res: Response
  ) {
    try {
      const result = await submissionService.createSubmission({
        ...req.body,
        taskId: req.params.taskId
      });

      return res.status(201).json({
        data: result,
        message: result.timePenalty 
          ? '制限時間を超過したため、得点が減少しています'
          : '課題を提出しました'
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      return res.status(500).json({ message: '課題の提出に失敗しました' });
    }
  }

  // backend/src/courses/submissions/submissionController.ts に追加
// デバッグ用エンドポイント
// submissionController.ts のtestEvaluationメソッドにログを追加
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

  // 提出内容の取得
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

  // ユーザーの課題提出状況確認
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

  // 課題の提出統計情報
  async getTaskSubmissionStats(
    req: Request<{ taskId: string }>,
    res: Response
  ) {
    try {
      const stats = await submissionService.getTaskSubmissionStats(
        req.params.taskId
      );

      return res.json({ data: stats });
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      return res.status(500).json({ message: '統計情報の取得に失敗しました' });
    }
  }

  // チャプターの進捗確認
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
