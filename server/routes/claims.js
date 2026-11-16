const router = require('express').Router();
const { pool, tx, http } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

router.post('/items/:id/claims', auth(), requireRole('student'), async (req, res) => {
  const { proof_text, serial_number } = req.body;
  if (!proof_text || proof_text.trim().length < 30) throw http(400, 'Proof must be at least 30 characters');
  const claim = await tx(async (c) => {
    const { rows: [it] } = await c.query('SELECT * FROM items WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!it) throw http(404, 'Item not found');
    if (it.type !== 'FOUND') throw http(400, 'Only found items can be claimed');
    if (it.reported_by === req.user.id) throw http(403, 'You cannot claim your own report');
    if (it.status !== 'OPEN') throw http(409, 'This item is not open for claims');
    const { rows: [cl] } = await c.query(
      `INSERT INTO claims(item_id, claimant_id, proof_text, serial_number)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [it.id, req.user.id, proof_text.trim(), serial_number || null]);
    await c.query("UPDATE items SET status='CLAIM_PENDING' WHERE id=$1", [it.id]);
    return cl;
  });
  res.status(201).json(claim);
});

router.get('/claims/mine', auth(), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, i.title, i.status AS item_status, i.type AS item_type,
            i.location, i.category_id, i.photo_path, i.date_occurred,
            f.full_name AS finder_name, f.email AS finder_email, f.phone AS finder_phone
     FROM claims c JOIN items i ON i.id=c.item_id
     LEFT JOIN users f ON f.id=COALESCE(i.held_by,i.reported_by)
     WHERE c.claimant_id=$1 ORDER BY c.created_at DESC`,
    [req.user.id]);
  res.json(rows.map((c) => {
    if (c.status === 'APPROVED') {
      c.finder_contact = { name: c.finder_name, email: c.finder_email, phone: c.finder_phone };
    }
    return c;
  }));
});

router.get('/claims/:id', auth(), async (req, res) => {
  const { rows: [c] } = await pool.query(
    `SELECT c.*, i.title, i.description, i.location, i.date_occurred, i.photo_path,
            i.status AS item_status, i.reported_by,
            cu.full_name AS claimant_name, cu.email AS claimant_email, cu.phone AS claimant_phone,
            f.full_name AS finder_name, f.email AS finder_email, f.phone AS finder_phone
     FROM claims c JOIN items i ON i.id=c.item_id
     JOIN users cu ON cu.id=c.claimant_id
     JOIN users f ON f.id=COALESCE(i.held_by,i.reported_by)
     WHERE c.id=$1`, [req.params.id]);
  if (!c) throw http(404, 'Claim not found');
  if (req.user.role !== 'admin' && req.user.id !== c.claimant_id) throw http(403, 'Not allowed');
  if (c.status !== 'APPROVED' && req.user.role !== 'admin') {   // hide finder contact
    delete c.finder_email; delete c.finder_phone;
  }
  if (req.user.role !== 'admin') { delete c.claimant_email; delete c.claimant_phone; }
  if (c.status === 'APPROVED') {
    c.finder_contact = { name: c.finder_name, email: c.finder_email, phone: c.finder_phone };
  }
  res.json(c);
});

module.exports = router;
