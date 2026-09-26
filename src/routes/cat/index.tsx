import { createFileRoute } from '@tanstack/react-router';
import CategoryListPage from '../../modules/category/CategoryListPage';

export const Route = createFileRoute('/cat/')({
  component: CategoryListPage,
});