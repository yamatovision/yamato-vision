import { Router } from 'express';
import { courseController } from './courseController';
import { chapterRoutes } from './chapters/chapterRoutes';
import { taskRoutes } from './tasks/taskRoutes';
import { submissionRoutes } from './submissions/submissionRoutes';
import { userCourseRoutes } from './user/userCourseRoutes';

const router = Router();

// より具体的なルートを先に定義
router.patch('/:id/thumbnail', courseController.updateCourseThumbnail); // サムネイル更新用

// 基本的なコースのCRUD操作
router.post('/', courseController.createCourse);
router.put('/:id', courseController.updateCourse);
router.get('/:id', courseController.getCourse);
router.get('/', courseController.getCourses);
router.delete('/:id', courseController.deleteCourse);

// サブリソースのルート
router.use('/:courseId/chapters', chapterRoutes);
router.use('/:courseId/tasks', taskRoutes);
router.use('/:courseId/submissions', submissionRoutes);

// ユーザー向けルート
router.use('/user', userCourseRoutes);

export const courseRoutes = router;