import { Router } from 'express';
import { chapterController } from './chapterController';
const router = Router({ mergeParams: true }); // mergeParamsを有効化してcourseIdを受け取れるようにする
// Admin routes
router.post('/', chapterController.createChapter.bind(chapterController));
router.put('/:chapterId', chapterController.updateChapter.bind(chapterController));
router.delete('/:chapterId', chapterController.deleteChapter.bind(chapterController));
router.put('/', chapterController.updateChaptersOrder.bind(chapterController));
// Public routes
router.get('/', chapterController.getChapters.bind(chapterController));
router.get('/:chapterId', chapterController.getChapter.bind(chapterController));
router.get('/:chapterId/access', chapterController.checkChapterAccess.bind(chapterController));
export { router as chapterRoutes };
