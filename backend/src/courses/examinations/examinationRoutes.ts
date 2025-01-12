// backend/src/courses/examinations/examinationRoutes.ts

import { Router } from 'express';
import { examinationController } from './examinationController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router({ mergeParams: true });

// 試験関連のルートを /courses/user 配下に移動
router.post(
  '/user/:courseId/chapters/:chapterId/exam/start',
  authMiddleware,
  examinationController.startExam
);

// セクション提出も同様に修正
router.post(
  '/user/:courseId/chapters/:chapterId/exam/sections/:sectionNumber/submit',
  authMiddleware,
  examinationController.submitSection
);

router.get(
  '/:courseId/chapters/:chapterId/exam/progress',
  examinationController.getExamProgress
);
router.post(
  '/:courseId/chapters/:chapterId/exam/start',
  examinationController.startExam
);



export { router as examinationRoutes };