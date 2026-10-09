import { createFileRoute } from '@tanstack/react-router';
import UsersPage from '../../modules/admin/UsersPage';
import { AdminPage, requireAuth } from '../../modules/admin/AdminPage';

export const Route = createFileRoute('/admin/users')({
  beforeLoad: () => requireAuth(),
  component: () => <AdminPage><UsersPage /></AdminPage>,
});