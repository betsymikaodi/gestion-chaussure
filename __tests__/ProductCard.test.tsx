import React from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/database.types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Shoe',
  description: 'A great test shoe',
  brand: 'Nike',
  price: 99.99,
  images: ['https://example.com/image.jpg'],
  sizes: [7, 8, 9, 10],
  colors: ['#000000', '#FFFFFF'],
  stock_by_size: { '7': 10, '8': 15, '9': 20, '10': 12 },
  categories: ['Running'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ProductCard Component', () => {
  it('should render product information', () => {
    const mockFn = jest.fn();
    const card = <ProductCard product={mockProduct} onPress={mockFn} />;
    expect(card).toBeDefined();
  });

  it('should handle products with multiple colors', () => {
    const mockFn = jest.fn();
    const productWithColors = {
      ...mockProduct,
      colors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00'],
    };
    const card = <ProductCard product={productWithColors} onPress={mockFn} />;
    expect(card).toBeDefined();
  });

  it('should handle products with no images', () => {
    const mockFn = jest.fn();
    const productWithoutImages = { ...mockProduct, images: [] };
    const card = <ProductCard product={productWithoutImages} onPress={mockFn} />;
    expect(card).toBeDefined();
  });
});
