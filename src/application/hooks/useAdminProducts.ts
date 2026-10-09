import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { queryKeys } from '../../infrastructure/cache/queryKeys';

export function useAdminProducts(token: string | null, filters: { q?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.products(filters),
    queryFn: () => (token ? adminService.getProducts(token, filters) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}

export function useAdminProductMutations(token: string | null) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.products() });

  const create = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      price: number;
      imageUrl?: string;
      category?: string;
      unit?: string;
      stock?: number;
      wholesale?: boolean;
    }) =>
      token ? adminService.createProduct(token, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (data: {
      id: number;
      changes: {
        title?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        category?: string;
        unit?: string;
        stock?: number;
        wholesale?: boolean;
      };
    }) =>
      token ? adminService.updateProduct(token, data.id, data.changes) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => (token ? adminService.deleteProduct(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: number) => (token ? adminService.restoreProduct(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: invalidate,
  });

  return { create, update, remove, restore };
}

export function useProductShops(token: string | null, productId: number) {
  return useQuery({
    queryKey: queryKeys.admin.productShops(productId),
    queryFn: () => (token ? adminService.getProductShops(token, productId) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token) && Boolean(productId),
  });
}

export function useProductShopMutations(token: string | null) {
  const qc = useQueryClient();
  const invalidate = (productId: number) => {
    qc.invalidateQueries({ queryKey: queryKeys.admin.productShops(productId) });
    qc.invalidateQueries({ queryKey: ['admin', 'shops', 'products'] });
  };

  const link = useMutation({
    mutationFn: (data: { productId: number; shopId: number; price?: number; stock?: number }) =>
      token ? adminService.linkProductToShop(token, data.productId, data.shopId, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: (_d, vars) => invalidate(vars.productId),
  });

  const unlink = useMutation({
    mutationFn: (data: { productId: number; shopId: number }) =>
      token ? adminService.unlinkProductFromShop(token, data.productId, data.shopId) : Promise.reject(new Error('Not authenticated')),
    onSuccess: (_d, vars) => invalidate(vars.productId),
  });

  return { link, unlink };
}

export function useAdminStats(token: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => (token ? adminService.getStats(token) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}