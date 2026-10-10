import React, { useState } from 'react';
import { Button } from '../../presentation/components/ui/button';
import { Input } from '../../presentation/components/ui/input';
import { Badge } from '../../presentation/components/ui/badge';
import { Dialog } from '../../presentation/components/ui/dialog';
import { ConfirmDialog } from '../../presentation/components/ui/confirm';
import { Select } from '../../presentation/components/ui/select';
import { TextField } from '../../presentation/components/ui/textfield';
import { Trash2, UserPlus, RotateCw } from 'lucide-react';
import { DataTable } from '../../presentation/components/molecules/DataTable';
import { useAuthContext } from '../../application/providers/AuthProvider';
import { useAdminUsers, useAdminUserMutations } from '../../application/hooks/useAdminUsers';
import type { AdminUser, UserRole } from '../../domain/types/admin';

type UserForm = {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
};

type FieldErrors = {
  username?: string;
  email?: string;
  password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDuplicate(value: string, field: 'username' | 'email', users: AdminUser[], excludeId: number | null) {
  return users.some(
    (u) => u.id !== excludeId && u[field].toLowerCase() === value.toLowerCase()
  );
}

const UsersPage: React.FC = () => {
  const { token, isAdmin } = useAuthContext();
  const [query, setQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<UserForm>({ username: '', name: '', email: '', role: 'buyer', isAdmin: false });
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useAdminUsers(token, {
    q: query || undefined,
    includeDeleted: showDeleted || undefined,
  });
  const { create, update, remove, restore } = useAdminUserMutations(token);

  const openCreate = () => {
    setIsNew(true);
    setSelected(null);
    setForm({ username: '', name: '', email: '', role: 'buyer', isAdmin: false });
    setPassword('');
    setErrors({});
    setEditing(true);
  };

  const openEdit = (user: AdminUser) => {
    setIsNew(false);
    setSelected(user);
    setForm({ username: user.username, name: user.name, email: user.email, role: user.role, isAdmin: user.isAdmin });
    setPassword('');
    setErrors({});
    setEditing(true);
  };

  const validate = (target: Partial<UserForm & { password: string }>): FieldErrors => {
    const next: FieldErrors = {};
    const excludeId = selected?.id ?? null;

    if ('username' in target) {
      const value = (target.username ?? '').trim();
      if (!value) {
        next.username = 'Username is required.';
      } else if (value.length < 2) {
        next.username = 'Username must be at least 2 characters.';
      } else if (isDuplicate(value, 'username', users, excludeId)) {
        next.username = 'This username is already taken.';
      }
    }

    if ('email' in target) {
      const value = (target.email ?? '').trim().toLowerCase();
      if (!value) {
        next.email = 'Email is required.';
      } else if (!EMAIL_RE.test(value)) {
        next.email = 'Enter a valid email address.';
      } else if (isDuplicate(value, 'email', users, excludeId)) {
        next.email = 'This email is already registered.';
      }
    }

    if ('password' in target) {
      const value = target.password ?? '';
      if (isNew && !value.trim()) {
        next.password = 'Password is required for new accounts.';
      } else if (value.trim() && value.length < 6) {
        next.password = 'Password must be at least 6 characters.';
      }
    }

    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate({ username: form.username, email: form.email, password });
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (isNew && selected === null) {
      create.mutate(
        { ...form, isAdmin: form.isAdmin, password },
        { onSuccess: () => setEditing(false) }
      );
    } else if (selected) {
      const payload: Record<string, unknown> = { ...form, isAdmin: form.isAdmin };
      if (password.trim()) payload.password = password.trim();
      update.mutate({ id: selected.id, changes: payload }, { onSuccess: () => setEditing(false) });
    }
  };

  const handleFieldChange = (field: keyof UserForm | 'password', value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
    const target: Partial<UserForm & { password: string }> = { [field]: value };
    setErrors((prev) => ({ ...prev, ...validate(target) }));
  };

  const submitDisabled = create.isPending || update.isPending;

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
          {
            header: 'Account',
            accessor: 'username',
            render: (u: AdminUser) => (
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-forest/10 flex items-center justify-center text-forest font-display font-black text-xs">
                  {String(u.username[0]).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{u.username}</div>
                  <div className="text-xs text-soil/60">{u.email}</div>
                  <div className="mt-0.5 inline-flex">
                    <Badge variant={u.role === 'seller' ? 'secondary' : 'default'}>{u.role}</Badge>
                  </div>
                </div>
                {u.deletedAt && <Badge variant="destructive">Removed</Badge>}
              </div>
            ),
          },
          {
            header: 'Role',
            accessor: 'isAdmin',
            render: (u: AdminUser) => (
              u.isAdmin ? <Badge variant="secondary">Admin</Badge> : <Badge>Member</Badge>
            ),
          },
          {
            header: 'Created',
            accessor: 'createdAt',
            render: (u: AdminUser) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
          },
          {
            header: 'Actions',
            accessor: 'id',
            className: 'w-44',
            render: (u: AdminUser) => (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => openEdit(u)}>
                  Edit
                </Button>
                {u.deletedAt ? (
                  isAdmin && (
                    <button
                      type="button"
                      aria-label="Restore user"
                      className="h-8 px-2 rounded-md text-forest/70 hover:text-forest"
                      onClick={() => setRestoringId(u.id)}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                  )
                ) : isAdmin ? (
                  <button
                    type="button"
                    aria-label="Remove user"
                    className="h-8 px-2 rounded-md text-rose-600 hover:text-rose-700"
                    onClick={() => setRemovingId(u.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        data={users}
        loading={isLoading}
        error={isError ? new Error('Could not load data') : null}
        onRetry={refetch}
        getRowClassName={(u: AdminUser) => (u.deletedAt ? 'bg-honey/10' : undefined)}
        emptyMessage="No accounts yet."
        emptyAction={
          isAdmin ? (
            <Button variant="default" size="sm" onClick={openCreate}>
              <UserPlus className="h-4 w-4 mr-1.5" /> New user
            </Button>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={removingId !== null}
        onOpenChange={() => setRemovingId(null)}
        title="Remove user"
        description="This account becomes hidden and cannot log in. Shop owners must only remove accounts they own."
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
        title="Restore user"
        description="Bring this account back so it can log in and sell again."
        confirmText="Restore"
        confirmVariant="default"
        pending={restore.isPending}
        onConfirm={() => {
          if (restoringId !== null) restore.mutate(restoringId);
          setRestoringId(null);
        }}
      />

      <Dialog
        open={editing}
        onOpenChange={() => setEditing(false)}
        title={isNew ? 'Create user' : 'Edit user'}
        description={isNew ? 'Register a new marketplace account (buyer or seller).' : 'Update this account. Leave the password blank to keep the current one.'}
        footer={<Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => handleFieldChange('username', e.target.value)}
            error={errors.username}
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            hint={isNew ? undefined : 'Defaults to the username when left blank.'}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            error={errors.email}
          />
          <label className="block">
            <span className="text-xs font-display font-black uppercase tracking-wider text-soil/70">Role</span>
            <Select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              className="mt-1"
            >
              <option value="seller">Seller</option>
              <option value="buyer">Buyer</option>
            </Select>
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
          <TextField
            label={`Password ${isNew ? '(required)' : '(optional — leave blank to keep)'}`}
            type="password"
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            error={errors.password}
            placeholder={isNew ? undefined : '••••••••'}
          />
          <Button type="submit" disabled={submitDisabled} className="w-full">
            {isNew ? 'Create' : 'Save'}
          </Button>
        </form>
      </Dialog>
    </div>
  );
};

export default UsersPage;