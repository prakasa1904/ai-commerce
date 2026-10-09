import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { queryKeys } from '../../infrastructure/cache/queryKeys';

export function useOwnShops(token: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.ownShops(),
    queryFn: () => (token ? adminService.getShops(token) : Promise.reject(new Error('Not authenticated'))),
    enabled: Boolean(token),
  });
}