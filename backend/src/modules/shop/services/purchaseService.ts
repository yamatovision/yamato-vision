import { PrismaClient } from '@prisma/client';
import type {
  CreatePurchaseDTO,
  PurchaseResponse,
  PurchaseHistoryResponse
} from '../types';

const prisma = new PrismaClient();

export class PurchaseService {
  static async createPurchase(data: CreatePurchaseDTO): Promise<PurchaseResponse> {
    const purchase = await prisma.purchase.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        amount: data.amount,
        totalPrice: data.amount * data.unitPrice,
        status: 'PENDING'
      },
      include: {
        product: true
      }
    });

    return {
      id: purchase.id,
      status: purchase.status,
      amount: purchase.amount,
      totalPrice: purchase.totalPrice,
      product: {
        name: purchase.product.name,
        description: purchase.product.description
      }
    };
  }

  static async getPurchaseHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PurchaseHistoryResponse> {
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true
        }
      }),
      prisma.purchase.count({
        where: { userId }
      })
    ]);

    return {
      purchases: purchases.map(purchase => ({
        id: purchase.id,
        status: purchase.status,
        amount: purchase.amount,
        totalPrice: purchase.totalPrice,
        createdAt: purchase.createdAt,
        product: {
          name: purchase.product.name,
          description: purchase.product.description
        }
      })),
      total
    };
  }
}
