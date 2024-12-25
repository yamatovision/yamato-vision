import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/authRoutes';
import userRoutes from './users/userRoutes';
import badgeRoutes from './badges/badgeRoutes';
import levelMessageRoutes from './levelMessages/levelMessageRoutes';
import { courseRoutes } from './courses/courseRoutes';  // 追加
import { PrismaClient } from '@prisma/client';

dotenv.config();
export const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ルート
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/level-messages', levelMessageRoutes);
app.use('/api/admin/courses', courseRoutes);
app.use('/api/courses', courseRoutes);             // 一般ユーザー用



// ヘルスチェック
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
