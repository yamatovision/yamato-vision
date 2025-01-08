import { Router } from 'express';
import { UserCourseController } from './userCourseController';
import { UserChapterController } from './userChapterController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = Router();
const userCourseController = new UserCourseController();
const userChapterController = new UserChapterController();

// Course Routes
router.use(authMiddleware);

// コース関連
router.get('/available', userCourseController.getAvailableCourses);
router.get('/courses', userCourseController.getUserCourses);
router.get('/courses/current', userCourseController.getCurrentUserCourse);
router.get('/courses/:courseId', userCourseController.getCourseById);
router.get('/courses/:courseId/active-users', userCourseController.getActiveUsers);
router.post('/courses/:courseId/purchase', userCourseController.purchaseCourse);
router.post('/courses/:courseId/start', userCourseController.startCourse);

// チャプター関連
router.get('/courses/:courseId/chapters/current', userChapterController.getCurrentChapter);
router.get('/courses/:courseId/chapters/:chapterId', userChapterController.getChapterDetails);
router.get('/courses/:courseId/chapters/:chapterId/access', userChapterController.checkAccess);
router.patch('/courses/:courseId/chapters/:chapterId/watch-progress', userChapterController.updateWatchProgress);
router.post('/courses/:courseId/chapters/:chapterId/submission', userChapterController.recordSubmission);
router.get('/courses/:courseId/chapters/:chapterId/peer-submissions', userChapterController.getChapterPeerSubmissions);
router.get('/submissions/:submissionId', userChapterController.getPeerSubmissionDetails);

export { router as userRoutes };