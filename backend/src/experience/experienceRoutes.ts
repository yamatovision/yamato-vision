import express from 'express';
import { ExperienceController } from './experienceController';
import { authMiddleware } from '../auth/authMiddleware';

const router = express.Router();
const experienceController = new ExperienceController();

// ミドルウェアの適用
router.use(authMiddleware);

// 経験値の追加
router.post('/gain', experienceController.handleExperienceGain);

// 経験値状態の取得
router.get('/status/:userId?', experienceController.getExperienceStatus);

// トークンからの経験値計算
router.post('/calculate-token', experienceController.calculateTokenExperience);

export default router;
