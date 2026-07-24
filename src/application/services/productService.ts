import { Product } from '../../domain/entities/Product.js';

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  search(query: string): Promise<Product[]>;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174';

const productService: ProductService = {
  async getAll(): Promise<Product[]> {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res.json();
  },
  async getById(id: number): Promise<Product | null> {
    const res = await fetch(`${BASE_URL}/api/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  async search(query: string): Promise<Product[]> {
    // Client-side filter for demo
    const all = await this.getAll();
    return all.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
  }
};

export default productService;