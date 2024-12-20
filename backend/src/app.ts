import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/database';
import adminRoutes from './modules/admin/routes/adminRoutes';
import adminUserRoutes from './modules/admin/routes/adminUserRoutes'; // 追加
import { createLogger } from './config/logger';

const logger = createLogger('App');
const app = express();

// ミドルウェアの設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// ルートの設定
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminUserRoutes); // 追加

// エラーハンドリングミドルウェア
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// MongoDB接続
connectMongoDB()
  .then(() => logger.info('MongoDB connected successfully'))
  .catch(err => logger.error('MongoDB connection error:', err));

export default app;
