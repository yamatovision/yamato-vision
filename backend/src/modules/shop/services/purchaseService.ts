import { PrismaClient } from '@prisma/client';
import { ProductService } from './productService';
import { 
  PurchaseResponse, 
  PurchaseHistoryResponse 
} from '../types';
import { db } from '../../../lib/db';

export class PurchaseService {
  private productService: ProductService;
  private prisma: PrismaClient;

  constructor() {
    this.productService = new ProductService();
    this.prisma = db;
  }

  async createPurchase(
    userId: string,
    productId: string,
    amount: number = 1
  ): Promise<PurchaseResponse> {
    const validation = await this.productService.validatePurchaseRequirements(
      productId,
      userId
    );

    if (!validation.canPurchase) {
      throw new Error(validation.reason);
    }

    // トランザクションで購入処理を実行
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('商品が見つかりません');
      }

      const purchase = await tx.purchase.create({
        data: {
          userId,
          productId,
          amount,
          totalPrice: product.price * amount,
          status: 'COMPLETED'
        }
      });

      // ジェムの更新処理
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          gems: { decrement: product.price * amount }
        }
      });

      return { purchase, updatedUser };
    });

    return {
      purchase: {
        id: result.purchase.id,
        userId: result.purchase.userId,
        productId: result.purchase.productId,
        amount: result.purchase.amount,
        totalPrice: result.purchase.totalPrice,
        status: result.purchase.status,
        createdAt: result.purchase.createdAt
      },
      updatedGems: result.updatedUser.gems
    };
  }

  async getPurchaseHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PurchaseHistoryResponse> {
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true
        }
      }),
      this.prisma.purchase.count({
        where: { userId }
      })
    ]);

    return {
      purchases: purchases.map(purchase => ({
        id: purchase.id,
        userId: purchase.userId,
        productId: purchase.productId,
        amount: purchase.amount,
        totalPrice: purchase.totalPrice,
        status: purchase.status,
        createdAt: purchase.createdAt
      })),
      total,
      page,
      limit
    };
  }
}
