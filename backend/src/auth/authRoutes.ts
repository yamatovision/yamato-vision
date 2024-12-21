// /backend/src/auth/authRoutes.ts

import { Router } from 'express';
import { AuthController } from './authController';
import { authMiddleware } from './authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verifyToken);

export default router;