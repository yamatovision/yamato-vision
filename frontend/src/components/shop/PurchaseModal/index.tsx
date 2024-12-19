import React from 'react';
import { Product, PurchaseStatus } from '@/types/shop';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  purchaseStatus: PurchaseStatus;
  onConfirm: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  product,
  purchaseStatus,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          購入確認
        </h2>
        
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300">
            {product.name}を購入しますか？
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">
            価格: {product.price} Gems
          </p>
        </div>

        {!purchaseStatus.canPurchase && (
          <div className="mb-4 text-red-500 text-sm">
            {purchaseStatus.reason}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={!purchaseStatus.canPurchase}
            className={`px-4 py-2 rounded text-white ${
              purchaseStatus.canPurchase
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            購入する
          </button>
        </div>
      </div>
    </div>
  );
};
