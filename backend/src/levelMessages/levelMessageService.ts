// backend/src/levelMessages/levelMessageService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LevelMessageService {
  async create(data: { level: number; message: string }) {
    return await prisma.levelMessage.create({
      data: {
        level: data.level,
        message: data.message,
        isActive: true
      }
    });
  }

  async getAll() {
    return await prisma.levelMessage.findMany({
      orderBy: { level: 'asc' },
      select: {
        id: true,
        level: true,
        message: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async update(id: string, data: { message?: string; isActive?: boolean }) {
    return await prisma.levelMessage.update({
      where: { id },
      data
    });
  }

  async getMessageForLevel(level: number) {
    return await prisma.levelMessage.findFirst({
      where: {
        level,
        isActive: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.levelMessage.delete({
      where: { id }
    });
  }
// backend/src/levelMessages/levelMessageService.ts

  async processLevelUp(userId: string, newExp: number): Promise<{
    newLevel: number;
    message: string | null;
  }> {
    const newLevel = Math.floor(newExp / 1000) + 1;
    
    const levelMessage = await this.getMessageForLevel(newLevel);
    
    return {
      newLevel,
      message: levelMessage?.message || null
    };
  }
}