import React, { useState } from 'react';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { Package, Loader2, Trash2, RotateCw, Link as LinkIcon } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useAdminProducts, useAdminProductMutations, useProductShopMutations } from '../../application/hooks/useAdminProducts';
import { useOwnShops } from '../../application/hooks/useOwnShops';
import type { AdminProduct, AdminShop } from '../../domain/types/admin';

const ProductsPage: React.FC = () => {
  const { token, isAdmin } = useAuthContext();
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', price: '', imageUrl: '', category: 'general',
    unit: 'kg', stock: '', wholesale: false,
  });
  const [linkingId, setLinkingId] = useState<number | null>(null);

  const { data: products = [], isLoading } = useAdminProducts(token, {
    q: query || undefined,
    includeDeleted: (isAdmin && showDeleted) || undefined,
  });
  const { create, update, remove, restore } = useAdminProductMutations(token);

  const openCreate = () => {
    setSelected(null);
    setForm({ title: '', description: '', price: '', imageUrl: '', category: 'general', unit: 'kg', stock: '', wholesale: false });
    setEditing(true);
  };

  const openEdit = (p: AdminProduct) => {
    setSelected(p);
    setForm({
      title: p.title, description: p.description, price: String(p.price),
      imageUrl: p.imageUrl, category: p.category, unit: p.unit,
      stock: String(p.stock), wholesale: p.wholesale,
    });
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      category: form.category,
      unit: form.unit,
      stock: Number(form.stock),
      wholesale: form.wholesale,
    };
    try {
      if (selected) {
        await update.mutateAsync({ id: selected.id, changes: payload });
      } else {
        await create.mutateAsync(payload);
      }
      setEditing(false);
    } catch {
      // keep dialog open
    }
  };

  if (isLoading) return <p className="text-sm text-soil/50">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin · Products</p>
          <h2 className="mt-2 text-2xl font-black text-forest font-display">Harvest listings</h2>
          <p className="mt-1 text-sm text-soil/60">Create and edit products, then link them to one or more of your shops.</p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Package className="h-4 w-4 mr-1.5" /> New product
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
          { header: 'Product', accessor: 'title', render: (p: AdminProduct) => (
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-xs text-soil/60">{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>
            </div>
          ) },
          { header: 'Price', accessor: 'price', render: (p: AdminProduct) => `Rp${p.price.toLocaleString('id-ID')}` },
          { header: 'Unit', accessor: 'unit' },
          { header: 'Stock', accessor: 'stock' },
          { header: 'Shops', accessor: 'shopCount', className: 'w-16' },
          { header: 'Category', accessor: 'category' },
          { header: 'Status', accessor: 'deletedAt', className: 'w-24', render: (p: AdminProduct) => p.deletedAt ? <Badge variant="destructive">Removed</Badge> : <Badge variant="secondary">Active</Badge> },
          { header: 'Actions', accessor: 'id', className: 'w-44', render: (p: AdminProduct) => (
            <div className="flex items-center gap-1.5">
              <button type="button" className="h-8 px-2 rounded-md text-xs text-forest/70 hover:text-forest" onClick={() => openEdit(p)}>Edit</button>
              <button type="button" aria-label="Link to shops" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => setLinkingId(p.id)}>
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
              {p.deletedAt ? (
                <button type="button" aria-label="Restore" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => restore.mutate(p.id)}><RotateCw className="h-3.5 w-3.5" /></button>
              ) : (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => remove.mutate(p.id)}><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          ) },
        ]}
        data={products}
        emptyMessage="No products yet."
      />

      <Dialog
        open={Boolean(linkingId)}
        onOpenChange={(open) => setLinkingId(open ? linkingId : null)}
        title="Link product to shops"
        description="A product can be listed in any number of shops you own."
        footer={<Button variant="ghost" onClick={() => setLinkingId(null)}>Close</Button>}
      >
        <ProductShopLinkDialog productId={linkingId} onClose={() => setLinkingId(null)} />
      </Dialog>

      <Dialog
        open={editing}
        onOpenChange={setEditing}
        title={selected ? 'Edit product' : 'Create product'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {selected ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Name</span>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Price (Rp)</span>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Unit</span>
              <Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="kg" />
            </label>
            <label className="block">
              <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Stock</span>
              <Input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Category</span>
            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="vegetables" />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Image URL</span>
            <Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…" />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.wholesale} onChange={(e) => setForm((f) => ({ ...f, wholesale: e.target.checked }))} className="rounded border-wheat/60 bg-card accent-forest" />
            <span className="text-sm text-forest">Wholesale lot</span>
          </label>
        </form>
      </Dialog>
    </div>
  );
};

function ProductShopLinkDialog({ productId, onClose }: { productId: number | null; onClose: () => void }) {
  const { token } = useAuthContext();
  const [selectedShop, setSelectedShop] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const { data: userShops = [] } = useOwnShops(token);
  const linkMutations = useProductShopMutations(token);

  const handleLink = () => {
    if (selectedShop === '' || !productId) return;
    linkMutations.link.mutate({
      productId,
      shopId: selectedShop,
      ...(price !== '' ? { price: Number(price) } : {}),
      ...(stock !== '' ? { stock: Number(stock) } : {}),
    });
    setSelectedShop('');
    setPrice('');
    setStock('');
    onClose();
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Shop</span>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={selectedShop}
          onChange={(e) => setSelectedShop(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Choose a shop…</option>
          {userShops.map((s: AdminShop) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Shop price (optional)</span>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Overrides base price" />
        </label>
        <label className="block">
          <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Stock</span>
          <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
        </label>
      </div>
      <Button
        onClick={handleLink}
        disabled={selectedShop === '' || linkMutations.link.isPending}
        className="w-full"
      >
        {linkMutations.link.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null} Link product
      </Button>
    </div>
  );
}

export default ProductsPage;