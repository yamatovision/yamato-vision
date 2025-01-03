import { Router } from 'express';
import { userCourseController } from './userCourseController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

// 全てのルートで認証を要求
router.use(authMiddleware);

// コースの一覧と取得
router.get('/available', userCourseController.getAvailableCourses);
router.get('/user-courses', userCourseController.getUserCourses);
router.get('/current', userCourseController.getCurrentUserCourse);
router.get('/:courseId/current', userCourseController.getCurrentUserCourseById);
router.get('/:courseId/current-chapter', userCourseController.getCurrentChapter); // 修正

// コースのアクション
router.post('/:courseId/start', userCourseController.startCourse);

export const userCourseRoutes = router;