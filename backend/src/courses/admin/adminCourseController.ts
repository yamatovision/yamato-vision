// backend/src/courses/admin/adminCourseController.ts

import { Request, Response } from 'express';
import { AdminCourseService } from './adminCourseService';

export class AdminCourseController {
  private courseService: AdminCourseService;

  constructor() {
    this.courseService = new AdminCourseService();
  }

  createCourse = async (req: Request, res: Response) => {
    try {
      const course = await this.courseService.createCourse(req.body);
      return res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({ success: false, message: 'Failed to create course' });
    }
  };

  getCourse = async (req: Request, res: Response) => {
    try {
      const course = await this.courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      return res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error getting course:', error);
      return res.status(500).json({ success: false, message: 'Failed to get course' });
    }
  };

  getCourses = async (req: Request, res: Response) => {
    try {
      const published = req.query.published === 'all' ? undefined : req.query.published === 'true';
      
      console.log('Query params:', {
        published: req.query.published,
        parsedPublished: published
      });
  
      // フィルターオブジェクトを作成
      const filter = {
        // publishedがundefinedの場合はフィルターに含めない
        ...(published !== undefined && { isPublished: published })
      };
  
      const courses = await this.courseService.getCourses(filter);
      return res.json({ success: true, data: courses });
    } catch (error) {
      console.error('Error getting courses:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get courses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  

  updateCourse = async (req: Request, res: Response) => {
    try {
      const course = await this.courseService.updateCourse(req.params.id, req.body);
      return res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error updating course:', error);
      return res.status(500).json({ success: false, message: 'Failed to update course' });
    }
  };

  deleteCourse = async (req: Request, res: Response) => {
    try {
      await this.courseService.deleteCourse(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete course' });
    }
  };

  updateCourseThumbnail = async (req: Request, res: Response) => {
    try {
      const { thumbnailUrl } = req.body;
      const course = await this.courseService.updateCourse(req.params.id, { thumbnail: thumbnailUrl });
      return res.json({ success: true, data: course });
    } catch (error) {
      console.error('Error updating course thumbnail:', error);
      return res.status(500).json({ success: false, message: 'Failed to update course thumbnail' });
    }
  };
}