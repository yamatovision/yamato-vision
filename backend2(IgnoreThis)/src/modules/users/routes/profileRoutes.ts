import express from 'express';
import { userProfileController } from '../controllers/userProfileController';
import { auth } from '../../../shared/middleware/auth';
import { validateProfileUpdate } from '../middleware/profileValidation';

const router = express.Router();

// プロフィール取得
router.get(
  '/profile',
  auth,
  userProfileController.getProfile.bind(userProfileController)
);

// プロフィール更新
router.patch(
  '/profile',
  auth,
  validateProfileUpdate,
  userProfileController.updateProfile.bind(userProfileController)
);

export default router;
