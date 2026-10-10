import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '../../presentation/components/ui/button';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { ConfirmDialog } from '../../presentation/components/ui/confirm';
import { Select } from '../../presentation/components/ui/select';
import { TextField } from '../../presentation/components/ui/textfield';
import { TabsList, TabsTrigger, TabsPanel } from '../../presentation/components/ui/tabs';
import { Trash2, Loader2, ShieldCheck, Package } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import type { AdminUser, ShopMember } from '../../domain/types/admin';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useToast } from '../../application/providers/ToastProvider';
import {
  useAdminShop,
  useShopMembers,
  useMemberMutations,
  useAdminShopMutations,
  useShopProducts,
} from '../../application/hooks/useAdminShops';
import { useAdminUsers } from '../../application/hooks/useAdminUsers';
import { useProductShopMutations } from '../../application/hooks/useAdminProducts';

type ShopSection = 'members' | 'products';

type ShopEditForm = {
  name: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  employees: string;
};

type ShopFormErrors = {
  name?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  employees?: string;
};

const EMPTY_FORM: ShopEditForm = {
  name: '',
  description: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  employees: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+/;
const PHONE_RE = /^\+?[\d\s().-]+$/;

function validateShop(field: keyof ShopEditForm, value: string): string | undefined {
  if (field === 'name') {
    if (!value.trim()) return 'Name is required.';
  }
  if (field === 'email' && value.trim() && !EMAIL_RE.test(value.trim())) {
    return 'Enter a valid email address.';
  }
  if (field === 'website' && value.trim() && !URL_RE.test(value.trim())) {
    return 'Enter a valid URL (https://…).';
  }
  if (field === 'phone' && value.trim() && !PHONE_RE.test(value.trim())) {
    return 'Enter a valid phone number.';
  }
  if (field === 'employees' && value.trim()) {
    if (!/^\d+$/.test(value.trim()) || Number(value.trim()) < 0) {
      return 'Enter a whole number of employees.';
    }
  }
  return undefined;
}

const ShopDetailPage: React.FC = () => {
  const { shopId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const shopIdNum = Number(shopId);
  const [tab, setTab] = useState<ShopSection>('members');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ShopEditForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ShopFormErrors>({});
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [promotingId, setPromotingId] = useState<number | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [unlinking, setUnlinking] = useState<{ productId: number; productName: string } | null>(null);
  const formSeededRef = useRef(false);

  const { data: shop } = useAdminShop(token, shopIdNum || null);
  const { data: members = [], isLoading: membersLoading } = useShopMembers(token, shopIdNum);
  const { data: productShops = [], isLoading: productsLoading } = useShopProducts(token, shopIdNum);
  const { data: users = [], isLoading: usersLoading } = useAdminUsers(token);
  const { update } = useAdminShopMutations(token);
  const memberMutations = useMemberMutations(token, shopIdNum);
  const linkMutations = useProductShopMutations(token);
  const { toast } = useToast();

  const openEdit = () => {
    if (shop) {
      setForm({
        name: shop.name,
        description: shop.description,
        website: shop.website,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        employees: shop.employees,
      });
      setErrors({});
      formSeededRef.current = true;
    } else {
      formSeededRef.current = false;
    }
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) {
      formSeededRef.current = false;
      return;
    }
    if (!formSeededRef.current && shop?.id === shopIdNum) {
      formSeededRef.current = true;
      setForm({
        name: shop.name,
        description: shop.description,
        website: shop.website,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        employees: shop.employees,
      });
      setErrors({});
    }
  }, [editing, shop, shopIdNum]);

  const handleInviteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    if (id === null) return;
    setSelectedUserId('');
    if (members.some((m: ShopMember) => m.userId === id)) {
      toast({ title: 'Already a member.', description: 'This user is already invited to the shop.', variant: 'default' });
      return;
    }
    memberMutations.add.mutate({ userId: id, role: 'non_admin' }, { onSuccess: () => setSelectedUserId('') });
  };

  const handleFieldChange = (field: keyof ShopEditForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    const error = validateShop(field, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const submitShop = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: ShopFormErrors = {};
    (Object.keys(form) as (keyof ShopEditForm)[]).forEach((field) => {
      const error = validateShop(field, form[field]);
      if (error) nextErrors[field] = error;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    update.mutate({ id: shopIdNum, changes: form }, { onSuccess: () => setEditing(false) });
  };

  const submitPending = update.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin · Shop</p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-black text-forest font-display">
              {shop ? shop.name || `Shop #${shopId}` : `Shop #${shopId}`}
            </h1>
            <Link to="/admin/shops" className="text-sm text-pine hover:text-clay transition-colors">← All shops</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={openEdit}>Edit shop</Button>
        </div>
      </div>

      <TabsList aria-label="Shop sections">
        <TabsTrigger active={tab === 'members'} id="tab-0" aria-controls="panel-0" tabIndex={tab === 'members' ? 0 : -1} onClick={() => setTab('members')}>Members</TabsTrigger>
        <TabsTrigger active={tab === 'products'} id="tab-1" aria-controls="panel-1" tabIndex={tab === 'products' ? 0 : -1} onClick={() => setTab('products')}>Products</TabsTrigger>
      </TabsList>

      {tab === 'members' ? (
        <TabsPanel id="panel-0" aria-labelledby="tab-0">
        <section className="pt-6">
          <h2 className="text-lg font-black text-forest font-display">Members</h2>
          <p className="text-sm text-soil/60 mt-1">
            Invite other users by choosing an account. <span className="font-black text-forest">Shop admins</span> have full CRUD access;
            <span className="font-black text-forest"> members</span> can update but cannot delete.
          </p>
          <div className="mt-4">
            <Select
              value={selectedUserId}
              onChange={handleInviteChange}
              disabled={usersLoading}
              className="rounded-full"
            >
              <option value="">Choose a user to invite…</option>
              {users.filter((u: AdminUser) => !u.deletedAt).map((u: AdminUser) => (
                <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
              ))}
            </Select>
          </div>
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
                    <button type="button" className="h-8 px-2 rounded-md text-xs text-forest/70 hover:text-forest" onClick={() => setPromotingId(m.userId)}>Make admin</button>
                  )}
                  <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => setRemovingMemberId(m.userId)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) },
            ]}
            data={members}
            loading={membersLoading}
            emptyMessage="No members yet. Invite a user above."
          />
        </section>
        </TabsPanel>
      ) : (
        <TabsPanel id="panel-1" aria-labelledby="tab-1">
        <section className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-black text-forest font-display">Products in this shop</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate({ to: '/admin/products' })}>
              <Package className="h-4 w-4 mr-1.5" /> Link products
            </Button>
          </div>
          <DataTable
            columns={[
              { header: 'Product', accessor: 'productName', render: (p: { productName: string }) => (
                <span className="font-semibold">{p.productName}</span>
              ) },
              { header: 'Price', accessor: 'price', render: (p: { price: number | null }) => p.price ? `Rp${p.price.toLocaleString('id-ID')}` : '—' },
              { header: 'Stock', accessor: 'stock' },
              { header: 'Actions', accessor: 'productId', className: 'w-32', render: (p: { productId: number; productName: string }) => (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => setUnlinking({ productId: p.productId, productName: p.productName })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) },
            ]}
            data={productShops}
            loading={productsLoading}
            emptyMessage="No products linked to this shop yet."
            emptyAction={
              <Button variant="default" size="sm" onClick={() => navigate({ to: '/admin/products' })}>
                <Package className="h-4 w-4 mr-1.5" /> Link products
              </Button>
            }
            />
        </section>
        </TabsPanel>
      )}

      <ConfirmDialog
        open={promotingId !== null}
        onOpenChange={() => setPromotingId(null)}
        title="Make admin"
        description="This member gains full CRUD access to the shop."
        confirmText="Make admin"
        pending={memberMutations.update.isPending}
        onConfirm={() => {
          if (promotingId !== null) memberMutations.update.mutate({ userId: promotingId, role: 'admin' });
          setPromotingId(null);
        }}
      />

      <ConfirmDialog
        open={removingMemberId !== null}
        onOpenChange={() => setRemovingMemberId(null)}
        title="Remove member"
        description="This user loses access to the shop. Re-invite them later if they should return."
        confirmText="Remove"
        pending={memberMutations.remove.isPending}
        onConfirm={() => {
          if (removingMemberId !== null) memberMutations.remove.mutate(removingMemberId);
          setRemovingMemberId(null);
        }}
      />

      <ConfirmDialog
        open={unlinking !== null}
        onOpenChange={() => setUnlinking(null)}
        title="Unlink product"
        description={unlinking ? `Remove “${unlinking.productName}” from this shop. It stays in your catalog and can be relinked.` : 'Remove this product from the shop.'}
        confirmText="Unlink"
        pending={linkMutations.unlink.isPending}
        onConfirm={() => {
          if (unlinking) linkMutations.unlink.mutate({ productId: unlinking.productId, shopId: shopIdNum });
          setUnlinking(null);
        }}
      />

      <Dialog
        open={editing}
        onOpenChange={setEditing}
        title="Edit shop"
        footer={<Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
      >
        <form onSubmit={submitShop} className="space-y-4" noValidate>
          <div className="grid sm:grid-cols-2 gap-3">
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={errors.name}
              required
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => handleFieldChange('address', e.target.value)}
            />
          </div>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="grid sm:grid-cols-4 gap-3">
            <TextField
              label="Website"
              value={form.website}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              error={errors.website}
              placeholder="https://…"
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+62 812 …"
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              error={errors.email}
              placeholder="hello@stall.id"
            />
            <TextField
              label="Employees"
              value={form.employees}
              onChange={(e) => handleFieldChange('employees', e.target.value)}
              error={errors.employees}
              placeholder="2"
            />
          </div>
          <Button type="submit" disabled={submitPending} className="w-full">
            {submitPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            Save
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default ShopDetailPage;