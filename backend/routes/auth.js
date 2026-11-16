const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, http } = require('../db');
const { auth } = require('../middleware/auth');
const sign = (u) => jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = (u) => ({ id: u.id, full_name: u.full_name, email: u.email, matric_no: u.matric_no, phone: u.phone, role: u.role });

router.post('/auth/register', async (req, res) => {
  let { matric_no, full_name, email, phone, password } = req.body;
  if (![matric_no, full_name, email, phone, password].every(Boolean)) throw http(400, 'All fields are required');
  matric_no = String(matric_no).trim().toLowerCase(); email = String(email).trim().toLowerCase();
  if (!new RegExp(process.env.MATRIC_REGEX).test(matric_no)) throw http(400, 'Invalid matric number format (e.g. run/cmp/24/17209)');
  if (!new RegExp('^\\d{5}@' + process.env.EMAIL_DOMAIN.replace(/\./g, '\\.') + '$').test(email)) throw http(400, 'Use your matric email, e.g. 17209@' + process.env.EMAIL_DOMAIN);
  if (email.split('@')[0] !== matric_no.split('/').pop()) throw http(400, 'Email must start with the last 5 digits of your matric number');
  if (password.length < 8) throw http(400, 'Password must be at least 8 characters');
  const hash = await bcrypt.hash(password, 10);
  const { rows: [u] } = await pool.query(
    `INSERT INTO users(matric_no, full_name, email, phone, password_hash)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [matric_no, full_name, email.toLowerCase(), phone, hash]);
  res.status(201).json({ token: sign(u), user: pub(u) });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows: [u] } = await pool.query('SELECT * FROM users WHERE email=$1', [(email || '').toLowerCase()]);
  if (!u || !(await bcrypt.compare(password || '', u.password_hash))) throw http(401, 'Wrong email or password');
  res.json({ token: sign(u), user: pub(u) });
});

router.get('/auth/me', auth(), async (req, res) => {
  const { rows: [u] } = await pool.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
  if (!u) throw http(401, 'Account not found');
  res.json(pub(u));
});

router.patch('/users/me', auth(), async (req, res) => {
  const { full_name, phone, password } = req.body;
  if (password && password.length < 8) throw http(400, 'Password must be at least 8 characters');
  const hash = password ? await bcrypt.hash(password, 10) : null;
  const { rows: [u] } = await pool.query(
    `UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone),
     password_hash=COALESCE($3,password_hash) WHERE id=$4 RETURNING *`,
    [full_name || null, phone || null, hash, req.user.id]);
  res.json(pub(u));
});

module.exports = router;
