import express from 'express';
import userController from '../controllers/userController';
import auth from '../middlewares/auth';

const router = express.Router();

// 公開エンドポイント
router.post('/register', userController.register);
router.post('/login', userController.login);

// 認証が必要なエンドポイント
router.get('/profile', auth, userController.getProfile);
router.patch('/profile', auth, userController.updateProfile);

export default router;
