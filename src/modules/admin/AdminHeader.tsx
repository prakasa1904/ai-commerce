import React from 'react';
import { useLocation, useRouter } from '@tanstack/react-router';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { Button } from '../../presentation/components/ui/button';
import { Leaf, Menu, X } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/users': 'Users',
  '/admin/shops': 'Shops',
  '/admin/products': 'Products',
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/shops/')) return 'Shop';
  return PAGE_TITLES[pathname] ?? 'Overview';
}

interface AdminHeaderProps {
  mobileOpen: boolean;
  onToggleMobile: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ mobileOpen, onToggleMobile }) => {
  const { user, isAdmin, logout } = useAuthContext();
  const router = useRouter();
  const { pathname } = useLocation();

  const signOut = () => {
    logout();
    void router.navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 bg-forest/95 backdrop-blur border-b border-forest/60">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 rounded-full bg-honey flex h-8 w-8 items-center justify-center text-forest">
            <Leaf className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display font-extrabold text-cream text-sm truncate">Farm Marketplace</p>
            <p className="text-[0.58rem] font-black uppercase tracking-[0.25em] text-cream/60">Admin</p>
          </div>
        </div>

        <h1 className="hidden md:block flex-1 text-center font-display font-black text-honey text-base tracking-wide">
          {pageTitle(pathname)}
        </h1>

        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <span className="rounded-full bg-honey/20 text-honey text-[0.62rem] font-black uppercase tracking-[0.2em] border border-honey/30 px-2.5 py-1">
              Platform admin
            </span>
          )}
          {user && (
            <span className="text-xs text-cream/70 font-medium">
              {user.username} · {user.role}
            </span>
          )}
          <Button variant="ghost" size="sm" className="text-cream text-sm hover:text-honey" onClick={signOut}>
            Sign out
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-cream"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={onToggleMobile}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};