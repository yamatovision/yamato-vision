// shop/types/index.ts

import { Product, ProductType, Purchase, PurchaseStatus } from '@prisma/client';

// 商品関連の型定義
export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  gemAmount?: number;
  courseId?: string;
  rankRequired?: string;
  levelRequired?: number;
  isActive: boolean;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  type: ProductType;
  price: number;
  gemAmount?: number;
  courseId?: string;
  rankRequired?: string;
  levelRequired?: number;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  isActive?: boolean;
}

// 購入関連の型定義
export interface PurchaseDTO {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  totalPrice: number;
  status: PurchaseStatus;
  createdAt: Date;
}

export interface CreatePurchaseDTO {
  userId: string;
  productId: string;
  amount: number;
}

// APIリクエスト/レスポンスの型定義
export interface ProductListResponse {
  products: ProductDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductFilters {
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  rankRequired?: string;
  levelRequired?: number;
  isActive?: boolean;
}

// 購入処理のレスポンス
export interface PurchaseResponse {
  purchase: PurchaseDTO;
  updatedGems?: number;  // ジェム購入時の更新後の残高
  unlockedCourse?: {     // コース購入時のアンロック情報
    courseId: string;
    courseName: string;
  };
}

// エラー型定義
export interface ShopError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// 購入バリデーション用の型
export interface PurchaseValidation {
  canPurchase: boolean;
  reason?: string;
  requiredGems?: number;
  userGems?: number;
  missingRequirements?: {
    rank?: string;
    level?: number;
  };
}

// ユーザーの購入履歴レスポンス
export interface PurchaseHistoryResponse {
  purchases: PurchaseDTO[];
  total: number;
  page: number;
  limit: number;
}