import { Router } from 'express';
import { chapterController } from './chapterController';
import { authMiddleware } from '../../auth/authMiddleware';
import { userCourseService } from '../user/userCourseService';
import { chapterService } from './chapterService';  // 追加

const router = Router({ mergeParams: true });

// Admin routes
router.post('/', chapterController.createChapter.bind(chapterController));
router.put('/:chapterId', chapterController.updateChapter.bind(chapterController));
router.delete('/:chapterId', chapterController.deleteChapter.bind(chapterController));
router.put('/', chapterController.updateChaptersOrder.bind(chapterController));

// Public routes
router.get('/', chapterController.getChapters.bind(chapterController));
router.get('/:chapterId', chapterController.getChapter.bind(chapterController));
router.get('/:chapterId/access', chapterController.checkChapterAccess.bind(chapterController));

// Current chapter endpoint
router.get('/current-chapter', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentChapter = await userCourseService.getCurrentChapter(userId, courseId);
    
    if (!currentChapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'No available chapter found' 
      });
    }

    return res.json({ 
      success: true, 
      data: currentChapter 
    });
  } catch (error) {
    console.error('Error fetching current chapter:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch current chapter' 
    });
  }
});

// Complete chapter endpoint
router.post('/:chapterId/complete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId, chapterId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const nextChapter = await chapterService.completeChapter(userId, courseId, chapterId);
    
    return res.json({ 
      success: true, 
      data: { nextChapter } 
    });
  } catch (error) {
    console.error('Error completing chapter:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete chapter' 
    });
  }
});

export { router as chapterRoutes };