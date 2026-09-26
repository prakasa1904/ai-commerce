import { createFileRoute } from '@tanstack/react-router';
import CategoryPage from './category/-CategoryPage';

export const Route = createFileRoute('/category')({
  component: CategoryPage,
});