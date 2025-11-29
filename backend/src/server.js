import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDb, seedAdmin } from './db.js';
import authRoutes from './routes/auth.js';
import suppliersRoutes from './routes/suppliers.js';
import paymentsRoutes from './routes/payments.js';
import requestsRoutes from './routes/requests.js';
import notificationsRoutes from './routes/notifications.js';
import uploadsRoutes from './routes/uploads.js';

// Fix dotenv path for Windows compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve frontend static files from project root (one level up from backend)
const frontendPath = path.join(__dirname, '..', '..');
app.use(express.static(frontendPath));

// DB init and seed with error handling
(async () => {
  try {
    const db = await getDb();
    await seedAdmin(db);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Don't exit, let server start anyway
  }
})();

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'C4 Payments Backend', version: '0.1.0' });
});

app.use('/auth', authRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/payments', paymentsRoutes);
app.use('/requests', requestsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/uploads', uploadsRoutes);

// Static files for uploaded content
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/files', express.static(uploadsPath));

// Metrics endpoints with error handling
app.post('/metrics/visit', async (req, res, next) => {
  try {
    const db = await getDb();
    db.data.metrics = db.data.metrics || { siteVisits: 0 };
    db.data.metrics.siteVisits = Number(db.data.metrics.siteVisits || 0) + 1;
    await db.write();
    res.json({ visits: db.data.metrics.siteVisits });
  } catch (error) {
    next(error);
  }
});

app.get('/metrics', async (req, res, next) => {
  try {
    const db = await getDb();
    const visits = Number((db.data.metrics || {}).siteVisits || 0);
    const usersCount = Number((db.data.users || []).length);
    res.json({ visits, usersCount });
  } catch (error) {
    next(error);
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler - must have 4 parameters
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit in development, but log the error
});

// Handle port already in use
app.listen(port, () => {
  console.log(`C4 Payments backend listening on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${port} is already in use!`);
    console.error(`Please stop the existing server or use a different port.\n`);
    console.error('To stop existing server:');
    console.error(`  - Find process using port: netstat -ano | findstr :${port}`);
    console.error(`  - Kill process: taskkill /PID <process_id> /F\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
