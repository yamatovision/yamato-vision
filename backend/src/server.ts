import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { CronJob } from 'cron';
import authRoutes from './auth/authRoutes';
import userRoutes from './users/userRoutes';
import badgeRoutes from './badges/badgeRoutes';
import levelMessageRoutes from './levelMessages/levelMessageRoutes';
import { courseRoutes } from './courses/courseRoutes';
import { userCourseRoutes } from './courses/user/userCourseRoutes';
import { PrismaClient } from '@prisma/client';
import { timeoutChecker } from './utils/timeoutChecker';

dotenv.config();
export const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

// cronジョブの初期化
const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  new CronJob('0 0 * * *', async () => {
    try {
      console.log('Running daily timeout check...');
      await timeoutChecker.checkAllCourseTimeouts();
      console.log('Daily timeout check completed');
    } catch (error) {
      console.error('Failed to run timeout check cron job:', error);
    }
  }).start();
};

// cronジョブの開始
initializeCronJobs();

// CORS設定
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ミドルウェア
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API ルート
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/level-messages', levelMessageRoutes);

// コース関連のルート
app.use('/api/admin/courses', courseRoutes);    // 管理者用ルート
app.use('/api/courses/user', userCourseRoutes); // ユーザー固有のコース操作
app.use('/api/courses', courseRoutes);          // 一般的なコース操作

// デバッグ用エンドポイント
app.get('/api/debug/status', async (_req, res) => {
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1 as test`;
    
    res.json({
      status: 'ok',
      database: 'connected',
      server_time: new Date().toISOString(),
      env: {
        node_env: process.env.NODE_ENV,
        frontend_url: process.env.FRONTEND_URL,
        database_url: process.env.DATABASE_URL ? 'set' : 'not set'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// データベース接続テスト用エンドポイント
app.get('/api/debug/database', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version
    `;
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// サーバー時間エンドポイント
app.get('/api/server-time', (_req, res) => {
  res.json({ 
    serverTime: new Date().toISOString(),
    timestamp: new Date().toISOString()
  });
});

// エラーハンドリング
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404ハンドリング
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Database URL is', process.env.DATABASE_URL ? 'configured' : 'not configured');
  console.log('Cron jobs initialized');
});

export default app;