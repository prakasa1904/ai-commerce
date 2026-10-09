import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { queryKeys } from '../../infrastructure/cache/queryKeys';

export function useAdminShops(token: string | null, filters: { q?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.shops(filters),
    queryFn: () => (token ? adminService.getShops(token, filters) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}

export function useAdminShopMutations(token: string | null) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.shops() });

  const create = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      website?: string;
      phone?: string;
      email?: string;
      address?: string;
      employees?: string;
    }) =>
      token ? adminService.createShop(token, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (data: {
      id: number;
      changes: {
        name?: string;
        description?: string;
        website?: string;
        phone?: string;
        email?: string;
        address?: string;
        employees?: string;
      };
    }) =>
      token ? adminService.updateShop(token, data.id, data.changes) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => (token ? adminService.deleteShop(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: invalidate,
  });

  const restore = useMutation({
    mutationFn: (id: number) => (token ? adminService.restoreShop(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: invalidate,
  });

  return { create, update, remove, restore };
}

export function useShopMembers(token: string | null, shopId: number) {
  return useQuery({
    queryKey: queryKeys.admin.members(shopId),
    queryFn: () => (token ? adminService.getShopMembers(token, shopId) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token) && Boolean(shopId),
  });
}

export function useMemberMutations(token: string | null, shopId: number) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.members(shopId) });

  const add = useMutation({
    mutationFn: (data: { userId: number; role: 'admin' | 'non_admin' }) =>
      token ? adminService.addMember(token, shopId, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (data: { userId: number; role: 'admin' | 'non_admin' }) =>
      token ? adminService.updateMember(token, shopId, data.userId, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (userId: number) => (token ? adminService.removeMember(token, shopId, userId) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: invalidate,
  });

  return { add, update, remove };
}
export function useShopProducts(token: string | null, shopId: number) {
  return useQuery({
    queryKey: ['admin', 'shops', shopId, 'products'],
    queryFn: () => (token ? adminService.getShopProducts(token, shopId) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token) && Boolean(shopId),
  });
}
