import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../shared/types/auth.types';
import { AuthService } from '../services/authService';
import { User } from '../models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const userController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authResult = await AuthService.authenticateUser(email, password);

      if (authResult.success) {
        const user = authResult.user;
        
        // 最終ログイン日時を更新
        await User.findByIdAndUpdate(user._id, {
          lastLoginDate: new Date()
        });

        const { password: _, ...userWithoutPassword } = user.toObject();
        
        // ブルーランプと同じトークン形式を使用
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            userRank: user.userRank
          },
          JWT_SECRET,
          { expiresIn: '336h' }
        );

        res.json({
          success: true,
          message: 'ログインに成功しました',
          data: { 
            token,
            user: userWithoutPassword
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: authResult.message
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ログインに失敗しました' 
      });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ 
          success: false,
          error: '認証が必要です' 
        });
        return;
      }

      const user = await User.findById(req.user.userId).select('-password');

      if (!user) {
        res.status(404).json({ 
          success: false,
          error: 'ユーザーが見つかりません' 
        });
        return;
      }

      if (user.userRank === '退会者') {
        res.status(403).json({
          success: false,
          error: 'このアカウントは退会済みです'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false,
        error: 'プロフィールの取得に失敗しました' 
      });
    }
  }
};

export default userController;
