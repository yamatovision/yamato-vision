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
router.post(
  '/user/:courseId/chapters/:chapterId/exam/start',
  authMiddleware,
  examinationController.startExam
);

router.post(
  '/user/:courseId/chapters/:chapterId/exam/sections/:sectionNumber/submit',
  authMiddleware,
  examinationController.submitSection
);

// examinationRoutes.ts に追加
router.get(
  '/user/:courseId/chapters/:chapterId/exam/result',
  authMiddleware,
  examinationController.getExamResult
);


router.get(
  '/user/:courseId/chapters/:chapterId/exam/certificate',
  authMiddleware,
  examinationController.getExamCertificate
);

export { router as examinationRoutes };