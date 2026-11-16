const router = require('express').Router();
const { pool, tx, http } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.use('/admin', auth(), requireRole('admin'));

router.get('/admin/claims', async (req, res) => {
  const p = [], w = [];
  if (req.query.status) { p.push(req.query.status.toUpperCase()); w.push('c.status=$1'); }
  res.json((await pool.query(
    `SELECT c.id, c.status, c.created_at, i.id AS item_id, i.title, u.full_name AS claimant_name
     FROM claims c JOIN items i ON i.id=c.item_id JOIN users u ON u.id=c.claimant_id
     ${w.length ? 'WHERE ' + w.join(' AND ') : ''}
     ORDER BY (c.status='PENDING') DESC, c.created_at DESC`, p)).rows);
});

async function review(req, res, approve) {
  const reason = (req.body.reason || '').trim();
  if (!approve && !reason) throw http(400, 'A rejection reason is required');
  const result = await tx(async (c) => {
    const { rows: [cl] } = await c.query('SELECT * FROM claims WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!cl) throw http(404, 'Claim not found');
    if (cl.status !== 'PENDING') throw http(409, 'Claim already reviewed');
    const { rows: [u] } = await c.query(
      `UPDATE claims SET status=$1, rejection_reason=$2, reviewed_by=$3, reviewed_at=now()
       WHERE id=$4 RETURNING *`,
      [approve ? 'APPROVED' : 'REJECTED', approve ? null : reason, req.user.id, cl.id]);
    await c.query('UPDATE items SET status=$1 WHERE id=$2', [approve ? 'RETURNED' : 'OPEN', cl.item_id]);
    return u;
  });
  res.json(result);
}
router.patch('/admin/claims/:id/approve', (req, res) => review(req, res, true));
router.patch('/admin/claims/:id/reject', (req, res) => review(req, res, false));

router.get('/admin/items', async (req, res) => {
  res.json((await pool.query(
    `SELECT i.*, c.name AS category, u.full_name AS reporter FROM items i
     JOIN categories c ON c.id=i.category_id JOIN users u ON u.id=i.reported_by
     ORDER BY i.created_at DESC`)).rows);
});

router.patch('/admin/items/:id/archive', async (req, res) => {
  const { rows: [it] } = await pool.query(
    "UPDATE items SET status='ARCHIVED' WHERE id=$1 AND status<>'RETURNED' RETURNING *", [req.params.id]);
  if (!it) throw http(409, 'Item not found or already returned');   // D14
  res.json(it);
});

module.exports = router;
