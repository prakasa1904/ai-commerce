import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema, get, all, db, now } from './db.js';
import { authRouter } from './auth.js';
import { adminRouter } from './adminRoutes.js';
import { DEMO_PRODUCTS } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// Public catalog (excludes soft-deleted products)
app.get('/api/products', async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, title, description, price, imageUrl, category, wholesale
       FROM products WHERE deleted_at IS NULL`
    );
    const products = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      imageUrl: r.imageUrl,
      category: r.category,
      wholesale: Boolean(r.wholesale),
    }));
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cart', (req, res) => {
  res.json({ items: [] });
});

initSchema()
  .then(async () => {
    // Seed a demo seller when the users table is empty.
    const count = await get(`SELECT COUNT(*) AS cnt FROM users`);
    if (count.cnt === 0) {
      const { hashPassword } = await import('./auth.js');
      const result = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          ['demoseller', 'Demo Seller', 'seller@example.com', hashPassword('demo123'), 'seller', now(), now()],
          function cb(err) { err ? reject(err) : resolve(this); }
        );
      });
      // Seed a demo buyer.
      const buyer = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
          ['demobuyer', 'Demo Buyer', 'buyer@example.com', hashPassword('demo123'), 'buyer', now(), now()],
          function cb(err) { err ? reject(err) : resolve(this); }
        );
      });
      const ts = now();
      const sellerId = result.lastID;
      // Seed demo products.
      const stmt = db.prepare(
        `INSERT INTO products (title, description, price, imageUrl, category, wholesale, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      for (const p of DEMO_PRODUCTS) {
        stmt.run(p.title, p.description, p.price, p.imageUrl, p.category, p.wholesale, sellerId, ts, ts);
      }
      stmt.finalize();

      // Two demo shops for the seller.
      const { run: dbRun } = await import('./db.js');
      const shop1 = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO shops (owner_id, name, description, website, phone, email, address, employees, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sellerId, 'Dawn Orchard', 'Hilltop fruit stall, open at dawn.', 'https://dawnoorchard.example', '0812-3456-7890', 'hello@dawnoorchard.example', 'Jl. Puncak No. 12, Desa Suka Maju, 55361', '3', ts, ts],
          function cb(err) { err ? reject(err) : resolve(this); }
        );
      });
      const shop2 = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO shops (owner_id, name, description, website, phone, email, address, employees, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sellerId, 'Valley Greens', 'River-valley greens and dairy, cut to order.', 'https://valleygreens.example', '0812-5555-1212', 'orders@valleygreens.example', 'Jl. Sungai no. 8, Desa Sejahtera, 55121', '2', ts, ts],
          function cb(err) { err ? reject(err) : resolve(this); }
        );
      });
      // Link products to the two shops.
      dbRun(
        `INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
         SELECT ?, id, NULL, 25, ? FROM products WHERE owner_id = ?`,
        [shop1.lastID, ts, sellerId]
      );
      dbRun(
        `INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
         SELECT ?, id, NULL, 40, ? FROM products WHERE owner_id = ? AND category IN ('dairy','grains')`,
        [shop2.lastID, ts, sellerId]
      );
      // Invite the demo buyer to the first shop as a non-admin member.
      const uCount = await get(`SELECT id FROM users WHERE username = 'demobuyer'`);
      if (uCount) {
        dbRun(
          `INSERT INTO shop_members (shop_id, user_id, role, created_at) VALUES (?, ?, 'non_admin', ?)`,
          [shop1.lastID, uCount.id, ts]
        );
      }
      console.log('Seeded demo seller, buyer, shops and product links.');
    }
  })
  .catch((err) => {
    console.error('DB init failed:', err);
  });

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));