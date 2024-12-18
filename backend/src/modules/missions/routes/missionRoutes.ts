import { Router } from 'express';
import { MissionController } from '../controllers/missionController';
import { authenticateJWT, requireAdmin } from '../../../shared/middleware/auth';

const router = Router();
const missionController = new MissionController();

// 管理者用エンドポイント
router.post('/missions', authenticateJWT, requireAdmin, missionController.createMission);
router.put('/missions/:id', authenticateJWT, requireAdmin, missionController.updateMission);
router.delete('/missions/:id', authenticateJWT, requireAdmin, missionController.deleteMission);

// 一般ユーザー用エンドポイント
router.get('/missions', authenticateJWT, missionController.getActiveMissions);
router.get('/missions/:id', authenticateJWT, missionController.getMissionById);
router.post('/missions/:missionId/users/:userId/check', authenticateJWT, missionController.checkMissionCompletion);

export default router;
