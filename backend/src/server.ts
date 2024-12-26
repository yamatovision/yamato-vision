import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/authRoutes';
import userRoutes from './users/userRoutes';
import badgeRoutes from './badges/badgeRoutes';
import levelMessageRoutes from './levelMessages/levelMessageRoutes';
import { courseRoutes } from './courses/courseRoutes';
import { userCourseRoutes } from './courses/user/userCourseRoutes';
import { PrismaClient } from '@prisma/client';

dotenv.config();
export const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// セキュリティヘッダー
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/level-messages', levelMessageRoutes);

// コース関連のルート
// 管理者用ルート
app.use('/api/admin/courses', courseRoutes);
// ユーザー用ルート
app.use('/api/courses/user', userCourseRoutes);  // ユーザー固有のコース操作
app.use('/api/courses', courseRoutes);           // 一般的なコース操作

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// エラーハンドリング
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404ハンドリング
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;