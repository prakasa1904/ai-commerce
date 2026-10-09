import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '../../modules/admin/Dashboard';
import { AdminPage, requireAuth } from '../../modules/admin/AdminPage';

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => requireAuth(),
  component: () => <AdminPage><Dashboard /></AdminPage>,
});