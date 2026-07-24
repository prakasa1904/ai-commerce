const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for dev convenience
app.use(cors());

// Simple body parsers for auth routes (not used yet)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB setup
const path = require('path');
let dbPath = process.env.DB_PATH || path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// --- Initialize schema & demo data (idempotent) ---
db.serialize(() => {
  console.log('Initializing database schema + demo data...');

  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
  );`);

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    imageUrl TEXT,
    sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
  );`);

  // Seed demo user (seller) if table empty
  db.get(`SELECT COUNT(*) AS cnt FROM users`, (err, row) => {
    if (err) {
      return console.error('DB error (users):', err);
    }
    if (row.cnt === 0) {
      console.log('Seeding demo seller...');
      const dummySellerStmt = db.prepare(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`);
      dummySellerStmt.run('Demo Seller', 'seller@example.com', 'demo123', 'seller', function (err) {
        if (err) {
          console.error('User seed error:', err);
          return;
        }
        console.log('Demo seller created with ID', this.lastID);
      });
      dummySellerStmt.finalize();
    }
  });

  // Seed demo products if table empty
  db.get(`SELECT COUNT(*) AS cnt FROM products`, (err, row) => {
    if (err) {
      return console.error('DB error (products):', err);
    }
    if (row.cnt === 0) {
      console.log('Seeding demo products...');
      const productStmt = db.prepare(`INSERT INTO products (title, description, price, imageUrl, sellerId) VALUES (?,?,?,?,?)`);
      const demoProducts = [
        ['Organic Rice A', '100% Java organic rice 5 kg', 15000, 'https://dummyimage.com/400x300/000/fff&text=Rice', 1],
        ['Fresh Tilapia', 'Bulk supply, live fish', 6000, 'https://dummyimage.com/400x300/000/fff&text=Tilapia', 1],
        ['Bio-Mulch', 'Organic soil fertilizer 10 kg', 12000, 'https://dummyimage.com/400x300/000/fff&text=Mulch', 1]
      ];
      demoProducts.forEach(p => {
        productStmt.run(...p, function (err) {
          if (err) {
            console.error('Product seed error:', err);
            return;
          }
          console.log('Inserted product ID', this.lastID);
        });
      });
      productStmt.finalize();
    } else {
      console.log('Products table already populated.');
    }
  });
});

// --- API endpoints ---
app.get('/api/auth/register', (req, res) => {
  res.json({ message: 'registration endpoint ready' });
});
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'login endpoint ready' });
});

// Products endpoint -- fetch demo products (bypass auth)
app.get('/api/products', (req, res) => {
  console.log('Fetching products...');
  const productsQuery = `
    SELECT p.id, p.title, p.description, p.price, p.imageUrl, p.sellerId
    FROM products p
  `;

  db.all(productsQuery, (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    const products = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      imageUrl: r.imageUrl,
      sellerName: 'Demo Seller',
      category: 'Demo'
    }));
    res.json({ count: products.length, products });
  });
});
// Catch-all for anything else (dev mode)
app.use((req, res) => {
  res.status(404).json({ error: 'Unknown route' });
});

// --- Server start ---
db.on('trace', console.log); // helpful debug
db.on('open', () => console.log('DB table schema loaded'))
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
