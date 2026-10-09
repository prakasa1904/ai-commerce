import React, { useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { Users, Trash2, Loader2, UserRoundPlus, ShieldCheck } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import type { ShopMember } from '../../domain/types/admin';

import { useAuthContext } from '../../application/providers/AuthProvider';
import {
  useShopMembers,
  useMemberMutations,
  useAdminShopMutations,
  useShopProducts,
} from '../../application/hooks/useAdminShops';
import { useProductShopMutations } from '../../application/hooks/useAdminProducts';

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams({ strict: false });
  const { token } = useAuthContext();
  const shopIdNum = Number(shopId);
  const [showProducts, setShowProducts] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', website: '', phone: '', email: '', address: '', employees: '' });
  const [inviteUser, setInviteUser] = useState('');

  const { data: members = [], isLoading: membersLoading } = useShopMembers(token, shopIdNum);
  const { data: productShops = [] } = useShopProducts(token, shopIdNum);
  const { update } = useAdminShopMutations(token);
  const memberMutations = useMemberMutations(token, shopIdNum);
  const linkMutations = useProductShopMutations(token);

  const handleInvite = () => {
    const match = /^(\d+)$/.exec(inviteUser.trim());
    if (!match) return;
    memberMutations.add.mutate({ userId: Number(match[1]), role: 'non_admin' });
    setInviteUser('');
  };

  const submitShop = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({ id: shopIdNum, changes: form });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin · Shop</p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-black text-forest font-display">Shop #{shopId}</h1>
            <Link to="/admin/shops" className="text-sm text-pine hover:text-clay transition-colors">← All shops</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showProducts ? 'default' : 'outline'} size="sm" onClick={() => setShowProducts((p) => !p)}>
            <Users className="h-4 w-4 mr-1.5" /> {showProducts ? 'Hide products' : 'Show products'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit shop</Button>
        </div>
      </div>

      {showProducts ? (
        <section>
          <h2 className="text-lg font-black text-forest font-display mt-4">Products in this shop</h2>
          <DataTable
            columns={[
              { header: 'Product', accessor: 'productName', render: (p: { productName: string }) => (
                <span className="font-semibold">{p.productName}</span>
              ) },
              { header: 'Price', accessor: 'price', render: (p: { price: number | null }) => p.price ? `Rp${p.price.toLocaleString('id-ID')}` : '—' },
              { header: 'Stock', accessor: 'stock' },
              { header: 'Actions', accessor: 'productId', className: 'w-32', render: (p: { productId: number }) => (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => linkMutations.unlink.mutate({ productId: p.productId, shopId: shopIdNum })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) },
            ]}
            data={productShops}
            emptyMessage="No products linked to this shop yet."
          />
        </section>
      ) : (
        <section>
          <h2 className="text-lg font-black text-forest font-display mt-4">Members</h2>
          <p className="text-sm text-soil/60 mt-1">
            Invite other users by account id. <span className="font-black text-forest">Shop admins</span> have full CRUD access;
            <span className="font-black text-forest"> members</span> can update but cannot delete.
          </p>
          <div className="mt-4 grid sm:grid-cols-12 gap-3">
            <Input
              type="text"
              placeholder="Invite user by id…"
              value={inviteUser}
              onChange={(e) => setInviteUser(e.target.value)}
              className="sm:col-span-8 rounded-full"
            />
            <Button className="sm:col-span-4" onClick={handleInvite} disabled={!inviteUser.trim()}>
              <UserRoundPlus className="h-4 w-4 mr-1.5" /> Invite
            </Button>
          </div>
          {membersLoading ? (
            <p className="text-sm text-soil/50 mt-3">Loading…</p>
          ) : (
            <DataTable
              columns={[
                { header: 'Member', accessor: 'username', render: (m: ShopMember) => (
                  <div>
                    <div className="font-semibold">{m.username}</div>
                    <div className="text-xs text-soil/60">{m.email}</div>
                  </div>
                ) },
                { header: 'Role', accessor: 'role', render: (m: ShopMember) => (
                  m.role === 'admin' ? (
                    <Badge variant="secondary"><ShieldCheck className="h-3 w-3 mr-1" /> Shop admin</Badge>
                  ) : (
                    <Badge>Member</Badge>
                  )
                ) },
                { header: 'Actions', accessor: 'userId', className: 'w-36', render: (m: ShopMember) => (
                  <div className="flex items-center gap-1.5">
                    {m.role === 'non_admin' && (
                      <button type="button" className="h-8 px-2 rounded-md text-xs text-forest/70 hover:text-forest" onClick={() => memberMutations.update.mutate({ userId: m.userId, role: 'admin' })}>Make admin</button>
                    )}
                    <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => memberMutations.remove.mutate(m.userId)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) },
              ]}
              data={members}
              emptyMessage="No members yet. Invite users by id above."
            />
          )}
        </section>
      )}

      <Dialog
        open={editing}
        onOpenChange={setEditing}
        title="Edit shop"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={submitShop} disabled={update.isPending}>
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null} Save
            </Button>
          </>
        }
      >
        <form onSubmit={submitShop} className="space-y-3">
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

export default ShopDetailPage;