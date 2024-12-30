import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MediaProgressService {
  async saveProgress(userId: string, chapterId: string, position: number, deviceId?: string) {
    return await prisma.userChapterMediaProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        position,
        deviceId,
        updatedAt: new Date(),
      },
      create: {
        userId,
        chapterId,
        position,
        deviceId,
      },
    });
  }

  async getProgress(userId: string, chapterId: string) {
    const progress = await prisma.userChapterMediaProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });
    return progress?.position || 0;
  }

  async resetProgress(userId: string, chapterId: string) {
    return await prisma.userChapterMediaProgress.delete({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    }).catch(() => null); // 存在しない場合はエラーを無視
  }
}

export const mediaProgressService = new MediaProgressService();
