import { Router } from 'express';
import { userCourseController } from './userCourseController';  // 名前付きインポートのみを使用
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();

// 全てのルートで認証を要求
router.use(authMiddleware);

// コースの一覧と取得
router.get('/available', userCourseController.getAvailableCourses);
router.get('/user-courses', userCourseController.getUserCourses);
router.get('/current', userCourseController.getCurrentUserCourse);
router.get('/:courseId/current', userCourseController.getCurrentUserCourseById);
router.get('/:courseId/current-chapter', userCourseController.getCurrentChapter);




// コースのアクション
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.post('/:courseId/start', userCourseController.startCourse);
router.post('/:courseId/expire-archive', userCourseController.expireArchiveAccess);
router.post('/:courseId/repurchase', userCourseController.repurchaseCourse);

export const userCourseRoutes = router;