// backend/src/courses/admin/adminRoutes.ts

import { Router } from 'express';
import { AdminCourseController } from './adminCourseController';
import { AdminChapterController } from './adminChapterController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();
const adminCourseController = new AdminCourseController();
const adminChapterController = new AdminChapterController();

// 既存のエンドポイントとの互換性を保つため、同じパスを維持
router.use(authMiddleware);

// コース関連のルート
router.post('/courses', adminCourseController.createCourse);
router.get('/courses', adminCourseController.getCourses);
router.get('/courses/:id', adminCourseController.getCourse);
router.put('/courses/:id', adminCourseController.updateCourse);
router.delete('/courses/:id', adminCourseController.deleteCourse);
router.patch('/courses/:id/thumbnail', adminCourseController.updateCourseThumbnail);

// チャプター関連のルート
router.post('/courses/:courseId/chapters', adminChapterController.createChapter);
router.get('/courses/:courseId/chapters', adminChapterController.getChapters);
router.get('/courses/:courseId/chapters/:chapterId', adminChapterController.getChapter);
router.put('/courses/:courseId/chapters/:chapterId', adminChapterController.updateChapter);
router.delete('/courses/:courseId/chapters/:chapterId', adminChapterController.deleteChapter);
router.put('/courses/:courseId/chapters', adminChapterController.updateChaptersOrder);
router.patch('/courses/:courseId/chapters/:chapterId/visibility', adminChapterController.updateVisibility);
router.patch('/courses/:courseId/chapters/:chapterId/perfect-only', adminChapterController.updatePerfectOnly);
router.post('/courses/:courseId/chapters/reorder', adminChapterController.reorderChapters);
router.post('/courses/:courseId/chapters/reset-order', adminChapterController.resetChapterOrder);


export { router as adminRoutes };