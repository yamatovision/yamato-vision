import express from 'express';
import { userController } from '../controllers/userController';

const router = express.Router();

// 認証関連のみ
router.post('/login', userController.login);

export default router;
