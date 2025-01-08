import { Router } from 'express';
import { taskController } from './taskController';

const router = Router({ mergeParams: true }); // courseIdとchapterIdのパラメータを受け取るため

// 課題のCRUD操作
router.post(
  '/chapters/:chapterId/tasks',
  taskController.createTask.bind(taskController)
);

router.put(
  '/tasks/:taskId',
  taskController.updateTask.bind(taskController)
);

router.get(
  '/tasks/:taskId',
  taskController.getTask.bind(taskController)
);

router.delete(
  '/tasks/:taskId',
  taskController.deleteTask.bind(taskController)
);

// 課題評価関連
router.post(
  '/tasks/:taskId/evaluate',
  taskController.evaluateSubmission.bind(taskController)
);

// 統計情報
router.get(
  '/tasks/:taskId/statistics',
  taskController.getTaskStatistics.bind(taskController)
);

export { router as taskRoutes };
