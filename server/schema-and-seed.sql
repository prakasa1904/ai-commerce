-- SQLite schema & demo data for the farm marketplace backend

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  imageUrl TEXT,
  sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- SEED DEMO SELLER (sellerId=1)
INSERT OR IGNORE INTO users (name,email,password,role) VALUES ('Demo Seller','seller@example.com','demo123','seller');

-- SEED DEMO PRODUCTS (use last_insert_rowid if seller not inserted, otherwise assume sellerId 1)
INSERT OR IGNORE INTO products (title, description, price, imageUrl, sellerId) VALUES
  ('Organic Rice A', '100% Java organic rice 5 kg', 15000, 'https://dummyimage.com/400x300/000/fff&text=Rice', (SELECT id FROM users WHERE role='seller' LIMIT 1)),
  ('Fresh Tilapia', 'Bulk supply, live fish', 6000, 'https://dummyimage.com/400x300/000/fff&text=Tilapia', (SELECT id FROM users WHERE role='seller' LIMIT 1)),
  ('Bio-Mulch', 'Organic soil fertilizer 10 kg', 12000, 'https://dummyimage.com/400x300/000/fff&text=Mulch', (SELECT id FROM users WHERE role='seller' LIMIT 1));
