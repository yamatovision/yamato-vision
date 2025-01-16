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

  // isValidNoticeTypeをクラスメソッドとして正しく定義
  private isValidNoticeType(type: string): type is NoticeType {
    // NOTICEの型チェック
    const validTypes = Object.values(NOTICE_TYPES);
    // デバッグ用のログ追加
    console.log('Checking notice type:', {
      type,
      validTypes,
      isValid: validTypes.includes(type as NoticeType)
    });
    return validTypes.includes(type as NoticeType);
  }

  private mapPrismaNoticeToNotice(prismaNotice: any): Notice {
    // デバッグ用のログ追加
    console.log('Mapping prisma notice:', prismaNotice);

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
      startAt: prismaNotice.startAt.toISOString(),
      endAt: prismaNotice.endAt.toISOString(),
      type: prismaNotice.type,
      isActive: prismaNotice.isActive,
      excludedRanks: prismaNotice.excludedRanks,
      minLevel: prismaNotice.minLevel,
      createdAt: prismaNotice.createdAt.toISOString(),
      updatedAt: prismaNotice.updatedAt.toISOString()
    };
  }

  async createNotice(data: CreateNoticeDto): Promise<Notice> {
    try {
      const prismaNotice = await this.prisma.notice.create({
        data: {
          ...data,
          startAt: new Date(data.startAt),
          endAt: new Date(data.endAt),
          excludedRanks: data.excludedRanks,
        },
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
      // デバッグ用のログ追加
      console.log('Retrieved notices from database:', notices);
      return notices.map(notice => this.mapPrismaNoticeToNotice(notice));
    } catch (error) {
      console.error('Error getting all notices:', error);
      throw error;
    }
  }

  async getActiveNotices(userRank: string, userLevel: number): Promise<Notice[]> {
    const now = new Date();
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
      .map(this.mapPrismaNoticeToNotice.bind(this));  // bindを追加
  }

  async updateNotice(id: string, data: UpdateNoticeDto): Promise<Notice> {
    const existingNotice = await this.prisma.notice.findUnique({
      where: { id },
    });

    if (!existingNotice) {
      throw new Error('Notice not found');
    }

    const prismaNotice = await this.prisma.notice.update({
      where: { id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
      },
    });

    return this.mapPrismaNoticeToNotice(prismaNotice);
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
    await this.prisma.notice.delete({
      where: { id },
    });
  }
}
