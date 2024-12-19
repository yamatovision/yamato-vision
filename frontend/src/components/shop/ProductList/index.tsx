import React from 'react';
import { Product } from '@/types/shop';
import { ProductCard } from '../ProductCard';

interface ProductListProps {
  products: Product[];
  onPurchase: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onPurchase }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
};
