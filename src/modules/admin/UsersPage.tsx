import React, { useState } from 'react';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { Trash2, UserPlus, RotateCw, Loader2 } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useAdminUsers, useAdminUserMutations } from '../../application/hooks/useAdminUsers';
import type { AdminUser } from '../../domain/types/admin';

const UsersPage: React.FC = () => {
  const { token, isAdmin } = useAuthContext();
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', name: '', email: '', role: 'buyer' as 'seller' | 'buyer', isAdmin: false });
  const [password, setPassword] = useState('');
  const [isNew, setIsNew] = useState(false);

  const { data: users = [], isLoading } = useAdminUsers(token, {
    q: query || undefined,
    includeDeleted: showDeleted || undefined,
  });
  const { create, update, remove, restore } = useAdminUserMutations(token);

  const openCreate = () => {
    setIsNew(true);
    setForm({ username: '', name: '', email: '', role: 'buyer', isAdmin: false });
    setPassword('');
    setSelected(null);
    setEditing(true);
  };

  const openEdit = (user: AdminUser) => {
    setIsNew(false);
    setForm({ username: user.username, name: user.name, email: user.email, role: user.role, isAdmin: user.isAdmin });
    setPassword('');
    setSelected(user);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected && !isNew) return;
    try {
      if (isNew && selected === null) {
        await create.mutateAsync({ ...form, isAdmin: form.isAdmin, password });
      } else if (selected) {
        const payload: Record<string, unknown> = { ...form, isAdmin: form.isAdmin };
        if (password) payload.password = password;
        await update.mutateAsync({ id: selected.id, changes: payload });
      }
      setEditing(false);
    } catch {
      // error surfaced via dialog state; keep dialog open
    }
  };

  if (isLoading) return <p className="text-sm text-soil/50">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-honey font-bold text-sm tracking-[0.3em] uppercase">Admin · Users</p>
          <h2 className="mt-2 text-2xl font-black text-forest font-display">Manage accounts</h2>
          <p className="mt-1 text-sm text-soil/60">Buyers and sellers. Only platform admins can delete accounts.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} variant="default" className="shrink-0">
            <UserPlus className="h-4 w-4 mr-1.5" /> New user
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md rounded-full"
        />
        <label className="inline-flex items-center gap-2 text-sm text-soil/70">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="rounded border-wheat/60 bg-card accent-forest"
          />
          Show removed
        </label>
      </div>

      <DataTable
        columns={[
          { header: 'Account', accessor: 'username', render: (u: AdminUser) => (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-forest/10 flex items-center justify-center text-forest font-display font-black text-xs">
                {String(u.username[0]).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold">{u.username}</div>
                <div className="text-xs text-soil/60">{u.email}</div>
              </div>
              {u.deletedAt && <Badge variant="destructive">Removed</Badge>}
            </div>
          )},
          { header: 'Role', accessor: 'role', render: (u: AdminUser) => (
            <Badge variant={u.role === 'seller' ? 'secondary' : 'default'}>{u.role}</Badge>
          ) },
          { header: 'Access', accessor: 'isAdmin', render: (u: AdminUser) => (
            u.isAdmin ? <Badge variant="secondary">Admin</Badge> : <span className="text-xs text-soil/50">Member</span>
          ) },
          { header: 'Created', accessor: 'createdAt', render: (u: AdminUser) => u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—' },
          { header: 'Actions', accessor: 'id', className: 'w-40', render: (u: AdminUser) => (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => openEdit(u)}>Edit</Button>
              {u.deletedAt ? (
                isAdmin && (
                  <button type="button" aria-label="Restore" className="h-8 px-2 rounded-md text-forest/70 hover:text-forest" onClick={() => restore.mutateAsync(u.id).catch(() => {})}>
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                )
              ) : isAdmin ? (
                <button type="button" aria-label="Remove" className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700" onClick={() => remove.mutateAsync(u.id).catch(() => {})}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) },
        ]}
        data={users}
        emptyMessage="No matching users."
      />

      <Dialog
        open={editing}
        onOpenChange={setEditing}
        title={isNew ? 'Create user' : 'Edit user'}
        description={isNew ? 'Register a new marketplace account (buyer or seller).' : 'Update this account. Leave the password blank to keep the current one.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={() => void handleSubmit(new Event('submit') as unknown as React.FormEvent)} disabled={(create.isPending || update.isPending)}>
              {create.isPending || update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {isNew ? 'Create' : 'Save'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Username</span>
            <Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Name</span>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Email</span>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </label>
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Role</span>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'seller' | 'buyer' }))}
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>
          {isAdmin && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAdmin}
                onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))}
                className="rounded border-wheat/60 bg-card accent-forest"
              />
              <span className="text-sm text-forest">Platform admin</span>
            </label>
          )}
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Password {isNew ? '(required)' : '(optional — leave blank to keep)'}</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={isNew} minLength={isNew ? 6 : undefined} placeholder={isNew ? undefined : '••••••••'} />
          </label>
        </form>
      </Dialog>
    </div>
  );
};

export default UsersPage;