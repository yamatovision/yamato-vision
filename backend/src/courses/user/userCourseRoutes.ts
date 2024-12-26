// backend/src/courses/user/userCourseRoutes.ts
import { Router } from 'express';
import { userCourseController } from './userCourseController';
import { authMiddleware } from '../../auth/authMiddleware';
import { userCourseService } from './userCourseService';

const router = Router();

// 全てのルートで認証を要求
router.use(authMiddleware);

router.get('/available', userCourseController.getAvailableCourses);
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.get('/user-courses', userCourseController.getUserCourses);
router.post('/:courseId/start', userCourseController.startCourse);

// 現在のチャプター取得エンドポイント
router.get('/:courseId/current-chapter', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
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

export const userCourseRoutes = router;