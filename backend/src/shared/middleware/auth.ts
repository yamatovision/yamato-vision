import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthenticatedRequest } from '../types/auth.types';
import { MongoSyncService } from '../../modules/admin/services/mongoSyncService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('トークンがありません');

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // ユーザーランクによる退会チェック
    if (decoded.userRank === '退会者') {
      throw new Error('このアカウントは退会済みです');
    }

    // MongoDBとの同期チェック
    const syncResult = await MongoSyncService.syncUserInfo(decoded.email);
    if (!syncResult.success) {
      console.warn(`User sync warning for ${decoded.email}: ${syncResult.message}`);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'このアカウントは退会済みです') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(401).json({ error: '認証が必要です' });
    }
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.userRank || req.user.userRank !== '管理者') {
    res.status(403).json({ error: '管理者権限が必要です' });
    return;
  }
  next();
};
