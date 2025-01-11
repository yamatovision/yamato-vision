// backend/src/courses/examinations/examinationController.ts

import { Response } from 'express';
import { AuthRequest } from '../../auth/authMiddleware';
import { examinationService } from './examinationService';
import { ExamError } from '../types/examination';
import { PrismaClient } from '@prisma/client';  // 追加

const prisma = new PrismaClient();  // 追加

export class ExaminationController {

  private readonly SECTION_TIME_LIMIT = 40 * 60; // 40分をセクション制限時間とする

  // 試験開始
  async startExam(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { chapterId } = req.params;

      const progress = await examinationService.startExam({
        userId: req.user.id,
        chapterId
      });

      return res.status(200).json({
        success: true,
        data: progress,
        message: '試験を開始しました'
      });
    } catch (error) {
      console.error('Error starting exam:', error);
      
      if (error instanceof ExamError) {
        return res.status(this.getStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '試験の開始に失敗しました'
      });
    }
  }
// examinationController.ts の submitSection メソッドを修正
async submitSection(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { chapterId, sectionId } = req.params;
    const { content } = req.body;

    // sectionId から sectionNumber を抽出
    const sectionNumber = parseInt(sectionId.replace('section-', '')) - 1;

    const result = await examinationService.submitSection({
      userId: req.user.id,
      chapterId,
      sectionNumber, // sectionId の代わりに sectionNumber を使用
      content
    });

    // 以下は変更なし
    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
        message: '試験が完了しました',
        isComplete: true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'セクションを提出しました',
      isComplete: false
    });

  } catch (error) {
    // エラーハンドリングは変更なし
    console.error('Error submitting section:', error);
    
    if (error instanceof ExamError) {
      return res.status(this.getStatusCode(error.code)).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'セクションの提出に失敗しました'
    });
  }
}
async getExamStatus(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { chapterId } = req.params;

    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId: req.user.id,
          chapterId,
          courseId: (await prisma.chapter.findUnique({ where: { id: chapterId } }))?.courseId!
        }
      },
      select: {
        status: true,
        startedAt: true,
        completedAt: true,
        score: true,
        bestTaskContent: true,
        bestFeedback: true
      }
    });

    // 進捗状況から現在のセクションを判断
    const currentSection = progress ? this.calculateCurrentSection(progress) : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        ...progress,
        currentSection,
        timeRemaining: this.SECTION_TIME_LIMIT  // 固定値を返す
      }
    });

  } catch (error) {
    console.error('Error getting exam status:', error);
    return res.status(500).json({
      success: false,
      message: '試験状態の取得に失敗しました'
    });
  }
}

// セクション計算用のヘルパーメソッドを追加
private calculateCurrentSection(progress: any): number {
  if (!progress) return 0;
  if (progress.status === 'COMPLETED') return 3;  // 完了時は最終セクション
  if (progress.status === 'NOT_STARTED') return 0;
  
  // IN_PROGRESS状態の場合、提出履歴から現在のセクションを判断
  // 実際の実装ではSubmissionテーブルの記録から判断するロジックを追加
  return 1; // デフォルト値
}


  // エラーコードからHTTPステータスコードへの変換
  private getStatusCode(errorCode: ExamError['code']): number {
    const statusCodes = {
      'TIMEOUT': 403,
      'INVALID_STATE': 400,
      'NOT_FOUND': 404,
      'UNAUTHORIZED': 401
    };
    return statusCodes[errorCode];
  }
}

export const examinationController = new ExaminationController();