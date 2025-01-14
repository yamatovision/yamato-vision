import express from 'express';
import { mediaController } from './mediaController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = express.Router();

// Mux関連のエンドポイント
router.get('/admin/assets', mediaController.listMuxAssets);
router.get('/admin/assets/:assetId/status', mediaController.getAssetStatus);  // 新規追加
router.patch('/admin/assets/:assetId/title', mediaController.updateAssetTitle);

// 進捗管理関連のエンドポイント（オーディオ・ビデオ共通）
router.post('/progress', authMiddleware, mediaController.updateProgress);
router.get('/progress/:chapterId', authMiddleware, mediaController.getProgress);

// タイプ別アセット一覧取得（オプション）
router.get('/admin/assets/audio', (req, res) => {
  req.query.type = 'audio';
  return mediaController.listMuxAssets(req, res);
});

router.get('/admin/assets/video', (req, res) => {
  req.query.type = 'video';
  return mediaController.listMuxAssets(req, res);
});

export { router as mediaRoutes };