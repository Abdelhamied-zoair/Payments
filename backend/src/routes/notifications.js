import express from 'express';
import { getDb } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { nextId } from '../utils/common.js';

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const { status, type, q } = req.query;
    const db = await getDb();
    let rows = db.data.notifications || [];
    if (status) rows = rows.filter(n => String(n.status) === String(status));
    if (type) rows = rows.filter(n => String(n.type) === String(type));
    if (q) {
      const ql = String(q).toLowerCase();
      rows = rows.filter(n => (
        (n.title||'').toLowerCase().includes(ql) ||
        (n.from||'').toLowerCase().includes(ql)
      ));
    }
    rows = [...rows].sort((a,b) => {
      const ad = new Date(a.created_at||0).getTime();
      const bd = new Date(b.created_at||0).getTime();
      if (bd !== ad) return bd - ad;
      return Number(b.id||0) - Number(a.id||0);
    });
    return res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { type, title, data, request_id, supplier_id } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });
    const db = await getDb();
    db.data.notifications = Array.isArray(db.data.notifications) ? db.data.notifications : [];
    const id = nextId(db.data.notifications);
    const row = {
      id,
      type,
      title: title || null,
      data: data || null,
      request_id: request_id || null,
      supplier_id: supplier_id || null,
      status: 'pending',
      from: req.user?.email || req.user?.username || 'system',
      created_at: new Date().toISOString(),
    };
    db.data.notifications.push(row);
    await db.write();
    return res.status(201).json(row);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const { decision } = req.body;
    const db = await getDb();
    if (!db.data.notifications) db.data.notifications = [];
    const idx = db.data.notifications.findIndex(n => n.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const notif = db.data.notifications[idx];
    if (!['accept','reject'].includes(String(decision))) return res.status(400).json({ error: 'decision must be accept or reject' });
    let updated = { ...notif, status: decision === 'accept' ? 'approved' : 'rejected', decided_at: new Date().toISOString(), decided_by: req.user?.email || req.user?.username };
    if (decision === 'accept') {
      if (notif.type === 'supplier') {
        if (!notif.supplier_id) {
          if (!db.data.suppliers) db.data.suppliers = [];
          const sid = nextId(db.data.suppliers);
          const s = { id: sid, created_at: new Date().toISOString(), ...(notif.data||{}) };
          db.data.suppliers.push(s);
          updated = { ...updated, supplier_id: sid };
        }
      } else if (notif.type === 'request') {
        if (notif.request_id) {
          if (!db.data.requests) db.data.requests = [];
          const ridx = db.data.requests.findIndex(r => r.id === Number(notif.request_id));
          if (ridx !== -1) {
            db.data.requests[ridx] = { ...db.data.requests[ridx], status: 'accepted' };
          }
        } else if (notif.data) {
          if (!db.data.requests) db.data.requests = [];
          const rid = nextId(db.data.requests);
          const r = { id: rid, created_at: new Date().toISOString(), status: 'accepted', ...(notif.data||{}) };
          db.data.requests.push(r);
          updated = { ...updated, request_id: rid };
        }
      }
    }
    db.data.notifications[idx] = updated;
    await db.write();
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
