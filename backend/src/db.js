import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSONFilePreset } from 'lowdb/node';
import bcrypt from 'bcryptjs';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for data directory
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

// Ensure data directory exists
const ensureDataDir = () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating data directory:', error);
    return false;
  }
};

export async function getDb() {
  try {
    // Ensure data directory exists
    if (!ensureDataDir()) {
      throw new Error('Failed to create data directory');
    }

    // Initialize database with default structure
    const defaultData = {
      users: [],
      suppliers: [],
      requests: [],
      payments: [],
      notifications: [],
      metrics: { siteVisits: 0 }
    };

    // Try to read existing data or create new file
    let db;
    try {
      db = await JSONFilePreset(dbPath, defaultData);
    } catch (error) {
      console.error('Error initializing database:', error);
      // If file is corrupted, try to create a new one
      try {
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
        db = await JSONFilePreset(dbPath, defaultData);
      } catch (writeError) {
        console.error('Failed to create new database file:', writeError);
        throw new Error('Failed to initialize database');
      }
    }

    // Ensure all required collections exist
    db.data = {
      users: Array.isArray(db.data?.users) ? db.data.users : [],
      suppliers: Array.isArray(db.data?.suppliers) ? db.data.suppliers : [],
      requests: Array.isArray(db.data?.requests) ? db.data.requests : [],
      payments: Array.isArray(db.data?.payments) ? db.data.payments : [],
      notifications: Array.isArray(db.data?.notifications) ? db.data.notifications : [],
      metrics: db.data?.metrics && typeof db.data.metrics === 'object' 
        ? { ...defaultData.metrics, ...db.data.metrics }
        : { ...defaultData.metrics }
    };

    // Try to write, but don't fail if directory doesn't exist yet
    try {
      await db.write();
    } catch (writeError) {
      // If write fails, ensure directory exists and try again
      if (writeError.code === 'ENOENT') {
        ensureDataDir();
        try {
          await db.write();
        } catch (retryError) {
          console.warn('Database write warning:', retryError.message);
          // Continue anyway - data is in memory
        }
      } else {
        console.warn('Database write warning:', writeError.message);
      }
    }
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error; // Re-throw to be handled by the caller
  }
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
