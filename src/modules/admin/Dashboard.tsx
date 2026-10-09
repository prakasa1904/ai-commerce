import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Users, Store, Boxes, HeartHandshake, ChevronRight } from 'lucide-react';
import type { AdminStats } from '../../domain/types/admin';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useAdminStats } from '../../application/hooks/useAdminProducts';
import { Card, CardHeader, CardContent } from '../../presentation/components/ui/card';

type IconComponent = React.ComponentType<{ className?: string }>;

const KPI_CARDS = [
  { label: 'Users', icon: Users, value: (s: AdminStats) => s.users, sub: (s: AdminStats) => `${s.activeUsers} active · ${s.deletedUsers} removed` },
  { label: 'Memberships', icon: HeartHandshake, value: (s: AdminStats) => s.memberships, sub: () => 'Users invited into shops' },
  { label: 'Shops', icon: Store, value: (s: AdminStats) => s.shops, sub: (s: AdminStats) => `${s.deletedShops} removed` },
  { label: 'Products', icon: Boxes, value: (s: AdminStats) => s.products, sub: (s: AdminStats) => `${s.deletedProducts} removed` },
] as const;

const StatCard: React.FC<{ stats: AdminStats; card: { label: string; icon: IconComponent; value: (s: AdminStats) => number; sub: (s: AdminStats) => string } }> = ({
  stats,
  card: { label, icon: Icon, value, sub },
}) => (
  <Card className="border-wheat/60">
    <CardHeader className="flex-row items-center gap-3 space-y-0 p-5 pb-2">
      <span className="shrink-0 rounded-xl bg-forest/10 h-10 w-10 flex items-center justify-center text-forest">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-display text-[0.62rem] font-black uppercase tracking-[0.2em] text-clay">{label}</p>
    </CardHeader>
    <CardContent className="px-5 pt-2 pb-5">
      <p className="font-display font-black text-4xl leading-none text-forest tabular-nums">{value(stats)}</p>
      <p className="mt-1 text-xs text-soil/60">{sub(stats)}</p>
    </CardContent>
  </Card>
);

const StatCardSkeleton: React.FC = () => (
  <Card className="border-wheat/60">
    <CardHeader className="flex-row items-center gap-3 space-y-0 p-5 pb-2">
      <div className="h-10 w-10 rounded-xl bg-wheat/70 animate-pulse" />
      <div className="h-4 w-24 rounded-sm bg-wheat/70 animate-pulse" />
    </CardHeader>
    <CardContent className="px-5 pt-2 pb-5">
      <div className="h-9 w-20 rounded-sm bg-wheat/70 animate-pulse" />
      <div className="mt-1 h-3 w-32 rounded-sm bg-wheat/70 animate-pulse" />
    </CardContent>
  </Card>
);

const MANAGE_CARDS = [
  { to: '/admin/users', icon: Users, title: 'Manage users', desc: 'Create, edit and deactivate buyer & seller accounts, and promote platform admins.', count: (s: AdminStats) => s.users },
  { to: '/admin/shops', icon: Store, title: 'Manage shops', desc: 'Create and edit stalls, invite members, set shop roles and soft-delete shops.', count: (s: AdminStats) => s.shops },
  { to: '/admin/products', icon: Boxes, title: 'Manage products', desc: 'Add produce, set unit & stock, price wholesale lots and link products to shops.', count: (s: AdminStats) => s.products },
] as const;

const ManageCard: React.FC<{ stats: AdminStats; card: { to: string; icon: IconComponent; title: string; desc: string; count: (s: AdminStats) => number } }> = ({
  stats,
  card: { to, icon: Icon, title, desc, count },
}) => (
  <Link
    to={to}
    className="group rounded-2xl border border-wheat/60 bg-card p-5 hover:border-honey/60 hover:shadow-md transition-all"
  >
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 rounded-xl bg-forest/10 h-10 w-10 flex items-center justify-center text-forest">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display font-black text-forest">{title}</h3>
        <p className="mt-1 text-xs text-soil/70">{desc}</p>
      </div>
      <span className="shrink-0 flex items-center gap-2 self-start font-display font-black text-2xl text-pine tabular-nums">
        {count(stats)}
        <ChevronRight className="h-4 w-4 text-forest/40 group-hover:translate-x-1 group-hover:text-clay transition-all" />
      </span>
    </div>
  </Link>
);

const ManageCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-wheat/60 bg-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-wheat/70 animate-pulse" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-28 rounded-sm bg-wheat/70 animate-pulse" />
        <div className="h-3 w-full max-w-[70%] rounded-sm bg-wheat/70 animate-pulse" />
      </div>
      <div className="h-7 w-12 shrink-0 rounded-sm bg-wheat/70 animate-pulse" />
    </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { token } = useAuthContext();
  const { data: stats, isLoading } = useAdminStats(token);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), 1000);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-forest font-display">Dashboard</h1>
        <p className="mt-1 text-sm text-soil/60">Overview of users, shops and products managed through the marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && showSkeleton
          ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
          : KPI_CARDS.map((card) => <StatCard key={card.label} stats={stats} card={card} />)}
      </div>

      <section>
        <p className="font-display text-clay font-black text-[0.68rem] uppercase tracking-[0.25em]">Manage your data</p>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && showSkeleton
            ? Array.from({ length: 3 }, (_, i) => <ManageCardSkeleton key={i} />)
            : MANAGE_CARDS.map((card) => <ManageCard key={card.to} stats={stats} card={card} />)}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;