import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthenticatedRequest } from '../shared/types/auth.types';
import { MongoSyncService } from '../modules/admin/services/mongoSyncService';

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
    
    // ステータスチェック
    if (decoded.status === 'INACTIVE') {
      throw new Error('このアカウントは現在利用できません');
    }

    // MongoDBとの同期チェック
    const syncResult = await MongoSyncService.syncUserInfo(decoded.email);
    if (!syncResult.success) {
      console.warn(`User sync warning for ${decoded.email}: ${syncResult.message}`);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'このアカウントは現在利用できません') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(401).json({ error: '認証が必要です' });
    }
  }
};
