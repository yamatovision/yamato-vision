// backend/src/courses/user/userCourseRoutes.ts
import { Router } from 'express';
import userCourseController from './userCourseController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

// 全てのルートで認証を要求
router.use(authMiddleware);

// コースの一覧と取得
router.get('/available', userCourseController.getAvailableCourses.bind(userCourseController));
router.get('/user-courses', userCourseController.getUserCourses.bind(userCourseController));
router.get('/current', userCourseController.getCurrentUserCourse.bind(userCourseController));
router.get('/:courseId/current', userCourseController.getCurrentUserCourseById.bind(userCourseController));
router.get('/:courseId/current-chapter', userCourseController.getCurrentChapter.bind(userCourseController));

// コースのアクション
router.post('/:courseId/start', userCourseController.startCourse.bind(userCourseController));
router.post('/:courseId/purchase', userCourseController.purchaseCourse.bind(userCourseController));

export const userCourseRoutes = router;