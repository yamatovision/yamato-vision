import React from 'react';
import { Product } from '@/types/shop';

interface ProductCardProps {
  product: Product;
  onPurchase: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPurchase }) => {
  const handlePurchaseClick = () => {
    onPurchase(product.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {product.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mt-2">
        {product.description}
      </p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          {product.type === 'GEM_PACKAGE' 
            ? `${product.gemAmount} Gems` 
            : `${product.price} Gems`}
        </span>
        <button
          onClick={handlePurchaseClick}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          購入
        </button>
      </div>
      {(product.rankRequired || product.levelRequired) && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {product.rankRequired && <p>必要階級: {product.rankRequired}</p>}
          {product.levelRequired && <p>必要レベル: {product.levelRequired}</p>}
        </div>
      )}
    </div>
  );
};
