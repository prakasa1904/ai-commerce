import React, { useState } from 'react';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { ConfirmDialog } from '../../presentation/components/ui/confirm';
import { Select } from '../../presentation/components/ui/select';
import { TextField } from '../../presentation/components/ui/textfield';
import { Package, Loader2, Trash2, RotateCw, Link as LinkIcon } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import { useAuthContext } from '../../application/providers/AuthProvider';
import {
  useAdminProducts,
  useAdminProductMutations,
  useProductShopMutations,
  useProductShops,
} from '../../application/hooks/useAdminProducts';
import { useOwnShops } from '../../application/hooks/useOwnShops';
import type { AdminProduct, AdminShop, ProductShopLink } from '../../domain/types/admin';
import { ALL_CATEGORIES, type ProductCategory } from '../../domain/types/product';

type ProductForm = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: ProductCategory;
  unit: string;
  stock: string;
  wholesale: boolean;
};

type FieldErrors = {
  title?: string;
  price?: string;
  category?: string;
  stock?: string;
};

const EMPTY_FORM: ProductForm = {
  title: '',
  description: '',
  price: '',
  imageUrl: '',
  category: 'vegetables',
  unit: 'kg',
  stock: '',
  wholesale: false,
};

function validate(fields: Partial<ProductForm>): FieldErrors {
  const next: FieldErrors = {};

  if (!fields.title?.trim()) {
    next.title = 'Title is required.';
  }

  if (!fields.price?.trim()) {
    next.price = 'Price is required.';
  } else if (Number.isNaN(Number(fields.price)) || Number(fields.price) < 0) {
    next.price = 'Enter a valid price in Rp.';
  }

  if (!fields.category) {
    next.category = 'Category is required.';
  }

  if (fields.stock && (Number.isNaN(Number(fields.stock)) || Number(fields.stock) < 0)) {
    next.stock = 'Enter a valid stock count.';
  }

  return next;
}

const formatRp = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const ProductsPage: React.FC = () => {
  const { token } = useAuthContext();
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [linkingId, setLinkingId] = useState<number | null>(null);

  const { data: products = [], isLoading } = useAdminProducts(token, {
    q: query || undefined,
    includeDeleted: showDeleted || undefined,
  });
  const { create, update, remove, restore } = useAdminProductMutations(token);

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setEditing(true);
  };

  const openEdit = (p: AdminProduct) => {
    setSelected(p);
    setForm({
      title: p.title,
      description: p.description,
      price: String(p.price),
      imageUrl: p.imageUrl,
      category: p.category,
      unit: p.unit,
      stock: String(p.stock),
      wholesale: p.wholesale,
    });
    setErrors({});
    setEditing(true);
  };

  const handleFieldChange = (field: keyof ProductForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev } as FieldErrors;
      if ('title' === field) {
        next.title = (validate({ title: value }) as FieldErrors).title;
      } else if ('price' === field) {
        next.price = (validate({ price: value }) as FieldErrors).price;
      } else if ('stock' === field) {
        next.stock = (validate({ stock: value }) as FieldErrors).stock;
      } else if ('category' === field) {
        next.category = (validate({ category: value as ProductCategory }) as FieldErrors).category;
      }
      if (!next[field as keyof FieldErrors]) delete (next as Record<string, string | undefined>)[field];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
      category: form.category,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      wholesale: form.wholesale,
    };

    if (selected) {
      update.mutate({ id: selected.id, changes: payload }, { onSuccess: () => setEditing(false) });
    } else {
      create.mutate(payload, { onSuccess: () => setEditing(false) });
    }
  };

  const submitDisabled = create.isPending || update.isPending;

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
          {
            header: 'Product',
            accessor: 'title',
            render: (p: AdminProduct) => (
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-soil/60">{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>
              </div>
            ),
          },
          { header: 'Price', accessor: 'price', render: (p: AdminProduct) => formatRp(p.price) },
          { header: 'Unit', accessor: 'unit' },
          { header: 'Stock', accessor: 'stock', render: (p: AdminProduct) => p.stock.toLocaleString('id-ID') },
          { header: 'Shops', accessor: 'shopCount', className: 'w-16', render: (p: AdminProduct) => <Badge variant="secondary">{p.shopCount}</Badge> },
          { header: 'Category', accessor: 'category', className: 'w-28' },
          { header: 'Status', accessor: 'deletedAt', className: 'w-24', render: (p: AdminProduct) => p.deletedAt ? <Badge variant="destructive">Removed</Badge> : <Badge variant="secondary">Active</Badge> },
          { header: 'Actions', accessor: 'id', className: 'w-52', render: (p: AdminProduct) => (
            <div className="flex items-center gap-1.5">
              <button type="button" className="h-8 px-2 rounded-md text-xs text-forest/70 hover:text-forest" onClick={() => openEdit(p)}>Edit</button>
              <button type="button" aria-label="Link to shops" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => setLinkingId(p.id)}>
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
              {p.deletedAt ? (
                <button type="button" aria-label="Restore" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => setRestoringId(p.id)}><RotateCw className="h-3.5 w-3.5" /></button>
              ) : (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => setRemovingId(p.id)}><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          ) },
        ]}
        data={products}
        loading={isLoading}
        getRowClassName={(p: AdminProduct) => (p.deletedAt ? 'bg-honey/10' : undefined)}
        emptyMessage="No products yet. Create one to start listing."
        emptyAction={
          <Button variant="default" size="sm" onClick={openCreate}>
            <Package className="h-4 w-4 mr-1.5" /> New product
          </Button>
        }
      />

      <ConfirmDialog
        open={removingId !== null}
        onOpenChange={() => setRemovingId(null)}
        title="Remove product"
        description="This product is hidden until it is restored. Its shop listings are kept intact."
        confirmText="Remove"
        pending={remove.isPending}
        onConfirm={() => {
          if (removingId !== null) remove.mutate(removingId);
          setRemovingId(null);
        }}
      />

      <ConfirmDialog
        open={restoringId !== null}
        onOpenChange={() => setRestoringId(null)}
        title="Restore product"
        description="Bring this product back so it can be listed and sold again."
        confirmText="Restore"
        confirmVariant="default"
        pending={restore.isPending}
        onConfirm={() => {
          if (restoringId !== null) restore.mutate(restoringId);
          setRestoringId(null);
        }}
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
        footer={<Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Name"
            value={form.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            error={errors.title}
            required
          />
          <TextField
            label="Price (Rp)"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            error={errors.price}
            hint={selected ? formatRp(selected.price) : undefined}
            required
          />
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Unit</span>
            <Input value={form.unit} onChange={(e) => handleFieldChange('unit', e.target.value)} className="mt-1" placeholder="kg" />
          </label>
          <TextField
            label="Stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => handleFieldChange('stock', e.target.value)}
            error={errors.stock}
            hint={selected ? `${selected.stock.toLocaleString('id-ID')} available` : 'Units on hand'}
            placeholder="0"
          />
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Category</span>
            <Select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProductCategory }))}
              className="mt-1"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </label>
          <TextField
            label="Image URL"
            value={form.imageUrl}
            onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
            placeholder="https://…"
          />
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className="mt-1 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.wholesale} onChange={(e) => setForm((f) => ({ ...f, wholesale: e.target.checked }))} className="rounded border-wheat/60 bg-card accent-forest" />
            <span className="text-sm text-forest">Wholesale lot</span>
          </label>
          <Button type="submit" disabled={submitDisabled} className="w-full">
            {submitDisabled ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {selected ? 'Save' : 'Create'}
          </Button>
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
  const [unlinking, setUnlinking] = useState<ProductShopLink | null>(null);
  const { data: userShops = [] } = useOwnShops(token);
  const { data: linked = [] } = useProductShops(token, productId ?? 0);
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
      <div>
        <h3 className="text-xs font-display font-black uppercase tracking-wider text-soil/70 mb-2">Listed in {linked.length} shop{linked.length === 1 ? '' : 's'}</h3>
        {linked.length === 0 ? (
          <p className="text-sm text-soil/50">Not listed in any shop yet.</p>
        ) : (
          <ul className="divide-y divide-wheat/40">
            {linked.map((l: ProductShopLink) => (
              <li key={l.shopId} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm text-forest">{l.shopName}</span>
                <span className="text-xs text-soil/50">Stock {l.stock.toLocaleString('id-ID')}</span>
                <button type="button" aria-label={`Unlink ${l.shopName}`} className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => setUnlinking(l)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-wheat/40 pt-3">
        <h3 className="text-xs font-display font-black uppercase tracking-wider text-soil/70 mb-2">Link to another shop</h3>
        <label className="block">
          <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Shop</span>
          <Select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value ? Number(e.target.value) : '')} className="mt-1">
            <option value="">Choose a shop…</option>
            {userShops.map((s: AdminShop) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Shop price (optional)</span>
            <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" placeholder="Overrides base price" />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Stock</span>
            <Input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1" placeholder="0" />
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

      <ConfirmDialog
        open={unlinking !== null}
        onOpenChange={() => setUnlinking(null)}
        title="Unlink from shop"
        description={unlinking ? `Remove this product from “${unlinking.shopName}”. It stays in your catalog and can be relinked.` : 'Remove this product from the shop.'}
        confirmText="Unlink"
        confirmVariant="destructive"
        pending={linkMutations.unlink.isPending}
        onConfirm={() => {
          if (unlinking && productId) linkMutations.unlink.mutate({ productId, shopId: unlinking.shopId });
          setUnlinking(null);
        }}
      />
    </div>
  );
}

export default ProductsPage;