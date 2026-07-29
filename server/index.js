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
      sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
    )`);
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
        db.run(`INSERT INTO products (title,description,price,imageUrl,sellerId) VALUES (?,?,?,?,?)`, 
        ['Organic Rice A', '100% Java organic rice 5 kg', 15000, 'https://dummyimage.com/400x300/000/fff&text=Rice', 1]);
        db.run(`INSERT INTO products (title,description,price,imageUrl,sellerId) VALUES (?,?,?,?,?)`, 
        ['Fresh Tilapia', 'Bulk supply, live fish', 6000, 'https://dummyimage.com/400x300/000/fff&text=Tilapia', 1]);
        db.run(`INSERT INTO products (title,description,price,imageUrl,sellerId) VALUES (?,?,?,?,?)`, 
        ['Bio-Mulch', 'Organic soil fertilizer 10 kg', 12000, 'https://dummyimage.com/400x300/000/fff&text=Mulch', 1]);
      }
    });
  });
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
  db.all(`SELECT p.id, p.title, p.description, p.price, p.imageUrl, p.sellerId
          FROM products p`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
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

app.get('/api/cart', (req, res) => {
  res.json({ items: [] });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
