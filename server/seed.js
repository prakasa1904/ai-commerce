import 'dotenv/config';
import { initSchema, get, all, run, now } from './db.js';
import { DEMO_PRODUCTS } from './seedData.js';
import { hashPassword } from './auth.js';

async function seed() {
  await initSchema();

  const userCount = (await get(`SELECT COUNT(*) AS cnt FROM users`)).cnt;

  let sellerId;
  if (userCount === 0) {
    const seller = await run(
      `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      ['demoseller', 'Demo Seller', 'seller@example.com', hashPassword('demo123'), 'seller', now(), now()]
    );
    sellerId = seller.lastID;

    await run(
      `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      ['demobuyer', 'Demo Buyer', 'buyer@example.com', hashPassword('demo123'), 'buyer', now(), now()]
    );

    const ts = now();
    for (const p of DEMO_PRODUCTS) {
      await run(
        `INSERT INTO products (title, description, price, imageUrl, category, wholesale, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.description, p.price, p.imageUrl, p.category, p.wholesale, sellerId, ts, ts]
      );
    }

    const shop1 = await run(
      `INSERT INTO shops (owner_id, name, description, website, phone, email, address, employees, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sellerId, 'Dawn Orchard', 'Hilltop fruit stall, open at dawn.', 'https://dawnoorchard.example', '0812-3456-7890', 'hello@dawnoorchard.example', 'Jl. Puncak No. 12, Desa Suka Maju, 55361', '3', ts, ts]
    );
    const shop2 = await run(
      `INSERT INTO shops (owner_id, name, description, website, phone, email, address, employees, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sellerId, 'Valley Greens', 'River-valley greens and dairy, cut to order.', 'https://valleygreens.example', '0812-5555-1212', 'orders@valleygreens.example', 'Jl. Sungai no. 8, Desa Sejahtera, 55121', '2', ts, ts]
    );

    await run(
      `INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
       SELECT ?, id, NULL, 25, ? FROM products WHERE owner_id = ?`,
      [shop1.lastID, ts, sellerId]
    );
    await run(
      `INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
       SELECT ?, id, NULL, 40, ? FROM products WHERE owner_id = ? AND category IN ('dairy','grains')`,
      [shop2.lastID, ts, sellerId]
    );

    const buyer = await get(`SELECT id FROM users WHERE username = 'demobuyer'`);
    if (buyer) {
      await run(`INSERT INTO shop_members (shop_id, user_id, role, created_at) VALUES (?, ?, 'non_admin', ?)`,
        [shop1.lastID, buyer.id, ts]);
    }
    console.log('Seeded demo seller, buyer, shops and product links.');
  } else {
    // Existing database — still ensure an admin account exists for the admin area.
    const admin = await get(`SELECT id FROM users WHERE role = 'seller' AND is_admin = 0 LIMIT 1`);
    const seedRows = await all(`SELECT COUNT(*) AS cnt FROM (SELECT 1 FROM shops WHERE deleted_at IS NULL) AS s`);
    if (!admin && seedRows[0].cnt === 0) {
      const ts = now();
      const inserted = await run(
        `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        ['demoseller', 'Demo Seller', 'seller@example.com', hashPassword('demo123'), 'seller', ts, ts]
      );
      sellerId = inserted.lastID;
      console.log(`Seeded demo seller (id=${sellerId}) into existing database.`);
    }
    return;
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});