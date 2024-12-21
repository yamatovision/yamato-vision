import { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';
import { JwtPayload } from 'jsonwebtoken';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: any;
}

interface DecodedToken extends JwtPayload {
  userId?: string;
  id?: string;
  email: string;
  rank: string;
  mongoId?: string;
  isActive: boolean;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
    }

    const decoded = authService.verifyToken(token) as DecodedToken;
    req.user = {
      id: decoded.userId || decoded.id,  // userIdがある場合はそれを使用、なければidを使用
      email: decoded.email,
      rank: decoded.rank,
      mongoId: decoded.mongoId,
      isActive: decoded.isActive
    };
    
    next();
    return;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: '認証に失敗しました'
    });
  }
};
