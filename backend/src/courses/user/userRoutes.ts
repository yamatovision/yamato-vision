// userRoutes.ts

import { Router } from 'express';
import { UserCourseController } from './userCourseController';
import { UserChapterController } from './userChapterController';
import { authMiddleware } from '../../auth/authMiddleware';
import { submissionController } from '../submissions/submissionController';

const router = Router();
const userCourseController = new UserCourseController();
const userChapterController = new UserChapterController();

// Course Routes
router.use(authMiddleware);

// 固定パスのルートを先に定義
router.get('/current', userCourseController.getCurrentUserCourse);
router.get('/current-state', userCourseController.getCurrentCourseState);
router.get('/available', userCourseController.getAvailableCourses);
router.get('/', userCourseController.getUserCourses);

// パラメータを含むルートを後で定義
router.get('/:courseId', userCourseController.getCourseById);
router.get('/:courseId/active-users', userCourseController.getActiveUsers);
router.post('/:courseId/select', userCourseController.selectCourse);
router.post('/:courseId/activate', userCourseController.activateCourse);
router.post('/:courseId/format', userCourseController.formatCourse);
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.post('/:courseId/start', userCourseController.startCourse);

// チャプター関連のルート
router.get('/:courseId/chapters/current', userChapterController.getCurrentChapter);
router.get('/:courseId/chapters/progress', userChapterController.getChaptersProgress);
router.get('/:courseId/chapters/:chapterId', userChapterController.getChapterDetails);
router.get('/:courseId/chapters/:chapterId/access', userChapterController.checkAccess);
router.patch('/:courseId/chapters/:chapterId/watch-progress', userChapterController.updateWatchProgress);
router.post('/:courseId/chapters/:chapterId/submission', userChapterController.recordSubmission);
router.get('/:courseId/chapters/:chapterId/peer-submissions', userChapterController.getChapterPeerSubmissions);
router.get('/:courseId/chapters/:chapterId/submission', submissionController.getSubmission);
router.get('/:courseId/chapters/:chapterId/submission/latest', authMiddleware, submissionController.getLatestSubmission.bind(submissionController));
router.post('/:courseId/chapters/:chapterId/first-access', authMiddleware, userChapterController.handleFirstAccess);

// 特殊なルートは最後に配置
router.get('/submissions/:submissionId', userChapterController.getPeerSubmissionDetails);

export { router as userRoutes };