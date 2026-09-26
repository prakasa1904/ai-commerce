import { createFileRoute } from '@tanstack/react-router';
import CategoryListPage from './-CategoryListPage';

export const Route = createFileRoute('/cat/')({
  component: CategoryListPage,
});