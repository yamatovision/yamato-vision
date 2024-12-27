import { Request, Response } from 'express';
import { userCourseService } from './userCourseService';

export class UserCourseController {
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
  async expireArchiveAccess(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const result = await userCourseService.expireArchiveAccess(userId, courseId);
      return res.json(result);
    } catch (error) {
      console.error('Error expiring archive access:', error);
      return res.status(500).json({ message: 'Failed to expire archive access' });
    }
  }
  
  async purchaseCourse(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const courseId = req.params.courseId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const result = await userCourseService.purchaseCourse(userId, courseId);
      
      if ('error' in result) {
        return res.status(400).json({ message: result.error });
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error purchasing course:', error);
      return res.status(500).json({ message: 'Failed to purchase course' });
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

  async startCourse(req: Request, res: Response) {  // クラス内のメソッドとして定義
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
}

export const userCourseController = new UserCourseController();