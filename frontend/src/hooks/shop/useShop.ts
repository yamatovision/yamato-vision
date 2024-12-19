import { useState } from 'react';
import { Product, PurchaseStatus } from '@/types/shop';

export const useShop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shop/products');
      if (!response.ok) throw new Error('商品の取得に失敗しました');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const checkPurchaseStatus = async (productId: string): Promise<PurchaseStatus> => {
    try {
      const response = await fetch(`/api/shop/products/${productId}/status`);
      if (!response.ok) throw new Error('ステータスの確認に失敗しました');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return { canPurchase: false, reason: 'ステータスの確認に失敗しました' };
    }
  };

  const purchaseProduct = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) throw new Error('購入に失敗しました');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchProducts,
    checkPurchaseStatus,
    purchaseProduct,
  };
};
