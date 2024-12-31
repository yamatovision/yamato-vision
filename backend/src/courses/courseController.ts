import { Request, Response } from 'express';
import { courseService } from './courseService';
import { CreateCourseDTO, UpdateCourseDTO, CreateChapterDTO } from './courseTypes';

export class CourseController {
  async createCourse(req: Request<{}, {}, CreateCourseDTO>, res: Response) {
    try {
      const course = await courseService.createCourse(req.body);
      return res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create course'
      });
    }
  }

  async updateCourse(req: Request<{ id: string }, {}, UpdateCourseDTO>, res: Response) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      return res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error updating course:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update course'
      });
    }
  }

  async updateCourseThumbnail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { thumbnail } = req.body;
  
      if (!thumbnail) {
        return res.status(400).json({
          success: false,
          error: 'Thumbnail URL is required'
        });
      }
  
      const course = await courseService.updateCourse(id, { thumbnail });
      
      return res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error updating course thumbnail:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update course thumbnail'
      });
    }
  }
  
  async getCourse(req: Request<{ id: string }>, res: Response) {
    try {
      console.log('Fetching course with ID:', req.params.id); // ログ追加

      const course = await courseService.getCourseById(req.params.id);
      
      console.log('Found course:', course); // ログ追加

      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      return res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch course'
      });
    }
  }

  async getCourses(req: Request, res: Response) {
    try {
      console.log('Fetching courses with query:', req.query); // ログ追加

      const filter = req.query.published === 'all' 
        ? undefined
        : {
            isPublished: req.query.published === 'true',
            isArchived: req.query.archived === 'true'
          };
      
      const courses = await courseService.getCourses(filter);

      console.log('Found courses count:', courses.length); // ログ追加

      return res.json({
        success: true,
        data: courses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch courses'
      });
    }
  }

  async deleteCourse(req: Request<{ id: string }>, res: Response) {
    try {
      await courseService.deleteCourse(req.params.id);
      return res.status(204).json({
        success: true,
        data: null
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete course'
      });
    }
  }
}

export const courseController = new CourseController();