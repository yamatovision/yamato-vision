import { Router } from 'express';
import { courseController } from './courseController';
import { chapterRoutes } from './chapters/chapterRoutes';
import { taskRoutes } from './tasks/taskRoutes';
import { submissionRoutes } from './submissions/submissionRoutes';

const router = Router();

// 各機能のルートをマウント
router.use('/:courseId', taskRoutes);              // タスク関連
router.use('/:courseId', submissionRoutes);        // 提出関連
router.use('/:courseId/chapters', chapterRoutes);  // チャプター関連

// コースのCRUD操作
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

export const courseRoutes = router;
