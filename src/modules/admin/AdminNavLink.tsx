import React from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutGrid, Users, Store, Boxes } from 'lucide-react';

export type NavIconName = 'LayoutGrid' | 'Users' | 'Store' | 'Boxes';

export const NAV_ICONS: Record<NavIconName, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Users,
  Store,
  Boxes,
};

export type AdminNavGroup = 'overview' | 'manage';

export const GROUP_ORDER: AdminNavGroup[] = ['overview', 'manage'];

export const ADMIN_PAGES: { to: string; label: string; icon: NavIconName; group: AdminNavGroup }[] = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutGrid', group: 'overview' },
  { to: '/admin/users', label: 'Users', icon: 'Users', group: 'manage' },
  { to: '/admin/shops', label: 'Shops', icon: 'Store', group: 'manage' },
  { to: '/admin/products', label: 'Products', icon: 'Boxes', group: 'manage' },
];

export function isActive(to: string, pathname: string): boolean {
  if (to === '/admin') return pathname === '/admin';
  return pathname === to || pathname.startsWith(to + '/');
}

interface AdminNavLinkProps {
  to: string;
  label: string;
  icon: NavIconName;
  active: boolean;
  compact?: boolean;
}

function NavIcon({ name }: { name: NavIconName }) {
  const Lucide = NAV_ICONS[name];
  return <Lucide className="h-4 w-4" />;
}

export function AdminNavLink({ to, label, icon, active, compact = false }: AdminNavLinkProps) {
  const activeClass = active ? 'bg-forest text-cream' : 'text-forest/60 hover:bg-cream hover:text-forest';

  if (compact) {
    return (
      <Link
        to={to}
        title={label}
        aria-label={label}
        className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${activeClass}`}
      >
        <NavIcon name={icon} />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-l-4 ${
        active
          ? 'border-honey bg-forest/5 font-black text-forest pl-3'
          : 'border-transparent text-forest/60 hover:bg-cream hover:text-forest'
      }`}
    >
      <span aria-hidden className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-honey ${active ? 'opacity-100' : 'opacity-0'}`} />
      <span className={`shrink-0 ${active ? 'text-forest' : 'text-forest/50'}`}>
        <NavIcon name={icon} />
      </span>
      <span className={`${active ? 'font-black text-forest' : 'opacity-70'}`}>{label}</span>
    </Link>
  );
}