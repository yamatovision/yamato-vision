// /backend/src/auth/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { AuthService } from './authService';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: any;
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

    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
    return;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '認証に失敗しました'
    });
  }
};
