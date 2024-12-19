import { PrismaClient, Purchase, PurchaseStatus } from '@prisma/client';
import { CreatePurchaseDTO } from '../types';

export class PurchaseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreatePurchaseDTO): Promise<Purchase> {
    return this.prisma.purchase.create({
      data: {
        ...data,
        status: 'PENDING' as PurchaseStatus,
      },
    });
  }

  async findUserPurchases(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ purchases: Purchase[]; total: number }> {
    const where = { userId };

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return { purchases, total };
  }

  async updateStatus(
    id: string,
    status: PurchaseStatus
  ): Promise<Purchase> {
    return this.prisma.purchase.update({
      where: { id },
      data: { status },
    });
  }
}
