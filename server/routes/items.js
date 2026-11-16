const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const { pool, http } = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (r, f, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(f.originalname)),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (r, f, cb) => cb(null, /^image\//.test(f.mimetype)),
});

const BASE = `SELECT i.*, c.name AS category, u.full_name AS reporter
  FROM items i JOIN categories c ON c.id=i.category_id JOIN users u ON u.id=i.reported_by`;

router.get('/categories', async (req, res) => {
  res.json((await pool.query('SELECT * FROM categories ORDER BY name')).rows);
});

router.get('/items', async (req, res) => {
  const { type, category, q, status } = req.query;
  const w = ["i.status<>'ARCHIVED'"], p = [];
  if (type) { p.push(type.toUpperCase()); w.push(`i.type=$${p.length}`); }
  if (category) { p.push(category); w.push(`i.category_id=$${p.length}`); }
  if (status) { p.push(status.toUpperCase()); w.push(`i.status=$${p.length}`); }
  if (q) { p.push(`%${q}%`); w.push(`(i.title ILIKE $${p.length} OR i.description ILIKE $${p.length})`); }
  res.json((await pool.query(`${BASE} WHERE ${w.join(' AND ')} ORDER BY i.created_at DESC`, p)).rows);
});

router.get('/items/mine', auth(), async (req, res) => {
  res.json((await pool.query(`${BASE} WHERE i.reported_by=$1 ORDER BY i.created_at DESC`, [req.user.id])).rows);
});

router.get('/items/:id', auth(false), async (req, res) => {
  const { rows: [item] } = await pool.query(`${BASE} WHERE i.id=$1`, [req.params.id]);
  if (!item || (item.status === 'ARCHIVED' && req.user?.role !== 'admin')) throw http(404, 'Item not found');
  if (req.user) {
    const { rows: [mine] } = await pool.query(
      'SELECT status FROM claims WHERE item_id=$1 AND claimant_id=$2', [item.id, req.user.id]);
    item.my_claim_status = mine ? mine.status : null;
  }
  if (item.status === 'RETURNED' && req.user) {   // D13: contacts only after approval
    const { rows: [cl] } = await pool.query(
      `SELECT c.claimant_id, f.full_name fn, f.email fe, f.phone fp,
              cu.full_name cn, cu.email ce, cu.phone cp
       FROM claims c JOIN items i ON i.id=c.item_id
       JOIN users f ON f.id=COALESCE(i.held_by,i.reported_by)
       JOIN users cu ON cu.id=c.claimant_id
       WHERE c.item_id=$1 AND c.status='APPROVED'`, [item.id]);
    if (cl && (req.user.role === 'admin' || req.user.id === cl.claimant_id || req.user.id === item.reported_by))
      item.contacts = {
        finder: { name: cl.fn, email: cl.fe, phone: cl.fp },
        claimant: { name: cl.cn, email: cl.ce, phone: cl.cp },
      };
  }
  res.json(item);
});

router.post('/items', auth(), requireRole('student'), upload.single('photo'), async (req, res) => {
  const { type, title, description, category_id, location, date_occurred } = req.body;
  if (!['LOST', 'FOUND'].includes(type)) throw http(400, 'type must be LOST or FOUND');
  if (![title, description, category_id, location, date_occurred].every(Boolean)) throw http(400, 'All fields are required');
  const { rows: [item] } = await pool.query(
    `INSERT INTO items(type,title,description,category_id,location,date_occurred,photo_path,reported_by,held_by)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [type, title, description, category_id, location, date_occurred,
     req.file ? '/uploads/' + req.file.filename : null, req.user.id, type === 'FOUND' ? req.user.id : null]);
  res.status(201).json(item);
});

router.patch('/items/:id', auth(), async (req, res) => {
  const { rows: [it] } = await pool.query('SELECT * FROM items WHERE id=$1', [req.params.id]);
  if (!it) throw http(404, 'Item not found');
  if (it.reported_by !== req.user.id) throw http(403, 'Not your report');
  const { rows: [{ n }] } = await pool.query('SELECT count(*)::int n FROM claims WHERE item_id=$1', [it.id]);
  if (n) throw http(409, 'Reports are locked after the first claim');   // D15
  const { title, description, category_id, location, date_occurred } = req.body;
  const { rows: [u] } = await pool.query(
    `UPDATE items SET title=COALESCE($1,title), description=COALESCE($2,description),
     category_id=COALESCE($3,category_id), location=COALESCE($4,location),
     date_occurred=COALESCE($5,date_occurred) WHERE id=$6 RETURNING *`,
    [title, description, category_id, location, date_occurred, it.id]);
  res.json(u);
});

module.exports = router;
