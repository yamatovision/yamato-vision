import express from 'express';
import { homeController } from './homeController';
import { authMiddleware } from '../auth/authMiddleware';  // パスを修正

const router = express.Router();

router.get(
  '/home-data',
  authMiddleware,
  homeController.getHomePageData.bind(homeController)
);

export default router;