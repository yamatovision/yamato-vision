import express from 'express';
import { NotificationController } from './notificationController';
import { authMiddleware } from '../auth/authMiddleware';

const router = express.Router();
const notificationController = new NotificationController();

// 認証ミドルウェアの適用
router.use(authMiddleware);

// 通知の取得
router.get('/pending/:userId?', notificationController.getPendingNotifications);

// 通知の削除
router.post('/remove', notificationController.removeNotification);

// 経験値獲得通知
router.post('/experience-gain', notificationController.handleExperienceGain);

// レベルアップ通知
router.post('/level-up', notificationController.handleLevelUp);

export default router;
