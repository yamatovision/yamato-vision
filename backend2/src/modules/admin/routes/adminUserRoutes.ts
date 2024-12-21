import express from 'express';
import { adminUserController } from '../controllers/adminUserController';
import { adminAuthMiddleware } from '../../../middlewares/adminAuth';

const router = express.Router();

// 全てのルートに管理者認証を適用
router.use(adminAuthMiddleware);

// ユーザー管理のエンドポイント
router.get('/users', adminUserController.getUsers);
router.post('/users/:userId/penalty', adminUserController.togglePenalty);
router.post('/users/:userId/badges', adminUserController.grantBadge);
router.post('/users/:userId/gems', adminUserController.grantGems);

export default router;
