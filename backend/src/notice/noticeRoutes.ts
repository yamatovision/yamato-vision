// backend/src/notice/noticeRoutes.ts
import express from 'express';
import { NoticeController } from './noticeController';
import { authMiddleware } from '../auth/authMiddleware';

const router = express.Router();
const noticeController = new NoticeController();

// 管理者用エンドポイント
router.post('/', authMiddleware, noticeController.createNotice);
router.get('/all', authMiddleware, noticeController.getAllNotices);
router.put('/:id', authMiddleware, noticeController.updateNotice);
router.delete('/:id', authMiddleware, noticeController.deleteNotice);
router.get('/:id', authMiddleware, noticeController.getNotice);


// ユーザー用エンドポイント
router.get('/', authMiddleware, noticeController.getActiveNotices);

export default router;