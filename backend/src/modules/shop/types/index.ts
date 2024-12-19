import { PurchaseStatus } from '@prisma/client';

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  rankRequired?: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  isActive: boolean;
  rankRequired?: string;
  levelRequired?: number;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  type: string;
  rankRequired?: string;
  levelRequired?: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  type?: string;
  isActive?: boolean;
  rankRequired?: string;
  levelRequired?: number;
}

export interface ProductListResponse {
  products: ProductDTO[];
  total: number;
}

export interface CreatePurchaseDTO {
  userId: string;
  productId: string;
  amount: number;
  unitPrice: number;
}

export interface PurchaseResponse {
  id: string;
  status: PurchaseStatus;
  amount: number;
  totalPrice: number;
  product: {
    name: string;
    description: string;
  };
}

export interface PurchaseHistoryResponse {
  purchases: Array<{
    id: string;
    status: PurchaseStatus;
    amount: number;
    totalPrice: number;
    createdAt: Date;
    product: {
      name: string;
      description: string;
    };
  }>;
  total: number;
}
