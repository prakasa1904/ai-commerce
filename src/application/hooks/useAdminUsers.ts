import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { queryKeys } from '../../infrastructure/cache/queryKeys';
import { useToast } from '../providers/ToastProvider';
import type { AdminUser } from '../../domain/types/admin';

export function useAdminUsers(token: string | null, filters: { q?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => (token ? adminService.getUsers(token, filters) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}

export function useAdminUserMutations(token: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const invalidate = () => qc.invalidateQueries({ queryKey: queryKeys.admin.users() });

  const create = useMutation({
    mutationFn: (data: { username: string; name?: string; email: string; password: string; role?: 'seller' | 'buyer'; isAdmin?: boolean }) =>
      token ? adminService.createUser(token, data) : Promise.reject(new Error('Not authenticated')),
    onSuccess: () => {
      invalidate();
      toast({ title: 'User created.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not create user.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const update = useMutation({
    mutationFn: (data: { id: number; changes: Partial<AdminUser> }) =>
      token ? adminService.updateUser(token, data.id, data.changes) : Promise.reject(new Error('Not authenticated')),
    onSuccess: () => {
      invalidate();
      toast({ title: 'User updated.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not update user.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => (token ? adminService.deleteUser(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: () => {
      invalidate();
      toast({ title: 'User deleted.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not delete user.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  const restore = useMutation({
    mutationFn: (id: number) => (token ? adminService.restoreUser(token, id) : Promise.reject(new Error('Not authenticated'))),
    onSuccess: () => {
      invalidate();
      toast({ title: 'User restored.', variant: 'success' });
    },
    onError: (error) => toast({ title: 'Could not restore user.', description: error instanceof Error ? error.message : undefined, variant: 'destructive' }),
  });

  return { create, update, remove, restore };
}