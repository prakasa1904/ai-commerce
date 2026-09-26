export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'dairy'
  | 'livestock'
  | 'organic'
  | 'supplies';

export const ALL_CATEGORIES: readonly ProductCategory[] = [
  'vegetables',
  'fruits',
  'grains',
  'dairy',
  'livestock',
  'organic',
  'supplies',
];

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: ProductCategory;
  wholesale: boolean;
};

export type ProductApiResponse = {
  count: number;
  products: Product[];
};