const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database(process.env.DB_PATH || 'farmer_marketplace.db');

// Initialize DB
function initDB() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('seller','buyer')) DEFAULT 'buyer'
      );
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        imageUrl TEXT,
        sellerId INTEGER REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  });
  console.log('DB initialized');
}

// Basic auth
app.post('/api/auth/register', async (req, res) => {
  const {name,email,password,role='buyer'} = req.body;
  const hash = await bcrypt.hash(password,10);
  db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`, 
    [name,email,hash,role],
    function(err) {
      if(err) return res.status(400).json(err);
      res.json({id:this.lastID});
    }
  );
});

app.post('/api/auth/login', async (req,res)=>{
  const {email,password} = req.body;
  db.get(`SELECT * FROM users WHERE email=?`, [email], async (err,row)=>{
    if(err||!row) return res.status(400).json({error:'Invalid credentials'});
    const match = await bcrypt.compare(password,row.password);
    if(!match) return res.status(400).json({error:'Invalid credentials'});
    const token = jwt.sign({id:row.id,role:row.role}, process.env.JWT_SECRET, {expiresIn:'1d'});
    res.json({token, user:{id:row.id,name:row.name,email:row.email,role:row.role}});
  });
});

// Products API (seller CRUD + buyer view)
app.get('/api/products', (req,res)=>{
  db.all(`SELECT p.id, p.title, p.price, p.imageUrl, u.name as sellerName FROM products p JOIN users u ON p.sellerId=u.id`, [], (err,rows)=>{
    if(err) return res.status(400).json(err);
    res.json(rows);
  });
});

app.post('/api/products', async (req,res)=>{
  const {title,description,price,imageUrl} = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({error:'No auth'});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const stmt = db.prepare(`INSERT INTO products (title,description,price,imageUrl,sellerId) VALUES (?,?,?,?,?)`);
    stmt.run(title,description,price,imageUrl,payload.id, function(err) {
      if(err) return res.status(400).json(err);
      res.json({id:this.lastID});
    });
  } catch (e) {
    res.status(401).json(e.message);
  }
});

// Serve client
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(process.argv[1]);
  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start app
initDB();
app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`));
