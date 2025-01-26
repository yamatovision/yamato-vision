// backend/src/notice/noticeService.ts
import { PrismaClient } from '@prisma/client';
import { 
  Notice, 
  CreateNoticeDto, 
  UpdateNoticeDto, 
  NoticeType,
  NOTICE_TYPES
} from './noticeTypes';

export class NoticeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private isValidNoticeType(type: string): type is NoticeType {
    const validTypes = Object.values(NOTICE_TYPES);
    return validTypes.includes(type as NoticeType);
  }

  private mapPrismaNoticeToNotice(prismaNotice: any): Notice {
    if (!prismaNotice) {
      throw new Error('Notice data is undefined');
    }

    if (!this.isValidNoticeType(prismaNotice.type)) {
      throw new Error(`Invalid notice type: ${prismaNotice.type}`);
    }

    return {
      id: prismaNotice.id,
      title: prismaNotice.title,
      content: prismaNotice.content,
      menuContent: prismaNotice.menuContent || undefined,
      startAt: prismaNotice.startAt instanceof Date ? prismaNotice.startAt : new Date(prismaNotice.startAt),
      endAt: prismaNotice.endAt instanceof Date ? prismaNotice.endAt : new Date(prismaNotice.endAt),
      type: prismaNotice.type,
      isActive: prismaNotice.isActive,
      excludedRanks: prismaNotice.excludedRanks,
      minLevel: prismaNotice.minLevel,
      createdAt: prismaNotice.createdAt instanceof Date ? prismaNotice.createdAt : new Date(prismaNotice.createdAt),
      updatedAt: prismaNotice.updatedAt instanceof Date ? prismaNotice.updatedAt : new Date(prismaNotice.updatedAt),
      buttonUrl: prismaNotice.buttonUrl || undefined,
      buttonText: prismaNotice.buttonText || undefined,
    };
  }

  async createNotice(data: CreateNoticeDto): Promise<Notice> {
    try {
      const createData = {
        title: data.title,
        content: data.content,
        menuContent: data.menuContent,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        type: data.type,
        excludedRanks: data.excludedRanks,
        minLevel: data.minLevel,
        buttonUrl: data.buttonUrl,
        buttonText: data.buttonText,
      };

      const prismaNotice = await this.prisma.notice.create({
        data: createData,
      });

      return this.mapPrismaNoticeToNotice(prismaNotice);
    } catch (error) {
      console.error('Error creating notice:', error);
      throw error;
    }
  }

  async getAllNotices(): Promise<Notice[]> {
    try {
      const notices = await this.prisma.notice.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return notices.map(notice => this.mapPrismaNoticeToNotice(notice));
    } catch (error) {
      console.error('Error getting all notices:', error);
      throw error;
    }
  }

  async getActiveNotices(userRank: string, userLevel: number): Promise<Notice[]> {
    const now = new Date();
    try {
      const notices = await this.prisma.notice.findMany({
        where: {
          isActive: true,
          startAt: { lte: now },
          endAt: { gte: now },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return notices
        .filter(notice => {
          if (notice.excludedRanks.includes(userRank)) {
            return false;
          }
          if (notice.minLevel && userLevel < notice.minLevel) {
            return false;
          }
          return true;
        })
        .map(notice => this.mapPrismaNoticeToNotice(notice));
    } catch (error) {
      console.error('Error getting active notices:', error);
      throw error;
    }
  }

  async updateNotice(id: string, data: UpdateNoticeDto): Promise<Notice> {
    try {
      const existingNotice = await this.prisma.notice.findUnique({
        where: { id },
      });

      if (!existingNotice) {
        throw new Error('Notice not found');
      }

      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.menuContent !== undefined) updateData.menuContent = data.menuContent;
      if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
      if (data.endAt !== undefined) updateData.endAt = new Date(data.endAt);
      if (data.type !== undefined) updateData.type = data.type;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.excludedRanks !== undefined) updateData.excludedRanks = data.excludedRanks;
      if (data.minLevel !== undefined) updateData.minLevel = data.minLevel;
      if (data.buttonUrl !== undefined) updateData.buttonUrl = data.buttonUrl;
      if (data.buttonText !== undefined) updateData.buttonText = data.buttonText;

      const prismaNotice = await this.prisma.notice.update({
        where: { id },
        data: updateData,
      });

      return this.mapPrismaNoticeToNotice(prismaNotice);
    } catch (error) {
      console.error('Error updating notice:', error);
      throw error;
    }
  }

  async getNotice(id: string): Promise<Notice | null> {
    try {
      const notice = await this.prisma.notice.findUnique({
        where: { id }
      });

      if (!notice) {
        return null;
      }

      return this.mapPrismaNoticeToNotice(notice);
    } catch (error) {
      console.error('Error getting notice:', error);
      throw error;
    }
  }

  async deleteNotice(id: string): Promise<void> {
    try {
      await this.prisma.notice.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting notice:', error);
      throw error;
    }
  }
}