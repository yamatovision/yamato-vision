import express from 'express';
import { AdminBadgeController } from './badgeController';
import { authMiddleware } from '../auth/authMiddleware';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();
const adminBadgeController = new AdminBadgeController();

// 管理者権限チェックミドルウェア
const adminCheck = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.rank !== '管理者') {
    res.status(403).json({
      success: false,
      message: '管理者権限が必要です'
    });
    return;
  }
  next();
};

// バッジ関連のルート
router.get(
  '/',
  authMiddleware,
  adminCheck,
  adminBadgeController.getBadges.bind(adminBadgeController)
);

export default router;
