// src/levelMessages/levelMessageRoutes.ts
import express from 'express';
import { levelMessageController } from './levelMessageController';
import { authMiddleware } from '../auth/authMiddleware';

const router = express.Router();

// 通常の認証ミドルウェアを使用
router.use(authMiddleware);

// 各ルートで管理者チェックを行う
const checkAdmin = (req: any, res: express.Response, next: express.NextFunction): void => {
  if (req.user?.rank !== '管理者') {
    res.status(403).json({
      success: false,
      message: '管理者権限が必要です'
    });
    return;
  }
  next();
};

router.get('/', checkAdmin, levelMessageController.getAll);
router.get('/:level', checkAdmin, levelMessageController.getByLevel);
router.post('/', checkAdmin, levelMessageController.create);
router.patch('/:id', checkAdmin, levelMessageController.update);
router.delete('/:id', checkAdmin, levelMessageController.delete);

export default router;