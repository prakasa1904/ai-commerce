import express from 'express';
import cors from 'cors';
import pkg from 'sqlite3';
const { verbose: sqlite3Verbose, Database } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Database(process.env.DB_PATH || 'farmer_marketplace.db');

// Initialize DB
function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      imageUrl TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      wholesale INTEGER NOT NULL DEFAULT 0,
      sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
    )`);
    db.all(`PRAGMA table_info(products)`, (_err, rows) => {
      const cols = (rows || []).map((c) => c.name);
      if (!cols.includes('category')) {
        db.run(`ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT 'general'`);
      }
      if (!cols.includes('wholesale')) {
        db.run(`ALTER TABLE products ADD COLUMN wholesale INTEGER NOT NULL DEFAULT 0`);
      }
    });
    db.get(`SELECT COUNT(*) AS cnt FROM users`, (err, row) => {
      if (err) return;
      if (row.cnt === 0) {
        db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`, 
        ['Demo Seller', 'seller@example.com', 'demo123', 'seller']);
      }
    });
    db.get(`SELECT COUNT(*) AS cnt FROM products`, (err, row) => {
      if (err) return;
      if (row.cnt === 0) {
        seedProducts();
      }
    });
  });
}

function seedProducts() {
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
  const stmt = db.prepare(`INSERT INTO products (title,description,price,imageUrl,category,wholesale,sellerId) VALUES (?,?,?,?,?,?,?)`);
  demos.forEach((d) => stmt.run(...d));
  stmt.finalize(() => console.log('Seeded 8 demo products.'));
}

initDB();

// API Routes
app.get('/api/auth/register', (req, res) => {
  res.json({ message: 'registration endpoint ready' });
});
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'login endpoint ready' });
});

app.get('/api/products', (req, res) => {
  db.all(`SELECT p.id, p.title, p.description, p.price, p.imageUrl, p.category, p.wholesale
          FROM products p`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const products = rows.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      price: r.price,
      imageUrl: r.imageUrl,
      category: r.category,
      wholesale: Boolean(r.wholesale),
    }));
    res.json({ count: products.length, products });
  });
});

app.get('/api/cart', (req, res) => {
  res.json({ items: [] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));