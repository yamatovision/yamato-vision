// backend/src/courses/submissions/submissionRoutes.ts

import { Router } from 'express';
import { submissionController } from './submissionController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router({ mergeParams: true });

// 課題提出
router.post(
  '/courses/:courseId/chapters/:chapterId/submit',  // パスを確認
  authMiddleware,
  submissionController.createSubmission.bind(submissionController)
);


router.post(
  '/courses/:courseId/chapters/:chapterId/submission',
  authMiddleware,
  submissionController.submitAndEvaluate.bind(submissionController)
);

// 提出内容の取得
router.get(
  '/submissions/:submissionId',
  authMiddleware,
  submissionController.getSubmission.bind(submissionController)
);

// 提出状況確認

// チャプター進捗
router.get(
  '/chapters/:chapterId/users/:userId/progress',
  authMiddleware,
  submissionController.getChapterProgress.bind(submissionController)
);

// テスト用評価エンドポイントは削除または必要な場合は別途実装

export { router as submissionRoutes };