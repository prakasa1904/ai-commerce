import pkg from 'sqlite3';
import 'dotenv/config';

const { Database } = pkg;

const dbPath = process.env.DB_PATH || 'farmer_marketplace.db';
const db = new Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    imageUrl TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    wholesale INTEGER NOT NULL DEFAULT 0,
    sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
  );`);

  db.get(`SELECT COUNT(*) as cnt FROM products`, (err, row) => {
    if (err) return console.error('DB error:', err);
    if (row.cnt > 0) return console.log(`Products already seeded (${row.cnt} rows).`);

    console.log('Seeding demo products...');

    const demos = [
      ['Organic Tomatoes', 'Field-ripened heirloom tomatoes, 1 kg', 25000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Tomatoes', 'vegetables', 1],
      ['Fresh Strawberries', 'Sweet local strawberries, 250 g', 50000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Strawberries', 'fruits', 1],
      ['Premium Rice', '100% Java organic rice, 5 kg', 15000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Rice', 'grains', 0],
      ['Fresh Milk', 'Farm-fresh whole milk, 1 L', 18000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Milk', 'dairy', 0],
      ['Grass-Fed Eggs', 'Free-range eggs, tray of 12', 22000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Eggs', 'dairy', 1],
      ['Green Spinach', 'Fresh baby spinach bunch, 200 g', 12000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Spinach', 'vegetables', 0],
      ['Banana Bunch', 'Ripe plantain bananas, 1 kg', 15000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Bananas', 'fruits', 1],
      ['Organic Fertilizer', 'Bio-compost soil conditioner, 10 kg', 80000, 'https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Fertilizer', 'supplies', 1],
    ];

    db.get(`SELECT id FROM users WHERE role='seller' LIMIT 1`, (err, row) => {
      if (err) return console.error('DB error:', err);
      const sellerId = row ? row.id : 1;
      const stmt = db.prepare(`INSERT INTO products (title,description,price,imageUrl,category,wholesale,sellerId) VALUES (?,?,?,?,?,?,?)`);
      demos.forEach((d) => stmt.run(...d.concat(sellerId)));
      stmt.finalize((err) => {
        if (err) return console.error('Seed error:', err);
        console.log(`Demo products seeded (${demos.length} rows).`);
        db.close();
      });
    });
  });
});