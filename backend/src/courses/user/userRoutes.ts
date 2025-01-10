import { Router } from 'express';
import { UserCourseController } from './userCourseController';
import { UserChapterController } from './userChapterController';
import { authMiddleware } from '../../auth/authMiddleware';
import { submissionController } from '../submissions/submissionController';  // 追加

const router = Router();
const userCourseController = new UserCourseController();
const userChapterController = new UserChapterController();

// Course Routes
router.use(authMiddleware);

// コース関連
router.get('/current', userCourseController.getCurrentUserCourse);  // パスを修正
router.get('/available', userCourseController.getAvailableCourses);
router.get('/', userCourseController.getUserCourses);
router.get('/:courseId', userCourseController.getCourseById);
router.get('/:courseId/active-users', userCourseController.getActiveUsers);
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.post('/:courseId/start', userCourseController.startCourse);

// チャプター関連
router.get('/:courseId/chapters/current', userChapterController.getCurrentChapter);
router.get('/:courseId/chapters/progress', userChapterController.getChaptersProgress);  // この順序で追加
router.get('/:courseId/chapters/:chapterId', userChapterController.getChapterDetails);
router.get('/:courseId/chapters/:chapterId/access', userChapterController.checkAccess);
router.patch('/:courseId/chapters/:chapterId/watch-progress', userChapterController.updateWatchProgress);
router.post('/:courseId/chapters/:chapterId/submission', userChapterController.recordSubmission);
router.get('/:courseId/chapters/:chapterId/peer-submissions', userChapterController.getChapterPeerSubmissions);
router.get('/:courseId/chapters/:chapterId/submission', submissionController.getSubmission); // 修正
router.get('/submissions/:submissionId', userChapterController.getPeerSubmissionDetails);
router.get('/:courseId/chapters/:chapterId/submission/latest',authMiddleware,submissionController.getLatestSubmission.bind(submissionController));
router.post(
    '/:courseId/chapters/:chapterId/first-access',
    authMiddleware,
    userChapterController.handleFirstAccess
  );

export { router as userRoutes };