import { Request, Response } from 'express';
import { courseService } from './courseService';
import { CreateCourseDTO, UpdateCourseDTO, CreateChapterDTO } from './courseTypes';

export class CourseController {
  async createCourse(req: Request<{}, {}, CreateCourseDTO>, res: Response) {
    try {
      const course = await courseService.createCourse(req.body);
      return res.status(201).json(course);
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({ message: 'Failed to create course' });
    }
  }

  async updateCourse(req: Request<{ id: string }, {}, UpdateCourseDTO>, res: Response) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      return res.json(course);
    } catch (error) {
      console.error('Error updating course:', error);
      return res.status(500).json({ message: 'Failed to update course' });
    }
  }

  async addChapter(req: Request<{ courseId: string }, {}, CreateChapterDTO>, res: Response) {
    try {
      const chapter = await courseService.addChapter(req.params.courseId, req.body);
      return res.status(201).json(chapter);
    } catch (error) {
      console.error('Error adding chapter:', error);
      return res.status(500).json({ message: 'Failed to add chapter' });
    }
  }

  async getCourse(req: Request<{ id: string }>, res: Response) {
    try {
      const course = await courseService.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      return res.json(course);
    } catch (error) {
      console.error('Error fetching course:', error);
      return res.status(500).json({ message: 'Failed to fetch course' });
    }
  }

  async getCourses(req: Request, res: Response) {
    try {
      const filter = {
        isPublished: req.query.published === 'true',
        isArchived: req.query.archived === 'true'
      };
      const courses = await courseService.getCourses(filter);
      return res.json(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({ message: 'Failed to fetch courses' });
    }
  }

  async deleteCourse(req: Request<{ id: string }>, res: Response) {
    try {
      await courseService.deleteCourse(req.params.id);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.status(500).json({ message: 'Failed to delete course' });
    }
  }
}

export const courseController = new CourseController();
