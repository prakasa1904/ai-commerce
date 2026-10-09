import React from 'react';
import { Link } from '@tanstack/react-router';
import { useAdminStats } from '../../application/hooks/useAdminProducts';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { Store, Users, Boxes, ShieldCheck } from 'lucide-react';

const StatCard: React.FC<{ label: string; value: number | undefined; sub?: string }> = ({
  label,
  value,
  sub,
}) => (
  <div className="rounded-2xl border border-wheat/60 bg-cream p-5 shadow-sm">
    <p className="font-display text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay">{label}</p>
    <p className="mt-2 font-display font-black text-5xl leading-none text-forest">{value ?? '—'}</p>
    {sub && <p className="mt-1 text-xs text-soil/60">{sub}</p>}
  </div>
);

type EntryCard = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  count: number | undefined;
  soon?: boolean;
};

const AdminDashboard: React.FC = () => {
  const { token, isAdmin } = useAuthContext();
  const { data: stats, isLoading } = useAdminStats(token);

  const entries: EntryCard[] = [
    { to: '/admin/users', icon: Users, title: 'Manage users', desc: 'Create, edit and deactivate buyer & seller accounts, and promote platform admins.', count: stats?.users },
    { to: '/admin/shops', icon: Store, title: 'Manage shops', desc: 'Create and edit stalls, invite members, set shop roles and soft-delete shops.', count: stats?.shops },
    { to: '/admin/products', icon: Boxes, title: 'Manage products', desc: 'Add produce, set unit & stock, price wholesale lots and link products to shops.', count: stats?.products },
    { to: '/admin', icon: ShieldCheck, title: 'Permissions', desc: 'Invite users to a shop and set admin or non-admin roles (non-admins can update but never delete).', count: stats?.shops, soon: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-forest font-display">Dashboard</h1>
        <p className="mt-1 text-sm text-soil/60">Overview of users, shops and products managed through the marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Users" value={stats?.users} sub={`${stats?.activeUsers ?? 0} active · ${stats?.deletedUsers ?? 0} removed`} />
        <StatCard label="Shops" value={stats?.shops} sub={`${stats?.deletedShops ?? 0} removed`} />
        <StatCard label="Products" value={stats?.products} sub={`${stats?.deletedProducts ?? 0} removed`} />
        <StatCard label="Memberships" value={stats?.shops} sub="Users invited into shops" />
      </div>

      <section>
        <p className="font-display text-clay font-black text-[0.68rem] uppercase tracking-[0.25em]">Manage data</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries
            .filter((e) => isAdmin || !e.soon)
            .map((e) => (
              <Link key={e.to} to={e.to} className="group rounded-2xl border border-wheat/60 bg-card p-5 hover:border-honey/60 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <span className={`shrink-0 rounded-xl flex h-10 w-10 items-center justify-center text-forest ${e.soon ? 'bg-cream' : 'bg-forest/10'}`}>
                    <e.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-black text-forest">{e.title}</h3>
                    <p className="mt-1 text-xs text-soil/70">{e.desc}</p>
                  </div>
                  {!e.soon && (
                    <span className="font-display font-black text-2xl text-pine tabular-nums">
                      {e.count ?? '—'}
                    </span>
                  )}
                  {e.soon && <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-clay self-start">Invite inside a shop</span>}
                </div>
              </Link>
            ))}
        </div>
      </section>

      {isLoading && <p className="text-sm text-soil/50">Loading stats…</p>}
    </div>
  );
};

export default AdminDashboard;