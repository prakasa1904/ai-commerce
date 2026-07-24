// Domain Layer - TypeScript type definitions
export interface Product {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  sellerName?: string;
  category?: string;
}
export interface CartItem {
  product: Product;
  quantity: number;
}