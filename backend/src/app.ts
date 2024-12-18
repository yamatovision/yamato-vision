import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { requestLogger, errorLogger } from './config/logger';
import userRoutes from './routes/userRoutes';
import missionRoutes from './modules/missions/routes/missionRoutes';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ルーティング
app.use('/api/users', userRoutes);
app.use('/api', missionRoutes);

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

// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Prisma Client のシャットダウンを適切に処理
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default app;
