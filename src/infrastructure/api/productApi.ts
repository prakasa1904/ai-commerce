import type { Product, ProductApiResponse } from '../../domain/types/product';

export const productApi = {
  async fetchProducts(): Promise<Product[]> {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = (await response.json()) as ProductApiResponse;
    return data.products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      category: (p.category ?? 'organic') as Product['category'],
      wholesale: Boolean(p.wholesale),
    }));
  },
};