import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';

import { getDb, seedAdmin } from './db.js';
import authRoutes from './routes/auth.js';
import suppliersRoutes from './routes/suppliers.js';
import paymentsRoutes from './routes/payments.js';
import requestsRoutes from './routes/requests.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve frontend static files from project root (one level up from backend)
app.use(express.static(path.join(process.cwd(), '..')));

// DB init and seed
(async () => {
  const db = await getDb();
  await seedAdmin(db);
})();

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'C4 Payments Backend', version: '0.1.0' });
});

app.use('/auth', authRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/payments', paymentsRoutes);
app.use('/requests', requestsRoutes);
app.use('/notifications', notificationsRoutes);

// Metrics endpoints
app.post('/metrics/visit', async (req, res) => {
  const db = await getDb();
  db.data.metrics = db.data.metrics || { siteVisits: 0 };
  db.data.metrics.siteVisits = Number(db.data.metrics.siteVisits || 0) + 1;
  await db.write();
  res.json({ visits: db.data.metrics.siteVisits });
});

app.get('/metrics', async (req, res) => {
  const db = await getDb();
  const visits = Number((db.data.metrics || {}).siteVisits || 0);
  const usersCount = Number((db.data.users || []).length);
  res.json({ visits, usersCount });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`C4 Payments backend listening on http://localhost:${port}`);
});