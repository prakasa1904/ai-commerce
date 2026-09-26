import type { ProductCategory } from '../../domain/types/product';

export const categoryLabels: Record<ProductCategory, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  dairy: 'Dairy',
  livestock: 'Livestock',
  organic: 'Certified Organic',
  supplies: 'Farm Supplies',
};

export const FALLBACK_IMAGE_URL =
  'https://dummyimage.com/800x600/1E3B2C/FBF8F1&text=Farm+Fresh';

export const formatPrice = (amount: number): string =>
  `Rp${amount.toLocaleString('id-ID')}`;

export const unitOf = (description: string): string => {
  const match = description.match(/((\d+\s*(kg|g|L|pcs|tray)))\s*$/i);
  return match ? match[1] : 'unit';
};

export const productRating = (productId: number): { score: number; reviews: number } => ({
  score: Math.round((4.2 + ((productId * 37) % 60) / 100) * 20) / 20,
  reviews: 40 + ((productId * 71) % 280),
});