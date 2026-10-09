import { createFileRoute } from '@tanstack/react-router';
import ProductsPage from '../../modules/admin/ProductsPage';
import { AdminPage, requireAuth } from '../../modules/admin/AdminPage';

export const Route = createFileRoute('/admin/products')({
  beforeLoad: () => requireAuth(),
  component: () => <AdminPage><ProductsPage /></AdminPage>,
});