export const queryKeys = {
  products: () => ['products'] as const,
  productById: (productId: number) => ['products', productId] as const,
};