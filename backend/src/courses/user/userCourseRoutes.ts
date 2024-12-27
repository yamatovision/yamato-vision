// backend/src/courses/user/userCourseRoutes.ts
import { Router } from 'express';
import { userCourseController } from './userCourseController';
import { authMiddleware } from '../../auth/authMiddleware';
import { userCourseService } from './userCourseService';
import { PrismaClient } from '@prisma/client';  // 追加


const router = Router();
const prisma = new PrismaClient();  // 追加

// 全てのルートで認証を要求
router.use(authMiddleware);

router.get('/available', userCourseController.getAvailableCourses);
router.post('/:courseId/purchase', userCourseController.purchaseCourse);
router.get('/user-courses', userCourseController.getUserCourses);
router.post('/:courseId/start', userCourseController.startCourse);

// 現在のチャプター取得エンドポイント

// backend/src/courses/user/userCourseRoutes.ts
router.get('/:courseId/current', async (req, res) => {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;
  
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
  
      const currentCourse = await userCourseService.getCurrentUserCourse(userId, courseId);
      
      if (!currentCourse) {
        return res.status(404).json({ 
          success: false, 
          message: 'Current course not found' 
        });
      }
  
      return res.json({ 
        success: true, 
        data: currentCourse 
      });
    } catch (error) {
      console.error('Error fetching current course:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch current course' 
      });
    }
  });
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

router.post(
  '/:courseId/expire-archive',
  authMiddleware,
  userCourseController.expireArchiveAccess
);

router.get('/current', async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
  
      // アクティブなコースを取得（isActive: trueのもの）
      const activeCourse = await prisma.userCourse.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          course: {
            include: {
              chapters: {
                orderBy: {
                  orderIndex: 'asc'
                }
              }
            }
          }
        }
      });
  
      if (!activeCourse) {
        return res.status(404).json({
          success: false,
          message: 'No active course found'
        });
      }
  
      return res.json({
        success: true,
        data: activeCourse
      });
    } catch (error) {
      console.error('Error fetching current course:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch current course'
      });
    }
  });

export const userCourseRoutes = router;