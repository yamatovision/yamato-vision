import { PrismaClient, Product, ProductType } from '@prisma/client';
import { ProductFilters, CreateProductDTO, UpdateProductDTO } from '../types';

export class ProductRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findMany(
    filters: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
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
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
