import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ルート設定
app.use('/api/users', userRoutes);

// ヘルスチェックエンドポイント
app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});


// サーバー起動
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Prisma Client のシャットダウンを適切に処理
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
