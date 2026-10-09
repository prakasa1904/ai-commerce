import type {
  AdminProduct,
  AdminShop,
  AdminStats,
  AdminUser,
  ProductShopLink,
  ShopMember,
} from '../../domain/types/admin';

const API = '/api/admin';

interface JwtUser {
  id: number;
  username: string;
  email: string;
  role: 'seller' | 'buyer';
  isAdmin: boolean;
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function del(token: string, path: string) {
  const res = await fetch(`${API}${path}`, { method: 'DELETE', headers: headers(token) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Delete failed: ${res.status}`);
  }
  return res.json();
}

export interface AdminUsersResponse {
  count: number;
  users: AdminUser[];
}

export interface AdminShopsResponse {
  count: number;
  shops: AdminShop[];
}

export interface AdminProductsResponse {
  count: number;
  products: AdminProduct[];
}

export const adminApi = {
  stats: (token: string) =>
    fetch(`${API}/stats`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Stats fetch failed');
      return res.json() as Promise<AdminStats>;
    }),

  listUsers: (token: string, opts?: { q?: string; includeDeleted?: boolean }) =>
    fetch(`${API}/users${toQuery(opts)}`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Users fetch failed');
      return res.json() as Promise<AdminUsersResponse>;
    }),

  createUser: (token: string, body: { username: string; name?: string; email: string; password: string; role?: 'seller' | 'buyer'; isAdmin?: boolean }) =>
    fetch(`${API}/users`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Create user failed')));
      return res.json() as Promise<{ user: AdminUser }>;
    }),

  updateUser: (token: string, id: number, body: Partial<AdminUser>) =>
    fetch(`${API}/users/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Update user failed')));
      return res.json() as Promise<{ user: AdminUser }>;
    }),

  deleteUser: (token: string, id: number) => del(token, `/users/${id}`),
  restoreUser: (token: string, id: number) =>
    fetch(`${API}/users/${id}/restore`, { method: 'POST', headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Restore failed');
      return res.json();
    }),

  listShops: (token: string, opts?: { q?: string; includeDeleted?: boolean }) =>
    fetch(`${API}/shops${toQuery(opts)}`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Shops fetch failed');
      return res.json() as Promise<AdminShopsResponse>;
    }),

  createShop: (token: string, body: {
    name?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    employees?: string;
  }) =>
    fetch(`${API}/shops`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Create shop failed')));
      return res.json() as Promise<{ shop: AdminShop }>;
    }),

  updateShop: (token: string, id: number, body: Partial<Omit<AdminShop, 'id' | 'ownerId' | 'ownerUsername' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) =>
    fetch(`${API}/shops/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Update shop failed')));
      return res.json() as Promise<{ shop: AdminShop }>;
    }),

  deleteShop: (token: string, id: number) => del(token, `/shops/${id}`),
  restoreShop: (token: string, id: number) =>
    fetch(`${API}/shops/${id}/restore`, { method: 'POST', headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Restore failed');
      return res.json();
    }),

  getShopMembers: (token: string, shopId: number) =>
    fetch(`${API}/shops/${shopId}/members`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Members fetch failed');
      return res.json() as Promise<{ members: ShopMember[] }>;
    }),

  addMember: (token: string, shopId: number, body: { userId: number; role: 'admin' | 'non_admin' }) =>
    fetch(`${API}/shops/${shopId}/members`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Add member failed')));
      return res.json() as Promise<{ members: ShopMember[] }>;
    }),

  updateMember: (token: string, shopId: number, userId: number, body: { role: 'admin' | 'non_admin' }) =>
    fetch(`${API}/shops/${shopId}/members/${userId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Update member failed')));
      return res.json() as Promise<{ members: ShopMember[] }>;
    }),

  removeMember: (token: string, shopId: number, userId: number) => del(token, `/shops/${shopId}/members/${userId}`),

  listProducts: (token: string, opts?: { q?: string; includeDeleted?: boolean }) =>
    fetch(`${API}/products${toQuery(opts)}`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Products fetch failed');
      return res.json() as Promise<AdminProductsResponse>;
    }),

  createProduct: (token: string, body: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    category?: string;
    unit?: string;
    stock?: number;
    wholesale?: boolean;
  }) =>
    fetch(`${API}/products`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Create product failed')));
      return res.json() as Promise<{ product: AdminProduct }>;
    }),

  updateProduct: (token: string, id: number, body: Partial<Omit<AdminProduct, 'id' | 'name' | 'ownerId' | 'ownerUsername' | 'shopCount' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) =>
    fetch(`${API}/products/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Update product failed')));
      return res.json() as Promise<{ product: AdminProduct }>;
    }),

  deleteProduct: (token: string, id: number) => del(token, `/products/${id}`),
  restoreProduct: (token: string, id: number) =>
    fetch(`${API}/products/${id}/restore`, { method: 'POST', headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Restore failed');
      return res.json();
    }),

  listProductShops: (token: string, productId: number) =>
    fetch(`${API}/products/${productId}/shops`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Product shops fetch failed');
      return res.json() as Promise<{ shops: ProductShopLink[] }>;
    }),

  listShopProducts: (token: string, shopId: number) =>
    fetch(`${API}/shops/${shopId}/products`, { headers: headers(token) }).then((res) => {
      if (!res.ok) throw new Error('Shop products fetch failed');
      return res.json() as Promise<{
        products: { productId: number; productName: string; price: number | null; stock: number }[];
      }>;
    }),

  linkProductToShop: (token: string, productId: number, shopId: number, body: { price?: number; stock?: number }) =>
    fetch(`${API}/products/${productId}/shops`, { method: 'POST', headers: headers(token), body: JSON.stringify({ shopId, ...body }) }).then((res) => {
      if (!res.ok) return res.json().then((b) => Promise.reject(new Error(b.error || 'Link failed')));
      return res.json();
    }),

  unlinkProductFromShop: (token: string, productId: number, shopId: number) =>
    del(token, `/products/${productId}/shops/${shopId}`),

  currentUser: (token: string) => ({
    id: getFromToken(token, 'id'),
    username: getFromToken(token, 'username'),
    email: getFromToken(token, 'email'),
    role: getFromToken(token, 'role'),
    isAdmin: getFromToken(token, 'isAdmin'),
  } as JwtUser),
} as const;

function toQuery(opts?: { q?: string; includeDeleted?: boolean }) {
  const params = new URLSearchParams();
  if (opts?.q) params.set('q', opts.q);
  if (opts?.includeDeleted) params.set('includeDeleted', '1');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function getFromToken(token: string, claim: string): unknown {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload[claim];
  } catch {
    return null;
  }
}