import express from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middlewares/auth';

const router = express.Router();

// プロフィール関連のルートは /api/users/profile に集約されているため、
// このファイルではユーザー関連の基本的なルートのみを定義

// 一般的なユーザー関連のルート（必要に応じて追加）
router.get('/me', auth, userController.getCurrentUser);
router.patch('/settings', auth, userController.updateSettings);

export default router;
