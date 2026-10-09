import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { redirect } from '@tanstack/react-router';
import { useAuthContext } from '../../application/providers/AuthProvider';
import AdminShell from './AdminShell';

export function requireAuth(): void {
  const token = localStorage.getItem('farm_marketplace_token');
  if (!token) throw redirect({ to: '/login', search: { next: '/admin' } });
}

export function AdminPage({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuthContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (isReady && !user) {
      void navigate({ to: '/login', search: { next: '/admin' } });
    }
  }, [isReady, user, navigate]);

  if (!isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wheat">
        <p className="text-sm text-soil/50">Checking session…</p>
      </div>
    );
  }
  return <AdminShell>{children}</AdminShell>;
}