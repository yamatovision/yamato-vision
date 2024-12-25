import { Router } from 'express';
import { courseController } from './courseController';
import { authMiddleware } from '../auth/authMiddleware';
import { adminMiddleware } from '../auth/adminMiddleware';

const router = Router();

// Admin routes
router.post('/', [authMiddleware, adminMiddleware], courseController.createCourse);
router.put('/:id', [authMiddleware, adminMiddleware], courseController.updateCourse);
router.post('/:courseId/chapters', [authMiddleware, adminMiddleware], courseController.addChapter);
router.delete('/:id', [authMiddleware, adminMiddleware], courseController.deleteCourse);

// Public routes
router.get('/', authMiddleware, courseController.getCourses);
router.get('/:id', authMiddleware, courseController.getCourse);

export const courseRoutes = router;
