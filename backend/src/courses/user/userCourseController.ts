import { Request, Response } from 'express';
import { userCourseService } from './userCourseService';

export class UserCourseController {
  async getAvailableCourses(req: Request, res: Response) {
    try {
      // ユーザー情報を取得（認証済みユーザーのため必ずある）
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // ユーザーの情報に基づいて利用可能なコースを取得
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
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // コース購入の実行
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

      // ユーザーの購入済みコースを取得
      const courses = await userCourseService.getUserCourses(userId);
      return res.json(courses);
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return res.status(500).json({ message: 'Failed to fetch user courses' });
    }
  }
}

export const userCourseController = new UserCourseController();
