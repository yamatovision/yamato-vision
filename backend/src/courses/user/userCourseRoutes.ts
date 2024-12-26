import { Router } from 'express';
import { userCourseController } from './userCourseController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

// 全てのルートで認証を要求
router.use(authMiddleware);

router.get('/available', userCourseController.getAvailableCourses);
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.get('/user-courses', userCourseController.getUserCourses);
router.post('/:courseId/start', userCourseController.startCourse);

export const userCourseRoutes = router;
