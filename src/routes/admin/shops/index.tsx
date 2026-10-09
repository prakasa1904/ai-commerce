import { createFileRoute } from '@tanstack/react-router';
import ShopsPage from '../../../modules/admin/ShopsPage';
import { AdminPage, requireAuth } from '../../../modules/admin/AdminPage';

export const Route = createFileRoute('/admin/shops/')({
  beforeLoad: () => requireAuth(),
  component: () => <AdminPage><ShopsPage /></AdminPage>,
});