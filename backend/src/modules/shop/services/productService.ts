import { 
  ProductFilters, 
  ProductDTO, 
  CreateProductDTO, 
  UpdateProductDTO, 
  ProductListResponse 
} from '../types';
import { db } from '../../../lib/db';

export class ProductService {
  async getProducts(
    filters: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductListResponse> {
    const where = {
      type: filters.type,
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      },
      rankRequired: filters.rankRequired,
      levelRequired: filters.levelRequired,
      isActive: filters.isActive ?? true,
    };

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.product.count({ where }),
    ]);

    return {
      products: products as ProductDTO[],
      total,
      page,
      limit
    };
  }

  async getProductById(id: string): Promise<ProductDTO | null> {
    const product = await db.product.findUnique({
      where: { id },
    });

    return product as ProductDTO | null;
  }

  async createProduct(data: CreateProductDTO): Promise<ProductDTO> {
    const product = await db.product.create({
      data: {
        ...data,
        isActive: true,
      },
    });

    return product as ProductDTO;
  }

  async updateProduct(
    id: string,
    data: UpdateProductDTO
  ): Promise<ProductDTO> {
    const product = await db.product.update({
      where: { id },
      data,
    });

    return product as ProductDTO;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async validatePurchaseRequirements(
    productId: string,
    userId: string
  ): Promise<{ canPurchase: boolean; reason?: string }> {
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return { 
        canPurchase: false, 
        reason: '商品が存在しないか、現在利用できません' 
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { 
        canPurchase: false, 
        reason: 'ユーザーが見つかりません' 
      };
    }

    if (product.rankRequired && user.rank !== product.rankRequired) {
      return { 
        canPurchase: false, 
        reason: '必要な階級に達していません' 
      };
    }

    if (product.levelRequired && user.level < product.levelRequired) {
      return { 
        canPurchase: false, 
        reason: '必要なレベルに達していません' 
      };
    }

    if (user.gems < product.price) {
      return { 
        canPurchase: false, 
        reason: 'ジェムが不足しています' 
      };
    }

    return { canPurchase: true };
  }
}
