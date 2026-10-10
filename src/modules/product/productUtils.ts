import type { ProductCategory } from '../../domain/types/product';

export { formatPrice, unitOf } from '../../infrastructure/format/price';

export const categoryLabels: Record<ProductCategory, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
  dairy: 'Dairy',
  livestock: 'Livestock',
  organic: 'Certified Organic',
  supplies: 'Farm Supplies',
};

export const categoryCopy: Record<ProductCategory, string> = {
  vegetables: 'Picked before the dew lifts — tomatoes, peppers, greens.',
  fruits: 'Ripened on the branch, gathered by hand, still warm from the sun.',
  grains: 'Harvested, threshed and bagged this morning — oats, rice and corn.',
  dairy: 'Churned and bottled the old way, straight from the barn door.',
  livestock: 'Raised on open pasture and tended by the hands that feed them.',
  organic: 'No chemicals, no shortcuts — certified from seed to stall.',
  supplies: 'Everything you need to keep the field turning, season after season.',
};

export const FALLBACK_IMAGE_URL =
  'https://dummyimage.com/800x600/1E3B2C/FBF8F1&text=Farm+Fresh';

export const productRating = (productId: number): { score: number; reviews: number } => ({
  score: Math.round((4.2 + ((productId * 37) % 60) / 100) * 20) / 20,
  reviews: 40 + ((productId * 71) % 280),
});