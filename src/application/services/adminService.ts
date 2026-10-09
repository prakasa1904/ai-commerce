import { adminApi } from '../../infrastructure/api/adminApi';
import type { AdminUser } from '../../domain/types/admin';

type ShopInput = {
  name?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  employees?: string;
};

type ProductInput = {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  unit?: string;
  stock?: number;
  wholesale?: boolean;
};

export const adminService = {
  getStats: (token: string) => adminApi.stats(token),

  getUsers: (token: string, filters?: { q?: string; includeDeleted?: boolean }) =>
    adminApi.listUsers(token, filters).then((r) => r.users),

  createUser: (token: string, data: {
    username: string;
    name?: string;
    email: string;
    password: string;
    role?: 'seller' | 'buyer';
    isAdmin?: boolean;
  }) => adminApi.createUser(token, data).then((r) => r.user),

  updateUser: (token: string, id: number, data: Partial<AdminUser>) =>
    adminApi.updateUser(token, id, data).then((r) => r.user),

  deleteUser: (token: string, id: number) => adminApi.deleteUser(token, id),
  restoreUser: (token: string, id: number) => adminApi.restoreUser(token, id),

  getShops: (token: string, filters?: { q?: string; includeDeleted?: boolean }) =>
    adminApi.listShops(token, filters).then((r) => r.shops),

  createShop: (token: string, data: ShopInput) =>
    adminApi.createShop(token, data).then((r) => r.shop),

  updateShop: (token: string, id: number, data: Partial<ShopInput>) =>
    adminApi.updateShop(token, id, data).then((r) => r.shop),

  deleteShop: (token: string, id: number) => adminApi.deleteShop(token, id),
  restoreShop: (token: string, id: number) => adminApi.restoreShop(token, id),

  getShopMembers: (token: string, shopId: number) => adminApi.getShopMembers(token, shopId).then((r) => r.members),
  addMember: (token: string, shopId: number, data: { userId: number; role: 'admin' | 'non_admin' }) =>
    adminApi.addMember(token, shopId, data).then((r) => r.members),

  updateMember: (token: string, shopId: number, userId: number, data: { role: 'admin' | 'non_admin' }) =>
    adminApi.updateMember(token, shopId, userId, data).then((r) => r.members),

  getShopProducts: (token: string, shopId: number) => adminApi.listShopProducts(token, shopId).then((r) => r.products),

  removeMember: (token: string, shopId: number, userId: number) => adminApi.removeMember(token, shopId, userId),

  getProducts: (token: string, filters?: { q?: string; includeDeleted?: boolean }) =>
    adminApi.listProducts(token, filters).then((r) => r.products),

  createProduct: (token: string, data: ProductInput) =>
    adminApi.createProduct(token, data).then((r) => r.product),

  updateProduct: (token: string, id: number, data: Partial<ProductInput>) =>
    adminApi.updateProduct(token, id, data).then((r) => r.product),

  deleteProduct: (token: string, id: number) => adminApi.deleteProduct(token, id),
  restoreProduct: (token: string, id: number) => adminApi.restoreProduct(token, id),

  getProductShops: (token: string, productId: number) =>
    adminApi.listProductShops(token, productId).then((r) => r.shops),

  linkProductToShop: (token: string, productId: number, shopId: number, data: { price?: number; stock?: number }) =>
    adminApi.linkProductToShop(token, productId, shopId, data),

  unlinkProductFromShop: (token: string, productId: number, shopId: number) =>
    adminApi.unlinkProductFromShop(token, productId, shopId),
} as const;