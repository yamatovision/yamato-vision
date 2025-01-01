// backend/src/courses/media/mediaRoutes.ts
import express from 'express';
import { mediaController } from './mediaController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = express.Router();

// backend/src/courses/media/mediaRoutes.ts
router.post('/upload-url', authMiddleware, mediaController.getUploadUrl);
router.get('/status/:videoId', authMiddleware, mediaController.getVideoStatus);

export { router as mediaRoutes };