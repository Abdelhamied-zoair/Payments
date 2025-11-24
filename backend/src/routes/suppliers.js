import express from 'express';
import { getDb } from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const { q, bank, dateFrom, dateTo } = req.query;
  const db = await getDb();
  let rows = db.data.suppliers;
  if (q) {
    const ql = String(q).toLowerCase();
    rows = rows.filter(s =>
      (s.name || '').toLowerCase().includes(ql) ||
      (s.phone || '').toLowerCase().includes(ql) ||
      (s.email || '').toLowerCase().includes(ql) ||
      (s.bank_name || '').toLowerCase().includes(ql) ||
      (s.tax_number || '').toLowerCase().includes(ql)
    );
  }
  if (bank) {
    const bl = String(bank).toLowerCase();
    rows = rows.filter(s => (s.bank_name || '').toLowerCase().includes(bl));
  }
  if (dateFrom) {
    const from = new Date(dateFrom);
    rows = rows.filter(s => new Date(s.created_at || Date.now()) >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo);
    rows = rows.filter(s => new Date(s.created_at || Date.now()) <= to);
  }
  rows = [...rows].sort((a, b) => b.id - a.id);
  return res.json(rows);
});

router.get('/:id', authRequired, async (req, res) => {
  const db = await getDb();
  const row = db.data.suppliers.find(s => s.id === Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Not found' });
  return res.json(row);
});

router.post('/', authRequired, async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    bank_name,
    iban,
    tax_number,
    // Accept camelCase variants from frontend
    bankName,
    ibanNumber,
    taxNumber,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const db = await getDb();
  const id = (db.data.suppliers.at(-1)?.id || 0) + 1;
  const supplier = {
    id,
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    bank_name: bank_name ?? bankName ?? null,
    iban: iban ?? ibanNumber ?? null,
    tax_number: tax_number ?? taxNumber ?? null,
    created_at: new Date().toISOString(),
  };
  db.data.suppliers.push(supplier);
  await db.write();
  return res.status(201).json(supplier);
});

router.put('/:id', authRequired, async (req, res) => {
  const { name, email, phone, address, bank_name, iban, tax_number, bankName, ibanNumber, taxNumber } = req.body;
  const db = await getDb();
  const idx = db.data.suppliers.findIndex(s => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const existing = db.data.suppliers[idx];
  const updated = {
    ...existing,
    name: name ?? existing.name,
    email: email ?? existing.email,
    phone: phone ?? existing.phone,
    address: address ?? existing.address,
    bank_name: bank_name ?? bankName ?? existing.bank_name,
    iban: iban ?? ibanNumber ?? existing.iban,
    tax_number: tax_number ?? taxNumber ?? existing.tax_number,
  };
  db.data.suppliers[idx] = updated;
  await db.write();
  return res.json(updated);
});

router.delete('/:id', authRequired, async (req, res) => {
  const db = await getDb();
  const before = db.data.suppliers.length;
  db.data.suppliers = db.data.suppliers.filter(s => s.id !== Number(req.params.id));
  if (db.data.suppliers.length === before) return res.status(404).json({ error: 'Not found' });
  await db.write();
  // Cascade delete requests and payments related to supplier
  db.data.requests = db.data.requests.filter(r => r.supplier_id !== Number(req.params.id));
  db.data.payments = db.data.payments.filter(p => p.supplier_id !== Number(req.params.id));
  await db.write();
  return res.json({ success: true });
});

export default router;