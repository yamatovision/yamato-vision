export type ProductType = 'COURSE' | 'GEM_PACKAGE' | 'SPECIAL_ITEM';

export interface Product {
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

export interface PurchaseStatus {
  canPurchase: boolean;
  reason?: string;
  requiredGems?: number;
  userGems?: number;
  missingRequirements?: {
    rank?: string;
    level?: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PurchaseHistoryItem {
  id: string;
  productName: string;
  purchaseDate: Date;
  amount: number;
  totalPrice: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}
