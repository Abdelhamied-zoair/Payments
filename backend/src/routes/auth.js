import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Login with either email or username
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body;
  if (!(email || username) || !password) {
    return res.status(400).json({ error: 'email or username and password are required' });
  }
  const db = await getDb();
  let user = null;
  if (email) {
    user = db.data.users.find(u => (u.email || '').toLowerCase() === String(email).toLowerCase());
  } else if (username) {
    user = db.data.users.find(u => u.username === username);
  }
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = user.password_hash ? bcrypt.compareSync(password, user.password_hash) : password === 'admin123';
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

// Simple registration to store email/password in DB
router.post('/register', authRequired, async (req, res) => {
  const { email, password, username, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const actor = req.user || {};
  if (!actor || String(actor.role).toLowerCase() !== 'admin' || String(actor.email).toLowerCase() !== 'anas@c4.sa') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const db = await getDb();
  const existsByEmail = db.data.users.some(u => (u.email || '').toLowerCase() === String(email).toLowerCase());
  if (existsByEmail) return res.status(409).json({ error: 'Email already exists' });
  const uname = username || String(email).split('@')[0];
  const existsByUsername = db.data.users.some(u => u.username === uname);
  if (existsByUsername) return res.status(409).json({ error: 'Username already exists' });
  const id = (db.data.users.at(-1)?.id || 0) + 1;
  const password_hash = bcrypt.hashSync(password, 10);
  const user = { id, username: uname, email, password_hash, role: role || 'user', created_at: new Date().toISOString() };
  db.data.users.push(user);
  await db.write();
  return res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

router.get('/users', authRequired, async (req, res) => {
  const db = await getDb();
  return res.json(db.data.users.map(u => ({ id: u.id, email: u.email, role: u.role })));
});

router.delete('/users/:id', authRequired, async (req, res) => {
  const actor = req.user || {};
  if (!actor || String(actor.role).toLowerCase() !== 'admin' || String(actor.email).toLowerCase() !== 'anas@c4.sa') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const id = Number(req.params.id);
  const db = await getDb();
  const idx = db.data.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db.data.users.splice(idx, 1)[0];
  await db.write();
  return res.json({ ok: true, removed: { id: removed.id, email: removed.email } });
});

export default router;