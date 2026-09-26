import type { Product } from '../../domain/types/product';
import { productApi } from '../../infrastructure/api/productApi';

export const productService = {
  async getProducts(): Promise<Product[]> {
    return productApi.fetchProducts();
  },
};