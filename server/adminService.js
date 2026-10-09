import { db, get, all, run, now } from './db.js';

const PUBLIC_USER_COLUMNS = `
  u.id AS "id",
  u.username AS "username",
  u.name AS "name",
  u.email AS "email",
  u.role AS "role",
  u.is_admin AS "isAdmin",
  u.created_at AS "createdAt",
  u.updated_at AS "updatedAt",
  u.deleted_at AS "deletedAt"
`;

export async function listUsers({ includeDeleted = false, q = '' } = {}) {
  const where = [`u.role IS NOT NULL`];
  if (!includeDeleted) where.push('u.deleted_at IS NULL');
  const params = [];
  if (q) {
    where.push('(u.username LIKE ? OR u.email LIKE ? OR u.name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const rows = await all(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users u WHERE ${where.join(' AND ')} ORDER BY u.id DESC`,
    params
  );
  return rows.map((r) => ({
    ...r,
    isAdmin: Boolean(r.isAdmin),
    deletedAt: r.deletedAt || null,
  }));
}

export async function getUser(id) {
  const row = await get(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`, [id]);
  return row ? { id: row.id, username: row.username || row.name, name: row.name, email: row.email, role: row.role, isAdmin: Boolean(row.is_admin) } : null;
}

export async function createUser({ username, name, email, password, role, isAdmin }) {
  const bcrypt = await import('bcryptjs');
  const ts = now();
  const result = await run(
    `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [username, name || username, email, bcrypt.hashSync(password, 10), role, isAdmin ? 1 : 0, ts, ts]
  );
  return getUser(result.lastID);
}

export async function updateUser(id, changes) {
  const allowed = ['username', 'name', 'email', 'role', 'isAdmin'];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in changes && changes[key] !== undefined) {
      const col = key === 'isAdmin' ? 'is_admin' : key;
      set.push(`${col} = ?`);
      params.push(key === 'isAdmin' ? (changes[key] ? 1 : 0) : changes[key]);
    }
  }
  if (!set.length) return getUser(id);
  params.push(now(), id);
  await run(`UPDATE users SET ${set.join(', ')}, updated_at = ? WHERE id = ?`, params);
  return getUser(id);
}

export async function softDeleteUser(id) {
  const ts = now();
  // Cascade soft-delete: shops, shop_products, products, memberships
  const shops = await all(`SELECT id FROM shops WHERE owner_id = ? AND deleted_at IS NULL`, [id]);
  for (const shop of shops) {
    await softDeleteShop(shop.id, ts);
  }
  await run(`UPDATE products SET deleted_at = ?, updated_at = ? WHERE owner_id = ? AND deleted_at IS NULL`, [ts, ts, id]);
  await run(`UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?`, [ts, ts, id]);
  await run(`UPDATE shop_members SET deleted_at = ? WHERE user_id = ? AND deleted_at IS NULL`, [ts, id]);
}

export async function restoreUser(id) {
  await run(`UPDATE users SET deleted_at = NULL, updated_at = ? WHERE id = ?`, [now(), id]);
}

export async function listShops({ includeDeleted = false, ownerId = null, q = '' } = {}) {
  const where = [];
  const params = [];
  if (ownerId !== null && ownerId !== undefined) {
    where.push('s.owner_id = ?');
    params.push(ownerId);
  }
  if (!includeDeleted) where.push('s.deleted_at IS NULL');
  if (q) {
    where.push('(s.name LIKE ? OR s.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  const rows = await all(
    `SELECT s.*, u.username AS "ownerUsername" FROM shops s
     JOIN users u ON u.id = s.owner_id
     WHERE ${where.length ? where.join(' AND ') : '1=1'}
     ORDER BY s.id DESC`,
    params
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    website: r.website,
    phone: r.phone,
    email: r.email,
    address: r.address,
    employees: r.employees,
    ownerId: r.owner_id,
    ownerUsername: r.ownerUsername,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at || null,
  }));
}

export async function getShop(id) {
  const row = await get(`SELECT s.*, u.username AS "ownerUsername" FROM shops s JOIN users u ON u.id = s.owner_id WHERE s.id = ? AND s.deleted_at IS NULL`, [id]);
  return row ? mapShop(row) : null;
}

function mapShop(r) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    website: r.website,
    phone: r.phone,
    email: r.email,
    address: r.address,
    employees: r.employees,
    ownerId: r.owner_id,
    ownerUsername: r.ownerUsername,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at || null,
  };
}

export async function createShop({ ownerId, ...fields }) {
  const ts = now();
  const result = await run(
    `INSERT INTO shops (owner_id, name, description, website, phone, email, address, employees, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ownerId, fields.name, fields.description || '', fields.website || '', fields.phone || '', fields.email || '', fields.address || '', fields.employees || '', ts, ts]
  );
  return getShop(result.lastID);
}

export async function updateShop(id, changes) {
  const allowed = ['name', 'description', 'website', 'phone', 'email', 'address', 'employees'];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in changes && changes[key] !== undefined) {
      set.push(`${key} = ?`);
      params.push(changes[key]);
    }
  }
  if (!set.length) return getShop(id);
  params.push(now(), id);
  await run(`UPDATE shops SET ${set.join(', ')}, updated_at = ? WHERE id = ?`, params);
  return getShop(id);
}

export async function softDeleteShop(id, tsArg) {
  const ts = tsArg || now();
  // Soft-delete memberships + product links first
  await run(`UPDATE shop_members SET deleted_at = ? WHERE shop_id = ? AND deleted_at IS NULL`, [ts, id]);
  await run(`UPDATE shop_products SET deleted_at = ? WHERE shop_id = ? AND deleted_at IS NULL`, [ts, id]);
  await run(`UPDATE shops SET deleted_at = ?, updated_at = ? WHERE id = ?`, [ts, ts, id]);
}

export async function restoreShop(id) {
  const ts = now();
  await run(`UPDATE shops SET deleted_at = NULL, updated_at = ? WHERE id = ?`, [ts, id]);
}

export async function getShopMembershipRole({ shopId, userId }) {
  const row = await get(
    `SELECT role, deleted_at FROM shop_members WHERE shop_id = ? AND user_id = ? AND deleted_at IS NULL`,
    [shopId, userId]
  );
  return row ? row.role : null;
}

export async function canManageShop({ shopId, userId, isPlatformAdmin }) {
  if (isPlatformAdmin) return true;
  const shop = await getShop(shopId);
  if (!shop) return false;
  if (shop.ownerId === userId) return true;
  const memberRole = await getShopMembershipRole({ shopId, userId });
  return memberRole === 'admin';
}

export async function canAccessShop({ shopId, userId, isPlatformAdmin }) {
  // Owner, platform admin, or any active member can read/update.
  if (isPlatformAdmin) return true;
  const shop = await getShop(shopId);
  if (!shop) return false;
  if (shop.ownerId === userId) return true;
  return Boolean(await getShopMembershipRole({ shopId, userId }));
}

export async function listMembersOfShop(shopId) {
  const rows = await all(
    `SELECT m.role, m.deleted_at AS "deletedAt", u.id AS "userId", u.username, u.name, u.email
     FROM shop_members m JOIN users u ON u.id = m.user_id
     WHERE m.shop_id = ? AND m.deleted_at IS NULL`,
    [shopId]
  );
  return rows.map((r) => ({ userId: r.userId, username: r.username || r.name, name: r.name, email: r.email, role: r.role, deletedAt: r.deletedAt || null }));
}

export async function addShopMember({ shopId, userId, role = 'non_admin' }) {
  const ts = now();
  const existing = await get(`SELECT id FROM shop_members WHERE shop_id = ? AND user_id = ? AND deleted_at IS NULL`, [shopId, userId]);
  if (existing) {
    await run(`UPDATE shop_members SET role = ?, deleted_at = NULL, created_at = ? WHERE id = ?`, [role, ts, existing.id]);
    return listMembersOfShop(shopId);
  }
  await run(`INSERT INTO shop_members (shop_id, user_id, role, created_at) VALUES (?, ?, ?, ?)`, [shopId, userId, role, ts]);
  return listMembersOfShop(shopId);
}

export async function updateShopMember({ shopId, userId, role }) {
  await run(`UPDATE shop_members SET role = ?, created_at = ? WHERE shop_id = ? AND user_id = ? AND deleted_at IS NULL`, [role, now(), shopId, userId]);
  return listMembersOfShop(shopId);
}

export async function removeShopMember({ shopId, userId, requesterRole }) {
  // Non-admin members cannot delete (soft-delete) membership or anything else.
  if (requesterRole !== 'admin') {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  const ts = now();
  await run(`UPDATE shop_members SET deleted_at = ? WHERE shop_id = ? AND user_id = ? AND deleted_at IS NULL`, [ts, shopId, userId]);
}

export async function listProductsAdmin({ includeDeleted = false, ownerId = null, q = '' } = {}) {
  const where = [];
  const params = [];
  if (ownerId !== null && ownerId !== undefined) {
    where.push('p.owner_id = ?');
    params.push(ownerId);
  }
  if (!includeDeleted) where.push('p.deleted_at IS NULL');
  if (q) {
    where.push('(p.title LIKE ? OR p.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  const rows = await all(
    `SELECT p.*, u.username AS "ownerUsername",
       (SELECT COUNT(*) FROM shop_products sp WHERE sp.product_id = p.id AND sp.deleted_at IS NULL) AS "shopCount"
     FROM products p JOIN users u ON u.id = p.owner_id
     WHERE ${where.length ? where.join(' AND ') : '1=1'}
     ORDER BY p.id DESC`,
    params
  );
  return rows.map(mapProduct);
}

function mapProduct(r) {
  return {
    id: r.id,
    title: r.title,
    name: r.title,
    description: r.description,
    price: r.price,
    imageUrl: r.imageUrl,
    category: r.category,
    wholesale: Boolean(r.wholesale),
    unit: r.unit,
    stock: r.stock,
    ownerId: r.owner_id,
    ownerUsername: r.ownerUsername,
    shopCount: r.shopCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    deletedAt: r.deleted_at || null,
  };
}

export async function getAdminProduct(id) {
  const row = await get(
    `SELECT p.*, u.username AS "ownerUsername"
     FROM products p JOIN users u ON u.id = p.owner_id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [id]
  );
  return row ? mapProduct(row) : null;
}

export async function createAdminProduct({ ownerId, ...fields }) {
  const ts = now();
  const result = await run(
    `INSERT INTO products (title, description, price, imageUrl, category, wholesale, unit, stock, owner_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fields.title, fields.description || '', fields.price || 0, fields.imageUrl || '', fields.category || 'general', fields.wholesale ? 1 : 0, fields.unit || 'kg', fields.stock || 0, ownerId, ts, ts]
  );
  return getAdminProduct(result.lastID);
}

export async function updateAdminProduct(id, changes) {
  const allowed = ['title', 'description', 'price', 'imageUrl', 'category', 'unit', 'stock', 'wholesale'];
  const set = [];
  const params = [];
  for (const key of allowed) {
    if (key in changes && changes[key] !== undefined) {
      const col = key === 'wholesale' ? 'wholesale' : key;
      set.push(`${col} = ?`);
      params.push(key === 'wholesale' ? (changes[key] ? 1 : 0) : changes[key]);
    }
  }
  if (!set.length) return getAdminProduct(id);
  params.push(now(), id);
  await run(`UPDATE products SET ${set.join(', ')}, updated_at = ? WHERE id = ?`, params);
  return getAdminProduct(id);
}

export async function softDeleteProduct(id) {
  const ts = now();
  await run(`UPDATE shop_products SET deleted_at = ? WHERE product_id = ? AND deleted_at IS NULL`, [ts, id]);
  await run(`UPDATE products SET deleted_at = ?, updated_at = ? WHERE id = ?`, [ts, ts, id]);
}

export async function restoreProduct(id) {
  const ts = now();
  await run(`UPDATE products SET deleted_at = NULL, updated_at = ? WHERE id = ?`, [ts, id]);
}

export async function listProductShops(productId) {
  const rows = await all(
    `SELECT sp.shop_id AS "shopId", sp.price, sp.stock,
       s.name AS "shopName", s.owner_id AS "ownerId"
     FROM shop_products sp JOIN shops s ON s.id = sp.shop_id
     WHERE sp.product_id = ? AND sp.deleted_at IS NULL AND s.deleted_at IS NULL`,
    [productId]
  );
  return rows.map((r) => ({
    shopId: r.shopId,
    shopName: r.shopName,
    ownerId: r.ownerId,
    price: r.price,
    stock: r.stock,
  }));
}

export async function listProductsInShop(shopId) {
  const rows = await all(
    `SELECT p.id AS "productId", p.title AS "productName", sp.price, sp.stock
     FROM shop_products sp JOIN products p ON p.id = sp.product_id
     WHERE sp.shop_id = ? AND sp.deleted_at IS NULL AND p.deleted_at IS NULL
     ORDER BY p.id DESC`,
    [shopId]
  );
  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    price: r.price,
    stock: r.stock,
  }));
}

export async function linkProductToShop({ productId, shopId, price, stock }) {
  const ts = now();
  const existing = await get(`SELECT id, price, stock FROM shop_products WHERE product_id = ? AND shop_id = ? AND deleted_at IS NULL`, [productId, shopId]);
  if (existing) {
    await run(`UPDATE shop_products SET price = ?, stock = ?, deleted_at = NULL WHERE id = ?`, [price ?? null, stock ?? 0, existing.id]);
  } else {
    await run(`INSERT INTO shop_products (shop_id, product_id, price, stock, created_at) VALUES (?, ?, ?, ?, ?)`, [shopId, productId, price ?? null, stock ?? 0, ts]);
  }
}

export async function unlinkProductFromShop({ productId, shopId }) {
  const ts = now();
  await run(`UPDATE shop_products SET deleted_at = ? WHERE product_id = ? AND shop_id = ? AND deleted_at IS NULL`, [ts, productId, shopId]);
}

export async function getAdminStats() {
  const [users, activeUsers, shops, products, deletedUsers, deletedShops, deletedProducts] = await Promise.all([
    all(`SELECT COUNT(*) AS n FROM users`),
    all(`SELECT COUNT(*) AS n FROM users WHERE deleted_at IS NULL`),
    all(`SELECT COUNT(*) AS n FROM shops`),
    all(`SELECT COUNT(*) AS n FROM products`),
    all(`SELECT COUNT(*) AS n FROM users WHERE deleted_at IS NOT NULL`),
    all(`SELECT COUNT(*) AS n FROM shops WHERE deleted_at IS NOT NULL`),
    all(`SELECT COUNT(*) AS n FROM products WHERE deleted_at IS NOT NULL`),
  ]);
  return {
    users: users[0].n,
    activeUsers: activeUsers[0].n,
    shops: shops[0].n,
    products: products[0].n,
    deletedUsers: deletedUsers[0].n,
    deletedShops: deletedShops[0].n,
    deletedProducts: deletedProducts[0].n,
  };
}