import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { userCourseService } from './userCourseService';

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
  
      console.log('getCurrentChapter called with:', {
        userId,
        courseId,
        params: req.params,
        path: req.path,
        url: req.url
      });
  
      if (!userId) {
        console.log('No userId found in request');
        return res.status(401).json({ 
          success: false,
          message: 'Unauthorized' 
        });
      }
  
      const currentChapter = await userCourseService.getCurrentChapter(userId, courseId);
      console.log('getCurrentChapter result:', currentChapter);
      
      if (!currentChapter) {
        console.log('No chapter found');
        return res.status(404).json({ 
          success: false, 
          message: 'No available chapter found' 
        });
      }
  
      // チャプターの詳細情報を含むレスポンスを返す
      const response = {
        success: true,
        data: {
          chapterId: currentChapter.id,
          courseId: courseId,
          nextUrl: `/user/courses/${courseId}/chapters/${currentChapter.id}`,
          chapter: currentChapter
        }
      };
      console.log('Sending response:', response);
  
      return res.json(response);
    } catch (error) {
      console.error('Error in getCurrentChapter:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch current chapter' 
      });
    }
  }
}
// インスタンス作成とエクスポート
export const userCourseController = new UserCourseController();