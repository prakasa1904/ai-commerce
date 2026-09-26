import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../infrastructure/cache/queryKeys';
import { productService } from '../services/productService';

export const useProducts = () =>
  useQuery({
    queryKey: queryKeys.products(),
    queryFn: () => productService.getProducts(),
    staleTime: 5 * 60 * 1000,
  });