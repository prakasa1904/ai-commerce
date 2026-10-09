import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, get, all, run, now } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'farm-marketplace-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user) {
  const payload = {
    id: user.id,
    username: user.username || user.name,
    email: user.email,
    role: user.role,
    isAdmin: Boolean(user.isAdmin ?? user.is_admin),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function parseUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username || row.name,
    name: row.name,
    email: row.email,
    role: row.role,
    isAdmin: Boolean(row.is_admin),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

export async function findActiveUserByEmail(email) {
  const row = await get(
    `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`,
    [email]
  );
  return parseUser(row);
}

export function getTokenFromRequest(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function sanitizeUser(row) {
  const user = parseUser(row);
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const { username, email, password, role = 'buyer' } = req.body || {};
  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username, email and a password of at least 6 characters are required.' });
  }
  const existing = await get(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const ts = now();
  const result = await run(
    `INSERT INTO users (username, name, email, password, role, is_admin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    [username, username, email, hashPassword(password), role, ts, ts]
  );
  const user = await findActiveUserByEmail(email);
  const token = signToken(user);
  res.status(201).json({ user: sanitizeUser(user), token });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = await findActiveUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'No account with this email.' });
  const row = await get(`SELECT * FROM users WHERE id = ?`, [user.id]);
  if (!verifyPassword(password, row.password)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  const token = signToken(user);
  res.json({ user: sanitizeUser(user), token });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await findActiveUserByEmail(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const shops = await all(
    `SELECT s.id, s.name, s.owner_id AS "ownerId" FROM shops s WHERE s.owner_id = ? AND s.deleted_at IS NULL`,
    [user.id]
  );
  res.json({ user: sanitizeUser(user), shops });
});