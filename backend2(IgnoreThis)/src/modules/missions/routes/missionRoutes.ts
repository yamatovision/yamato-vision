import express from 'express';
import { auth } from '../../../shared/middleware/auth';
import { requireAdmin } from '../../../shared/middleware/auth';
import { MissionController } from '../controllers/missionController';

const router = express.Router();

// ミドルウェアとして認証を適用
router.use('/missions', auth);

// 一般ユーザー向けルート
router.get('/missions', MissionController.getMissions);
router.get('/missions/:missionId', MissionController.getMissionById);
router.post('/missions/:missionId/complete', MissionController.completeMission);

// 管理者向けルート
router.use('/admin/missions', requireAdmin);
router.post('/admin/missions', requireAdmin, MissionController.createMission);
router.put('/admin/missions/:missionId', requireAdmin, MissionController.updateMission);
router.delete('/admin/missions/:missionId', requireAdmin, MissionController.deleteMission);

export default router;
