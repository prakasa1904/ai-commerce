export const queryKeys = {
  products: () => ['products'] as const,
  productById: (productId: number) => ['products', productId] as const,
  admin: {
    stats: () => ['admin', 'stats'] as const,
    users: (filters: { q?: string; includeDeleted?: boolean } = {}) =>
      ['admin', 'users', filters] as const,
    shops: (filters: { q?: string; includeDeleted?: boolean } = {}) =>
      ['admin', 'shops', filters] as const,
    products: (filters: { q?: string; includeDeleted?: boolean } = {}) =>
      ['admin', 'products', filters] as const,
    members: (shopId: number) => ['admin', 'shops', shopId, 'members'] as const,
    shop: (id: number) => ['admin', 'shops', id] as const,
    shopProducts: (shopId: number) => ['admin', 'shops', 'products', shopId] as const,
    productShops: (productId: number) => ['admin', 'products', productId, 'shops'] as const,
    ownShops: () => ['admin', 'own', 'shops'] as const,
  },
};