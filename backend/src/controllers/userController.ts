import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../schemas/userSchema';
import { AuthenticatedRequest } from '../shared/types/auth.types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const userController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ 
          success: false, 
          error: validation.error.errors 
        });
        return;
      }

      const { email, password, name } = validation.data;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({ 
          success: false,
          error: 'このメールアドレスは既に登録されています' 
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          level: 1,
          experience: 0,
          rank: 'お試し',
          gems: 0
        }
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          rank: user.rank,
          status: 'ACTIVE',
          role: 'USER',
          mongoId: user.mongoId
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ユーザー登録に失敗しました' 
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ 
          success: false,
          error: validation.error.errors 
        });
        return;
      }

      const { email, password } = validation.data;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ 
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません' 
        });
        return;
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          rank: user.rank,
          status: user.status,
          role: 'USER',
          mongoId: user.mongoId
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        error: 'ログインに失敗しました' 
      });
    }
  },

  // getProfileとupdateProfileは変更なし
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ 
          success: false,
          error: '認証が必要です' 
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          level: true,
          experience: true,
          rank: true,
          gems: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(404).json({ 
          success: false,
          error: 'ユーザーが見つかりません' 
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
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ 
          success: false,
          error: '認証が必要です' 
        });
        return;
      }

      const { name } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
        select: {
          id: true,
          email: true,
          name: true,
          level: true,
          experience: true,
          rank: true,
          gems: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false,
        error: 'プロフィールの更新に失敗しました' 
      });
    }
  }
};

export default userController;
