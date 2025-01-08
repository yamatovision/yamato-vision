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
import { TokenSyncService } from './sync/token/tokenSyncService';
import { UserSyncService } from './sync/user/userSyncService';
import experienceRoutes from './experience/experienceRoutes';     
import notificationRoutes from './notification/notificationRoutes'; 
import { mediaRoutes } from './courses/media/mediaRoutes';
import { submissionRoutes } from './courses/submissions/submissionRoutes';

dotenv.config();
export const prisma = new PrismaClient();

const tokenSyncService = new TokenSyncService();
const userSyncService = new UserSyncService();const app = express();
const port = process.env.PORT || 3001;

// 同期サービスの初期化
const initializeSyncServices = async () => {
  try {
    console.log('Initializing sync services...');
    await Promise.all([
      tokenSyncService.initialize(),
      userSyncService.initialize()
    ]);
    console.log('Sync services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize sync services:', error);
  }
};

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

// CORS設定
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // PATCHを追加
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
app.use('/api/admin/courses', courseRoutes);
app.use('/api/courses/user', userCourseRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/experience', experienceRoutes);       // 追加
app.use('/api/notifications', notificationRoutes);  // 追加
app.use('/api/media', mediaRoutes);
app.use('/api', submissionRoutes);




// デバッグ用エンドポイント
app.get('/api/debug/status', async (_req, res) => {
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1 as test`;
    
    // 同期サービスのステータスを取得
  
    const tokenSyncStatus = await tokenSyncService.getConnectionStatus();
    const userSyncStatus = await userSyncService.getConnectionStatus();
    
    res.json({
      status: 'ok',
      database: 'connected',
      sync_services: {
        token: {
          status: tokenSyncStatus.isConnected ? 'connected' : 'disconnected',
          last_sync: tokenSyncStatus.lastSync,
          mongodb_status: tokenSyncStatus.mongodb ? 'connected' : 'disconnected'
        },
        user: {
          status: userSyncStatus.isConnected ? 'connected' : 'disconnected',
          last_sync: userSyncStatus.lastSync,
          mongodb_status: userSyncStatus.mongodb ? 'connected' : 'disconnected'
        }
      },
      server_time: new Date().toISOString(),
      env: {
        node_env: process.env.NODE_ENV,
        frontend_url: process.env.FRONTEND_URL,
        database_url: process.env.DATABASE_URL ? 'set' : 'not set',
        mongodb_uri: process.env.MONGODB_URI ? 'set' : 'not set'
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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

app.get('/health', async (_req, res) => {
  const tokenStatus = await tokenSyncService.getConnectionStatus();
  const userStatus = await userSyncService.getConnectionStatus();
  res.json({ 
    status: 'ok',
    sync_status: {
      token: tokenStatus.isConnected ? 'ok' : 'error',
      user: userStatus.isConnected ? 'ok' : 'error'
    },
    timestamp: new Date().toISOString()
  });
});

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
  await Promise.all([
    tokenSyncService.cleanup(),
    userSyncService.cleanup()
  ]);
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await Promise.all([
    tokenSyncService.cleanup(),
    userSyncService.cleanup()
  ]);
  await prisma.$disconnect();
  process.exit(0);
});

// サーバー起動
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('Database URL is', process.env.DATABASE_URL ? 'configured' : 'not configured');
  console.log('MongoDB URI is', process.env.MONGODB_URI ? 'configured' : 'not configured');
  
  // 同期サービスの初期化
  await initializeSyncServices();  // 新しい関数名に変更

  
  // Cronジョブの初期化
  initializeCronJobs();
  console.log('All services initialized');
});

export default app;
