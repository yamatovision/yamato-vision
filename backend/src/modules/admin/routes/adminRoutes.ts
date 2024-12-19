import express from 'express';
import { auth } from '../../../shared/middleware/auth';
import { adminAuth } from '../../../middlewares/adminAuth';
import AdminController from '../controllers/adminController';
const router = express.Router();
// 認証ミドルウェアを適用
router.use(auth);
router.use(adminAuth);
// ユーザー管理ルート
router.get('/users', AdminController.getUsers);
router.get('/users/:userId', AdminController.getUserDetails);
router.post('/users/:userId/badges/:badgeId', AdminController.assignBadge);
router.patch('/users/:userId/nickname', AdminController.updateNickname);
router.patch('/users/:userId/visibility', AdminController.updateVisibility);
export default router;
