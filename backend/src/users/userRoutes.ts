import express, { Request, Response, NextFunction } from 'express';
import { AdminUserController } from './admin/adminUserController';
import { ProfileController } from './profile/profileController';
import { authMiddleware } from '../auth/authMiddleware';

// Express Requestにuserプロパティを追加する型定義
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        rank?: string;
        [key: string]: any;
      };
    }
  }
}

const router = express.Router();
const adminUserController = new AdminUserController();
const profileController = new ProfileController();

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

// 管理者用ルート
// ユーザー一覧取得
router.get(
  '/admin/users',
  authMiddleware,
  adminCheck,
  adminUserController.getUsers.bind(adminUserController)
);

// ジェム付与
router.post(
  '/admin/users/:userId/gems',
  authMiddleware,
  adminCheck,
  adminUserController.grantGems.bind(adminUserController)
);

// バッジ付与
router.post(
  '/admin/users/:userId/badges',
  authMiddleware,
  adminCheck,
  adminUserController.grantBadge.bind(adminUserController)
);

// ペナルティ設定
router.post(
  '/admin/users/:userId/penalty',
  authMiddleware,
  adminCheck,
  adminUserController.togglePenalty.bind(adminUserController)
);

// プロフィール関連ルート
router.get(
  '/profile',
  authMiddleware,
  profileController.getProfile.bind(profileController)
);

router.patch(
  '/profile',
  authMiddleware,
  profileController.updateProfile.bind(profileController)
);

router.patch(
  '/profile/avatar',
  authMiddleware,
  profileController.updateAvatar.bind(profileController)
);
router.get(
  '/transcript',
  authMiddleware,
  profileController.getTranscript.bind(profileController)
);

export default router;
