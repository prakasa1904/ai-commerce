import pkg from 'sqlite3';

const { Database } = pkg;

const DB_PATH = process.env.DB_PATH || 'farmer_marketplace.db';
export const db = new Database(DB_PATH);

export const now = () => Date.now();

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function cb(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

function columnNames(table) {
  return all(`PRAGMA table_info(${table})`).then((rows) => rows.map((c) => c.name));
}

async function ensureColumn(table, column, definition) {
  const cols = await columnNames(table);
  if (cols.includes(column)) return;
  await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

export async function initSchema() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('seller','buyer')) NOT NULL DEFAULT 'buyer',
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER
  )`);

  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    imageUrl TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general',
    wholesale INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    stock INTEGER NOT NULL DEFAULT 0,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER
  )`);

  await run(`CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    employees TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER
  )`);

  await run(`CREATE TABLE IF NOT EXISTS shop_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT CHECK(role IN ('admin','non_admin')) NOT NULL DEFAULT 'non_admin',
    created_at INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER
  )`);

  await run(`CREATE TABLE IF NOT EXISTS shop_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price INTEGER,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER
  )`);

  await run(`CREATE INDEX IF NOT EXISTS idx_shop_members_user ON shop_members(user_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_shop_products_product ON shop_products(product_id)`);

  // --- Migrate legacy schemas -------------------------------------------------

  const usersCols = await columnNames('users');
  if (usersCols.includes('name') && !usersCols.includes('username')) {
    await run(`UPDATE users SET username = name`);
  }
  for (const [col, def] of [
    ['username', 'TEXT'],
    ['is_admin', 'INTEGER NOT NULL DEFAULT 0'],
    ['created_at', 'INTEGER NOT NULL DEFAULT 0'],
    ['updated_at', 'INTEGER NOT NULL DEFAULT 0'],
    ['deleted_at', 'INTEGER'],
  ]) {
    await ensureColumn('users', col, def);
  }

  const prodCols = await columnNames('products');
  if (prodCols.includes('sellerId') && !prodCols.includes('owner_id')) {
    await ensureColumn('products', 'owner_id', 'INTEGER NOT NULL DEFAULT 1 REFERENCES users(id)');
    await run(`UPDATE products SET owner_id = COALESCE(sellerId, 1)`);
    const users = await all(`SELECT id FROM users ORDER BY id LIMIT 1`);
    if (users.length) await run(`UPDATE products SET owner_id = COALESCE(sellerId, ?)`, [users[0].id]);
    await run(`ALTER TABLE products DROP COLUMN sellerId`);
  }
  for (const [col, def] of [
    ['owner_id', 'INTEGER NOT NULL DEFAULT 1 REFERENCES users(id)'],
    ['unit', "TEXT NOT NULL DEFAULT 'kg'"],
    ['stock', 'INTEGER NOT NULL DEFAULT 0'],
    ['created_at', 'INTEGER NOT NULL DEFAULT 0'],
    ['updated_at', 'INTEGER NOT NULL DEFAULT 0'],
    ['deleted_at', 'INTEGER'],
  ]) {
    await ensureColumn('products', col, def);
  }
  await run(`UPDATE products SET category = 'supplies' WHERE category = 'suplies'`);

  // Legacy plaintext passwords -> bcrypt
  const legacyUsers = await all(`SELECT id, password FROM users WHERE password NOT LIKE '$2%' AND password != ''`);
  for (const u of legacyUsers) {
    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.hashSync(u.password, 10);
    await run(`UPDATE users SET password = ? WHERE id = ?`, [hash, u.id]);
  }
}

export { run };