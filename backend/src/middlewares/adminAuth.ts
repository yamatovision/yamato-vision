import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../shared/types/auth.types';

export const adminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '認証が必要です' });
      return;
    }

    const mongoUser = await mongoose.model('User').findOne({ 
      email: req.user.email 
    });

    if (!mongoUser || mongoUser.userRank !== '管理者') {
      res.status(403).json({ error: '管理者権限が必要です' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};
