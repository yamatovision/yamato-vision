import express from 'express';
import { AvatarController } from './avatarController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = express.Router();
const avatarController = new AvatarController();

router.post(
  '/generate',
  authMiddleware,
  (req, res) => avatarController.generateAvatar(req, res)
);

export default router;