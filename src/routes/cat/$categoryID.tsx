import { createFileRoute } from '@tanstack/react-router';
import type { ProductCategory } from '../../domain/types/product';
import { ALL_CATEGORIES } from '../../domain/types/product';
import NotFoundPage from '../../presentation/components/atoms/NotFoundPage';
import CategoryDetailPage from '../../modules/category/CategoryDetailPage';

const isCategory = (value: string): value is ProductCategory =>
  (ALL_CATEGORIES as ReadonlyArray<string>).includes(value);

const CategoryDetailRoute = () => {
  const { categoryID } = Route.useParams();

  if (!isCategory(categoryID)) return <NotFoundPage />;

  return <CategoryDetailPage categoryId={categoryID} />;
};

export const Route = createFileRoute('/cat/$categoryID')({
  component: CategoryDetailRoute,
});