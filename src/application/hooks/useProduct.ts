import { useProducts } from './useProducts';

export const useProduct = (productId: number) => {
  const { data, ...rest } = useProducts();

  return {
    product: data?.find((p) => p.id === productId),
    ...rest,
  };
};