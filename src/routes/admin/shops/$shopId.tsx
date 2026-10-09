import { createFileRoute } from '@tanstack/react-router';
import ShopDetailPage from '../../../modules/admin/ShopDetailPage';
import { AdminPage, requireAuth } from '../../../modules/admin/AdminPage';

export const Route = createFileRoute('/admin/shops/$shopId')({
  beforeLoad: () => requireAuth(),
  component: () => <AdminPage><ShopDetailPage /></AdminPage>,
});