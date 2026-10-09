import React from 'react';
import { Link, useRouter, useLocation } from '@tanstack/react-router';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { Button } from '../../presentation/components/ui/button';
import { Leaf, LayoutGrid, Users, Store, Boxes } from 'lucide-react';

type NavIconName = 'LayoutGrid' | 'Users' | 'Store' | 'Boxes';

const links: { to: string; label: string; icon: NavIconName }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutGrid' },
  { to: '/admin/users', label: 'Users', icon: 'Users' },
  { to: '/admin/shops', label: 'Shops', icon: 'Store' },
  { to: '/admin/products', label: 'Products', icon: 'Boxes' },
];

const ICONS: Record<NavIconName, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Users,
  Store,
  Boxes,
};

function NavIcon({ name }: { name: NavIconName }) {
  const Lucide = ICONS[name];
  return <Lucide className="h-4 w-4" />;
}

const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, logout } = useAuthContext();
  const router = useRouter();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-wheat">
      <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-full bg-honey flex h-8 w-8 items-center justify-center text-forest">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display font-extrabold text-cream text-lg">Farm Marketplace Admin</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            {isAdmin && <span className="rounded-full bg-honey/20 text-honey text-[0.62rem] font-black uppercase tracking-[0.2em] px-2.5 py-1">Platform admin</span>}
            {user && (
              <span className="text-xs text-cream/70 font-medium">
                {user.username} · {user.role}
              </span>
            )}
            <Button
              variant="ghost"
              className="text-cream text-sm hover:text-honey"
              onClick={() => {
                logout();
                void router.navigate({ to: '/' });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full gap-6 px-4 py-8">
        <nav className="hidden md:block w-64 shrink-0">
          <ul className="space-y-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-forest text-cream'
                        : 'text-forest/80 hover:bg-cream hover:text-forest hover:border-moss/40 hover:border'
                    }`}
                  >
                    <NavIcon name={l.icon} />
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 px-3 py-2 border border-wheat/40 rounded-xl bg-cream/60">
            <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay">Soft-delete on</p>
            <p className="mt-1 text-xs text-soil/70">
              Nothing in the admin is ever permanently deleted. Deletes only flag a row as removed, and it can always be restored.
            </p>
          </div>
        </nav>

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <footer className="shrink-0 bg-forest border-t border-forest/60 px-4 py-6">
        <div className="max-w-7xl mx-auto text-center text-xs text-cream/60">
          Farm Marketplace · Admin console
        </div>
      </footer>
    </div>
  );
};

export default AdminShell;