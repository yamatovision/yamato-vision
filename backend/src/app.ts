import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { requestLogger, errorLogger } from './config/logger';
import { connectMongoDB } from './config/database';
import userRoutes from './routes/userRoutes';
import missionRoutes from './modules/missions/routes/missionRoutes';
import shopRoutes from './modules/shop/routes/shopRoutes';
import adminRoutes from './modules/admin/routes/adminRoutes';
import profileRoutes from './modules/users/routes/profileRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// データベース接続
connectMongoDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORSの詳細設定
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // プリフライトリクエストのキャッシュ時間（秒）
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// OPTIONSリクエストの明示的なハンドリング
app.options('*', cors(corsOptions));

// ルーティング
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', missionRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', profileRoutes);

// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// エラーロギング
app.use(errorLogger);

// エラーハンドリング
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : '内部サーバーエラーが発生しました'
  });
});

// Prismaクライアントのグローバルインスタンス
export const db = prisma;

// サーバー起動
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Prisma Client のシャットダウンを適切に処理
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// GracefulShutdownの処理
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
