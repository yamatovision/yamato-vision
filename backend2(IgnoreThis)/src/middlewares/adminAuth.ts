import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createLogger } from '../config/logger';
import asyncHandler from 'express-async-handler';

const logger = createLogger('AdminAuth');

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userRank: string;
  };
}

export const adminAuthMiddleware = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('No authorization header or invalid format');
      res.status(401).json({ 
        success: false,
        error: '認証が必要です' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key'
      ) as {
        userId: string;
        email: string;
        userRank: string;
      };

      if (decoded.userRank !== '管理者') {
        logger.warn(`Unauthorized access attempt by user: ${decoded.email}`);
        res.status(403).json({ 
          success: false,
          error: '管理者権限が必要です' 
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(401).json({ 
        success: false,
        error: 'トークンが無効です' 
      });
      return;
    }
  }
);
