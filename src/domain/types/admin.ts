export type UserRole = 'seller' | 'buyer';

export type MembershipRole = 'admin' | 'non_admin';

export type AdminUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: number | null;
  updatedAt: number | null;
  deletedAt: number | null;
};

export type AdminShop = {
  id: number;
  name: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  employees: string;
  ownerId: number;
  ownerUsername: string;
  createdAt: number | null;
  updatedAt: number | null;
  deletedAt: number | null;
};

export type ShopMember = {
  userId: number;
  username: string;
  name: string;
  email: string;
  role: MembershipRole;
  deletedAt: number | null;
};

export type AdminProduct = {
  id: number;
  title: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  wholesale: boolean;
  unit: string;
  stock: number;
  ownerId: number;
  ownerUsername: string;
  shopCount: number;
  createdAt: number | null;
  updatedAt: number | null;
  deletedAt: number | null;
};

export type ProductShopLink = {
  shopId: number;
  shopName: string;
  ownerId: number;
  price: number | null;
  stock: number;
};

export type AdminStats = {
  users: number;
  activeUsers: number;
  shops: number;
  products: number;
  deletedUsers: number;
  deletedShops: number;
  deletedProducts: number;
};

export type AdminLoginResponse = {
  user: Omit<AdminUser, 'createdAt' | 'updatedAt' | 'deletedAt' | 'name'> & { name: string };
  token: string;
};

export type AuthSession = {
  user: AdminUser;
  token: string;
};