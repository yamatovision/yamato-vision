import { PrismaClient, ProductType } from '@prisma/client';
import type { 
  ProductFilters,
  ProductDTO,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListResponse
} from '../types';

const prisma = new PrismaClient();

export class ProductService {
  static async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
    const where = {
      type: filters.type as ProductType,
      price: {
        gte: filters.minPrice,
        lte: filters.maxPrice
      },
      rankRequired: filters.rankRequired,
      isActive: true
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        type: product.type,
        isActive: product.isActive,
        rankRequired: product.rankRequired || undefined,
        levelRequired: product.levelRequired || undefined
      })),
      total
    };
  }

  static async getProductById(id: string): Promise<ProductDTO | null> {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      isActive: product.isActive,
      rankRequired: product.rankRequired || undefined,
      levelRequired: product.levelRequired || undefined
    };
  }

  static async createProduct(input: CreateProductDTO): Promise<ProductDTO> {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        type: input.type as ProductType,
        rankRequired: input.rankRequired || null,
        levelRequired: input.levelRequired || null,
        isActive: true
      }
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      isActive: product.isActive,
      rankRequired: product.rankRequired || undefined,
      levelRequired: product.levelRequired || undefined
    };
  }

  static async updateProduct(id: string, input: UpdateProductDTO): Promise<ProductDTO> {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        type: input.type as ProductType,
        rankRequired: input.rankRequired || null,
        levelRequired: input.levelRequired || null,
        isActive: input.isActive
      }
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      type: product.type,
      isActive: product.isActive,
      rankRequired: product.rankRequired || undefined,
      levelRequired: product.levelRequired || undefined
    };
  }

  static async deleteProduct(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
