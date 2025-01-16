import express from 'express';
import { RankingController } from './rankingController';
import { authMiddleware } from '../../auth/authMiddleware';

const router = express.Router();
const rankingController = new RankingController();


router.get(
  '/courses/:courseId',
  authMiddleware,
  (req, res) => rankingController.getCourseRanking(req, res)
);


export default router;