// backend/src/courses/examinations/examinationController.ts

import { Response } from 'express';
import { AuthRequest } from '../../auth/authMiddleware';
import { examinationService } from './examinationService';
import { ExamError } from '../types/examination';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExaminationController {
  private readonly SECTION_TIME_LIMIT = 40 * 60;

  private static getStatusCode(errorCode: ExamError['code']): number {
    const statusCodes = {
      'TIMEOUT': 403,
      'INVALID_STATE': 400,
      'NOT_FOUND': 404,
      'UNAUTHORIZED': 401
    };
    return statusCodes[errorCode];
  }

  startExam = async (req: AuthRequest, res: Response) => {
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
        return res.status(ExaminationController.getStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '試験の開始に失敗しました'
      });
    }
  };

  submitSection = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { chapterId, sectionId } = req.params;
      const { content } = req.body;

      const sectionNumber = parseInt(sectionId.replace('section-', '')) - 1;

      const result = await examinationService.submitSection({
        userId: req.user.id,
        chapterId,
        sectionNumber,
        content
      });

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
      console.error('Error submitting section:', error);
      
      if (error instanceof ExamError) {
        return res.status(ExaminationController.getStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'セクションの提出に失敗しました'
      });
    }
  };

  getExamStatus = async (req: AuthRequest, res: Response) => {
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

      const currentSection = progress ? this.calculateCurrentSection(progress) : 0;
      
      return res.status(200).json({
        success: true,
        data: {
          ...progress,
          currentSection,
          timeRemaining: this.SECTION_TIME_LIMIT
        }
      });

    } catch (error) {
      console.error('Error getting exam status:', error);
      return res.status(500).json({
        success: false,
        message: '試験状態の取得に失敗しました'
      });
    }
  };

  private calculateCurrentSection = (progress: any): number => {
    if (!progress) return 0;
    if (progress.status === 'COMPLETED') return 3;
    if (progress.status === 'NOT_STARTED') return 0;
    
    return 1;
  };
}

export const examinationController = new ExaminationController();