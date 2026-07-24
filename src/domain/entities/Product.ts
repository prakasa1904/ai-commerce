// Domain Entity: Product
// Business model for Product entity
// Layer: Domain (no imports from other layers)

export interface Product {
  id: number;
  title: string;
  price: number; // in cents for precision
  imageUrl: string;
  sellerName?: string;
  category?: string;
}
