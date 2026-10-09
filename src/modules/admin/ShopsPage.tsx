import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { Store, Loader2, Trash2, RotateCw } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useAdminShops, useAdminShopMutations } from '../../application/hooks/useAdminShops';
import type { AdminShop } from '../../domain/types/admin';

const ShopsPage: React.FC = () => {
  const { token, isAdmin } = useAuthContext();
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentShop, setCurrentShop] = useState<AdminShop | null>(null);
  const [form, setForm] = useState({ name: '', description: '', website: '', phone: '', email: '', address: '', employees: '' });

  const { data: shops = [], isLoading } = useAdminShops(token, {
    q: query || undefined,
    includeDeleted: (isAdmin && showDeleted) || undefined,
  });
  const { create, update, remove, restore } = useAdminShopMutations(token);

  const openCreate = () => {
    setCurrentShop(null);
    setForm({ name: '', description: '', website: '', phone: '', email: '', address: '', employees: '' });
    setEditing(true);
  };

  const openEdit = (shop: AdminShop) => {
    setCurrentShop(shop);
    setForm({ name: shop.name, description: shop.description, website: shop.website, phone: shop.phone, email: shop.email, address: shop.address, employees: shop.employees });
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentShop) {
        await update.mutateAsync({ id: currentShop.id, changes: form });
      } else {
        await create.mutateAsync(form);
      }
      setEditing(false);
    } catch {
      // keep dialog open on validation error
    }
  };

  if (isLoading) return <p className="text-sm text-soil/50">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin · Shops</p>
          <h2 className="mt-2 text-2xl font-black text-forest font-display">Stalls &amp; stands</h2>
          <p className="mt-1 text-sm text-soil/60">Shops hold products and can invite other users as members. Each shop has a single address.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Store className="h-4 w-4 mr-1.5" /> New shop
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md rounded-full"
        />
        <label className="inline-flex items-center gap-2 text-sm text-soil/70">
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} className="rounded border-wheat/60 bg-card accent-forest" />
          Show removed
        </label>
      </div>

      <DataTable
        columns={[
          { header: 'Shop', accessor: 'name', render: (s: AdminShop) => (
            <Link to="/admin/shops/$shopId" params={{ shopId: String(s.id) }} className="font-semibold text-forest hover:text-clay transition-colors">{s.name}</Link>
          ) },
          { header: 'Owner', accessor: 'ownerUsername' },
          { header: 'Products', accessor: 'id', render: () => '—' },
          { header: 'Status', accessor: 'deletedAt', render: (s: AdminShop) => s.deletedAt ? <Badge variant="destructive">Removed</Badge> : <Badge variant="secondary">Active</Badge> },
          { header: 'Actions', accessor: 'id', className: 'w-40', render: (s: AdminShop) => (
            <div className="flex items-center gap-1.5">
              <button type="button" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest text-xs" onClick={() => openEdit(s)}>Edit</button>
              {s.deletedAt ? (
                <button type="button" aria-label="Restore" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => restore.mutate(s.id)}><RotateCw className="h-3.5 w-3.5" /></button>
              ) : (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => remove.mutate(s.id)}><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          ) },
        ]}
        data={shops}
        emptyMessage="No shops yet. Create one to start selling."
      />

      <Dialog
        open={editing}
        onOpenChange={setEditing}
        title={currentShop ? 'Edit shop' : 'Create shop'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {currentShop ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Name</span>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Address</span>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Description</span>
            <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Website</span>
              <Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Phone</span>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Email</span>
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Employees</span>
            <Input value={form.employees} onChange={(e) => setForm((f) => ({ ...f, employees: e.target.value }))} placeholder="2" />
          </label>
        </form>
      </Dialog>
    </div>
  );
};

export default ShopsPage;