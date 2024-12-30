// /backend/src/auth/authRoutes.ts
import { Router } from 'express';
import { AuthController } from './authController';
import { authMiddleware } from './authMiddleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
// authMiddlewareのみを使用し、verifyTokenは削除
router.get('/verify', authMiddleware, (req, res) => {
  // middlewareで検証済みのユーザー情報を返す
  res.json({
    success: true,
    user: req.user
  });
});

export default router;