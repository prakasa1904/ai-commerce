import { createFileRoute } from '@tanstack/react-router';
import type { ProductCategory } from '../domain/types/product';
import { ALL_CATEGORIES } from '../domain/types/product';
import NotFoundPage from '../presentation/components/atoms/NotFoundPage';
import CategoryDetailPage from './cat/-CategoryDetailPage';

const isCategory = (value: string): value is ProductCategory =>
  (ALL_CATEGORIES as ReadonlyArray<string>).includes(value);

const CategoryDetailRoute = () => {
  const { categoryId } = Route.useParams();

  if (!isCategory(categoryId)) return <NotFoundPage />;

  return <CategoryDetailPage categoryId={categoryId} />;
};

export const Route = createFileRoute('/cat/$categoryId')({
  component: CategoryDetailRoute,
});