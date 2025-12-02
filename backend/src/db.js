import bcrypt from 'bcryptjs';

// In-memory database stub (no disk persistence)

export async function getDb() {
  const defaultData = {
    users: [],
    suppliers: [],
    requests: [],
    payments: [],
    notifications: [],
    metrics: { siteVisits: 0 }
  };
  const db = {
    data: defaultData,
    write: async () => {}
  };
  return db;
}

export async function seedAdmin(db) {
  db.data.users = [];
  await db.write();
}
