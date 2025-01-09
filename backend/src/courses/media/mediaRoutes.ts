import express from 'express';
import { mediaController } from './mediaController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = express.Router();

// Mux関連のエンドポイント
router.get('/admin/assets', mediaController.listMuxAssets);
router.patch('/admin/assets/:assetId/title', mediaController.updateAssetTitle); // 新規追加

// 進捗管理関連のエンドポイント
router.post('/progress', authMiddleware, mediaController.updateProgress);
router.get('/progress/:chapterId', authMiddleware, mediaController.getProgress);

export { router as mediaRoutes };