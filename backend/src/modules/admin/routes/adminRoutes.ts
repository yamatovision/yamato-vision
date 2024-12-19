import express from 'express';
import { auth } from '../../../shared/middleware/auth';
import { adminAuth } from '../../../middlewares/adminAuth';
import { AdminController } from '../controllers/adminController';

const router = express.Router();

// 認証ミドルウェアを適用
router.use(auth);
router.use(adminAuth);

// ユーザー管理ルート
router.get('/users', AdminController.getUsers);
router.get('/users/:userId', AdminController.getUserDetails);
router.get('/badges', AdminController.getBadges);
router.post('/users/:userId/badges', AdminController.assignBadge);
router.post('/users/:userId/gems', AdminController.grantGems);
router.post('/users/:userId/penalty', AdminController.updatePenaltyStatus);

export default router;
