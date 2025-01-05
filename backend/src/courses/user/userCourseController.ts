// backend/src/courses/user/userCourseController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { userCourseService } from './userCourseService';
import { GetPeerSubmissionsResponse } from './userCourseTypes';

const prisma = new PrismaClient();

class UserCourseController {
  async getAvailableCourses(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const courses = await userCourseService.getAvailableCourses(userId);
      return res.json(courses);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      return res.status(500).json({ message: 'Failed to fetch available courses' });
    }
  }

  async purchaseCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const courseId = req.params.courseId;

      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized' 
        });
      }

      const result = await userCourseService.startCourse(userId, courseId);
      
      if ('error' in result) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error purchasing course:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purchase course'
      });
    }
  }

  async getUserCourses(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const courses = await userCourseService.getUserCourses(userId);
      return res.json(courses);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return res.status(500).json({ message: 'Failed to fetch user courses' });
    }
  }
  async getActiveUsers(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
  
      const activeUsers = await userCourseService.getActiveCourseUsers(courseId);
      return res.json({
        success: true,
        data: {
          users: activeUsers
        }
      });
    } catch (error) {
      console.error('Error fetching active users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch active users'
      });
    }
  }

  // backend/src/courses/user/userCourseController.ts に追加
  async getChapterPeerSubmissions(req: Request, res: Response) {
    try {
      const { courseId, chapterId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 10;
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }
  
      const result = await userCourseService.getChapterPeerSubmissions(
        courseId,
        chapterId,
        userId,
        page,
        perPage
      );
  
      return res.status(200).json({
        success: true,
        data: result
      });
  
    } catch (error) {
      console.error('Error fetching peer submissions:', error);
      return res.status(500).json({
        success: false,
        message: '提出一覧の取得に失敗しました'
      });
    }
  }

  async startCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const courseId = req.params.courseId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await userCourseService.startCourse(userId, courseId);
      
      if ('error' in result) {
        return res.status(400).json({ message: result.error });
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error starting course:', error);
      return res.status(500).json({ message: 'Failed to start course' });
    }
  }

  async getCurrentUserCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }

      const activeCourse = await userCourseService.getCurrentUserCourse(userId);

      if (!activeCourse) {
        return res.json({
          success: true,
          data: null
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
  }

  async getCurrentUserCourseById(req: Request, res: Response) {
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
  }

  async getCurrentChapter(req: Request, res: Response) {
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
          message: 'No chapter found' 
        });
      }
  
      return res.json({
        success: true,
        data: currentChapter
      });
    } catch (error) {
      console.error('Error in getCurrentChapter:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch current chapter'
      });
    }
  }
}

// デフォルトエクスポートとしてインスタンスをエクスポート
const userCourseController = new UserCourseController();
export default userCourseController;