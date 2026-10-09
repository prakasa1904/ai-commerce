import type { AuthSession } from '../../domain/types/admin';

const API = '/api/auth';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const authApi = {
  register: (data: {
    username: string;
    name?: string;
    email: string;
    password: string;
    role?: 'seller' | 'buyer';
  }) => request<AuthSession>('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) =>
    request<AuthSession>('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<{ user: AuthSession['user']; shops: { id: number; name: string; ownerId: number }[] }>('/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
} as const;

export const tokenStorage = {
  key: 'farm_marketplace_token',
  get(): string | null {
    return localStorage.getItem(this.key);
  },
  set(token: string): void {
    localStorage.setItem(this.key, token);
  },
  remove(): void {
    localStorage.removeItem(this.key);
  },
} as const;