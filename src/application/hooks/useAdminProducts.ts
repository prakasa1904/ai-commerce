import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { queryKeys } from '../../infrastructure/cache/queryKeys';
import { useToast } from '../providers/ToastProvider';
import type { ProductCategory } from '../../domain/types/product';

export function useAdminProducts(token: string | null, filters: { q?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.products(filters),
    queryFn: () => (token ? adminService.getProducts(token, filters) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}

export function useAdminProductMutations(token: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.products() });

  const create = useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      price: number;
      imageUrl?: string;
      category?: ProductCategory;
      unit?: string;
      stock?: number;
      wholesale?: boolean;
    }) =>
      token ? adminService.createProduct(token, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Product created.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not create product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: (data: {
      id: number;
      changes: {
        title?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        category?: ProductCategory;
        unit?: string;
        stock?: number;
        wholesale?: boolean;
      };
    }) =>
      token ? adminService.updateProduct(token, data.id, data.changes) : Promise.reject(new Error('Not authenticated')),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Product updated.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not update product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => (token ? adminService.deleteProduct(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Product deleted.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not delete product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const restore = useMutation({
    mutationFn: (id: number) => (token ? adminService.restoreProduct(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Product restored.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not restore product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
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
  const { toast } = useToast();
  const invalidate = (productId: number) => {
    qc.invalidateQueries({ queryKey: queryKeys.admin.productShops(productId) });
    qc.invalidateQueries({ queryKey: ['admin', 'shops', 'products'] });
  };

  const link = useMutation({
    mutationFn: (data: { productId: number; shopId: number; price?: number; stock?: number }) =>
      token ? adminService.linkProductToShop(token, data.productId, data.shopId, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: (_d, vars) => {
      invalidate(vars.productId);
      toast({ title: 'Product linked to shop.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not link product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const unlink = useMutation({
    mutationFn: (data: { productId: number; shopId: number }) =>
      token ? adminService.unlinkProductFromShop(token, data.productId, data.shopId) : Promise.reject(new Error('Not authenticated')),
    onSuccess: (_d, vars) => {
      invalidate(vars.productId);
      toast({ title: 'Product unlinked from shop.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not unlink product.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
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