import React from 'react';
import { useLocation } from '@tanstack/react-router';
import { Leaf } from 'lucide-react';
import { AdminNavLink, ADMIN_PAGES, GROUP_ORDER, isActive } from './AdminNavLink';

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function navBlocks() {
  return GROUP_ORDER.map((group) => ({
    group,
    items: ADMIN_PAGES.filter((p) => p.group === group),
  }));
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { pathname } = useLocation();

  return (
    <nav className="hidden md:block w-64 shrink-0">
      <div className="space-y-1">
        {navBlocks().map(({ group, items }, gi) => (
          <React.Fragment key={group}>
            {gi > 0 && <div className="my-4 border-t border-wheat/60" />}
            {items.map((p) => (
              <AdminNavLink
                key={p.to}
                to={p.to}
                label={p.label}
                icon={p.icon}
                active={isActive(p.to, pathname)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 px-3 py-2 border border-wheat/40 rounded-xl bg-cream/60">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay">Soft-delete on</p>
        <p className="mt-1 text-xs text-soil/70">
          Nothing in the admin is ever permanently deleted. Deletes only flag a row as removed, and it can always be restored.
        </p>
      </div>

      <MobileRail mobileOpen={mobileOpen} onCloseMobile={onCloseMobile} />
    </nav>
  );
};

function MobileRail({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const { pathname } = useLocation();
  if (!mobileOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-wheat/70 backdrop-blur-sm" onClick={onCloseMobile} />
      <aside className="absolute inset-y-0 left-0 z-50 w-16 bg-forest border-r border-forest/60 flex flex-col items-center py-6 overflow-y-auto">
        <div className="shrink-0 h-10 w-10 rounded-full bg-honey flex items-center justify-center text-forest">
          <Leaf className="h-4.5 w-4.5" />
        </div>
        <div className="mt-6 flex-1 flex flex-col items-center gap-1 px-1">
          {ADMIN_PAGES.map((p) => (
            <AdminNavLink
              key={p.to}
              to={p.to}
              label={p.label}
              icon={p.icon}
              active={isActive(p.to, pathname)}
              compact
            />
          ))}
        </div>
      </aside>
    </div>
  );
}