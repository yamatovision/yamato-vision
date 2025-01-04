import { Router } from 'express';
import { submissionController } from './submissionController';

const router = Router({ mergeParams: true }); // courseId, taskId等のパラメータを受け取るため

router.post(
  '/debug/evaluate',
  submissionController.testEvaluation.bind(submissionController)
);

// 課題提出関連
router.post(
  '/tasks/:taskId/submissions',
  submissionController.createSubmission.bind(submissionController)
);

router.get(
  '/submissions/:submissionId',
  submissionController.getSubmission.bind(submissionController)
);

// 提出状況確認
router.get(
  '/tasks/:taskId/users/:userId/status',
  submissionController.getUserTaskStatus.bind(submissionController)
);

// 統計情報
router.get(
  '/tasks/:taskId/submissions/stats',
  submissionController.getTaskSubmissionStats.bind(submissionController)
);

// チャプター進捗
router.get(
  '/chapters/:chapterId/users/:userId/progress',
  submissionController.getChapterProgress.bind(submissionController)
);

export { router as submissionRoutes };
