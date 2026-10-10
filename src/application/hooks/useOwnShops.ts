import { useAdminShops } from './useAdminShops';

export function useOwnShops(token: string | null) {
  return useAdminShops(token);
}