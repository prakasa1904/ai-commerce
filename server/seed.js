const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// DB path fallback if .env not set
const dbPath = process.env.DB_PATH || 'farm.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create tables if they don't exist (copies initDB logic)
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
    sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
  );`);

  // Seed demo products **only** if table is empty
  db.get(`SELECT COUNT(*) as cnt FROM products`, (err, row) => {
    if (err) return console.error('DB error:', err);
    if (row.cnt > 0) return console.log('Products already seeded.');

    console.log('Seeding demo products...');

    const demoProducts = [
      {
        title: 'Organic Rice A',
        description: '100% Java organic rice 5 kg',
        price: 15000,
        imageUrl: 'https://dummyimage.com/400x300/000/fff&text=Rice',
        sellerId: 1 // dummy seller – row will be created below
      },
      {
        title: 'Fresh Tilapia',
        description: 'Bulk supply, live fish',
        price: 6000,
        imageUrl: 'https://dummyimage.com/400x300/000/fff&text=Tilapia',
        sellerId: 1
      },
      {
        title: 'Bio-Mulch',
        description: 'Organic soil fertilizer 10 kg',
        price: 12000,
        imageUrl: 'https://dummyimage.com/400x300/000/fff&text=Mulch',
        sellerId: 1
      },
    ];

    // Create a dummy seller if users table empty
    db.get(`SELECT COUNT(*) as cnt FROM users`, (err, row) => {
      if (err) return console.error('DB error:', err);
      if (row.cnt === 0) {
        db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`,
          ['Demo Seller', 'seller@example.com', 'demo123', 'seller'],
          function (err) {
            if (err) return console.error('Seed user error:', err);
            console.log('Demo seller created with ID', this.lastID);
            demoProducts.forEach(p => p.sellerId = this.lastID);
            insertProducts(demoProducts);
          });
      } else {
        // use first user as seller
        db.get(`SELECT id FROM users LIMIT 1`, (err, row) => {
          if (err) return console.error('DB error:', err);
          demoProducts.forEach(p => p.sellerId = row.id);
          insertProducts(demoProducts);
        });
      }
    });

    const insertProducts = (items) => {
      const stmt = db.prepare(`INSERT INTO products (title,description,price,imageUrl,sellerId) VALUES (?,?,?,?,?)`);
      for (const item of items) {
        stmt.run(
          item.title,
          item.description,
          item.price,
          item.imageUrl,
          item.sellerId,
          function (err) {
            if (err) return console.error('Seed product error:', err);
            console.log('Inserted product ID', this.lastID);
          }
        );
      }
      stmt.finalize();
      console.log('Demo products seeded.');
    };
  });
});
