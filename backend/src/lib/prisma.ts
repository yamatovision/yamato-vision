// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// アプリケーション終了時にPrisma Clientを切断するための関数
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// 新しいPrismaClientインスタンスを作成する関数
export function createNewPrismaClient() {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
}