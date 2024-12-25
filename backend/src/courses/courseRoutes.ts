import { Router } from 'express';
import { courseController } from './courseController';

const router = Router();

// Admin routes - ミドルウェアを削除
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.post('/:courseId/chapters', courseController.addChapter);
router.delete('/:id', courseController.deleteCourse);

// Public routes - ミドルウェアを削除
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

export const courseRoutes = router;
