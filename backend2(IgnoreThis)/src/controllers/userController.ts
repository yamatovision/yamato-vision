import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../shared/types/auth.types';
import { AuthService } from '../services/authService';
import { User } from '../models/UserModel';
import { createLogger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const prisma = new PrismaClient();
const logger = createLogger('UserController');

export const userController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authResult = await AuthService.authenticateUser(email, password);

      if (authResult.success) {
        const user = authResult.user;
        
        // 最終ログイン日時を更新（MongoDB）
        await User.findByIdAndUpdate(user._id, {
          lastLoginDate: new Date()
        });

        // PostgreSQLにユーザーを作成/更新
        const postgresUser = await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name || user.email,
            rank: user.userRank,
            mongoId: user._id.toString(),
            status: user.userRank === '退会者' ? 'INACTIVE' : 'ACTIVE',
            password: '', // MongoDBで認証するため不要
            level: 1,
            experience: 0,
            gems: 0
          },
          update: {
            rank: user.userRank,
            status: user.userRank === '退会者' ? 'INACTIVE' : 'ACTIVE',
          }
        });

        const { password: _, ...userWithoutPassword } = user.toObject();
        
        // トークンの生成
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            userRank: user.userRank,
            postgresId: postgresUser.id
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
      logger.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ログインに失敗しました' 
      });
    }
  },

  // 現在のユーザー情報を取得
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          name: true,
          rank: true,
          status: true,
          level: true,
          experience: true,
          gems: true
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ユーザー情報の取得に失敗しました' 
      });
    }
  },

  // ユーザー設定の更新
  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { settings } = req.body;
      const updatedUser = await prisma.user.update({
        where: { email: userEmail },
        data: settings,
        select: {
          id: true,
          email: true,
          name: true,
          rank: true,
          status: true,
          level: true,
          experience: true,
          gems: true
        }
      });

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ユーザー設定の更新に失敗しました' 
      });
    }
  }
};

export default userController;
