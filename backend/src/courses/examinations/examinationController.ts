// backend/src/courses/examinations/examinationController.ts

import { Response } from 'express';
import { AuthRequest } from '../../auth/authMiddleware';
import { examinationService } from './examinationService';
import { ExamError } from '../types/examination';

export const examinationController = {
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
        return res.status(getErrorStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '試験の開始に失敗しました'
      });
    }
  },
  async submitSection(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
  
      const { chapterId, sectionNumber } = req.params;
      const { content } = req.body;
  
      const sectionIndex = parseInt(sectionNumber, 10);
  
      const result = await examinationService.submitSection({
        userId: req.user.id,
        chapterId,
        sectionNumber: sectionIndex,
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
        return res.status(getErrorStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }
  
      return res.status(500).json({
        success: false,
        message: 'セクションの提出に失敗しました'
      });
    }
  },


async getExamResult(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { courseId, chapterId } = req.params;

    const result = await examinationService.getExamResult({
      userId: req.user.id,
      courseId,
      chapterId
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting exam result:', error);
    
    if (error instanceof ExamError) {
      return res.status(getErrorStatusCode(error.code)).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: '試験結果の取得に失敗しました'
    });
  }
},
// src/courses/examinations/examinationController.ts に追加

async getExamCertificate(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const { courseId, chapterId } = req.params;

    const certificateData = await examinationService.generateCertificate({
      userId: req.user.id,
      courseId,
      chapterId
    });

    return res.status(200).json({
      success: true,
      data: certificateData
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    
    if (error instanceof ExamError) {
      return res.status(getErrorStatusCode(error.code)).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: '証明書の生成に失敗しました'
    });
  }
},



  async getExamProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      const { courseId, chapterId } = req.params;

      const progress = await examinationService.getExamProgress({
        userId: req.user.id,
        courseId,
        chapterId
      });

      return res.status(200).json({
        success: true,
        data: progress
      });

    } catch (error) {
      console.error('Error getting exam progress:', error);
      
      if (error instanceof ExamError) {
        return res.status(getErrorStatusCode(error.code)).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '試験の進捗取得に失敗しました'
      });
    }
  }
};

// ヘルパー関数を外部に移動
function getErrorStatusCode(errorCode: ExamError['code']): number {
  const statusCodes: Record<ExamError['code'], number> = {
    'TIMEOUT': 403,
    'INVALID_STATE': 400,
    'NOT_FOUND': 404,
    'UNAUTHORIZED': 401
  };
  return statusCodes[errorCode];
}

