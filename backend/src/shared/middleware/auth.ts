import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, AuthenticatedRequest } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ success: false, error: '認証トークンが必要です' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'トークンの有効期限が切れています' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: '無効なトークンです' });
    } else {
      res.status(500).json({ success: false, error: '認証処理中にエラーが発生しました' });
    }
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authenticatedReq = req as AuthenticatedRequest;
  if (authenticatedReq.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: '管理者権限が必要です' });
    return;
  }
  next();
};
