import { createFileRoute } from '@tanstack/react-router';
import type { Product, ProductCategory } from '../domain/types/product';
import { useProducts } from '../application/hooks/useProducts';
import { ALL_CATEGORIES } from '../domain/types/product';
import NotFoundPage from '../presentation/components/atoms/NotFoundPage';
import ProductDetailPage from './det/-ProductDetailPage';

const isCategory = (value: string): value is ProductCategory =>
  (ALL_CATEGORIES as ReadonlyArray<string>).includes(value);

const DetRoute = () => {
  const { categoryId, productId } = Route.useParams();
  const { data: products } = useProducts();

  if (!isCategory(categoryId)) {
    return <NotFoundPage />;
  }

  const product = products?.find((p: Product) => p.id === Number(productId) && p.category === categoryId);

  if (!product) {
    return <NotFoundPage />;
  }

  return <ProductDetailPage product={product} />;
};

export const Route = createFileRoute('/det/$categoryId/$productId')({
  component: DetRoute,
});