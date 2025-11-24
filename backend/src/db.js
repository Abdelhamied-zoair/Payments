import fs from 'fs';
import path from 'path';
import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'backend', 'data');
const dbPath = path.join(dataDir, 'db.json');

export async function getDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const db = await JSONFilePreset(dbPath, {
    users: [],
    suppliers: [],
    requests: [],
    payments: [],
    notifications: [],
    metrics: { siteVisits: 0 }
  });
  return db;
}

export async function seedAdmin(db) {
  const allowed = [
    { email: 'anas@c4.sa', username: 'anas', role: 'admin' },
    { email: 'abdelhamid@c4.sa', username: 'abdelhamid', role: 'superuser' },
    { email: 'corecode@c4.sa', username: 'corecode', role: 'user' },
  ];
  const pass = 'admin789';
  const password_hash = bcrypt.hashSync(pass, 10);
  // Replace any existing users with allowed list only
  db.data.users = allowed.map((u, idx) => ({
    id: idx + 1,
    username: u.username,
    email: u.email,
    role: u.role,
    password_hash,
    created_at: new Date().toISOString(),
  }));
  await db.write();
}