import { Router } from 'express';
import { courseController } from './courseController';
import { chapterRoutes } from './chapters/chapterRoutes';
import { taskRoutes } from './tasks/taskRoutes';
import { submissionRoutes } from './submissions/submissionRoutes';
import { userCourseRoutes } from './user/userCourseRoutes';

const router = Router();

// ユーザー向けルートを先に定義（より具体的なパスを先に）
router.use('/user', userCourseRoutes);  // /api/courses/user/*

// 管理者向けのルート
router.use('/:courseId/chapters', chapterRoutes);  
router.use('/:courseId/tasks', taskRoutes);        
router.use('/:courseId/submissions', submissionRoutes);

// 基本的なコースのCRUD操作
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

export const courseRoutes = router;