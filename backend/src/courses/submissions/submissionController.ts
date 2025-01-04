// backend/src/courses/submissions/submissionController.ts

import { Request, Response } from 'express';
import { submissionService } from './submissionService';
import { CreateSubmissionDTO } from './submissionTypes';
import { evaluationService } from './evaluationService';
import { AuthRequest } from '../../auth/authMiddleware';  // 既存の型をインポート
import { PrismaClient } from '@prisma/client';  // 追加
const prisma = new PrismaClient();  // 追加
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
      
      // チャプターからtaskIdを取得
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
  
      // タスクの取得
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
  
      // 以下は既存の処理
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