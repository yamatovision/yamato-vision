// /backend/src/auth/authController.ts

import { Request, Response } from 'express';
import { AuthService } from './authService';
import { JwtPayload } from 'jsonwebtoken';

interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  rank: string;
  mongoId: string;
  postgresId: string;
  isActive: boolean;
}

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'メールアドレスとパスワードを入力してください'
        });
      }

      const result = await authService.authenticateUser(email, password);
      return res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'ログイン処理中にエラーが発生しました'
      });
    }
  }

  async verifyToken(req: Request, res: Response) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'トークンが提供されていません'
      });
    }

    try {
      const decoded = authService.verifyToken(token) as CustomJwtPayload;
      
      return res.json({
        success: true,
        token: token,
        user: {
          id: decoded.userId,
          email: decoded.email,
          rank: decoded.rank,
          mongoId: decoded.mongoId
        }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'トークンが無効です'
      });
    }
  }
}
