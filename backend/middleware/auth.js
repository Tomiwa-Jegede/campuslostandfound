const jwt = require('jsonwebtoken');
const auth = (required = true) => (req, res, next) => {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return required ? res.status(401).json({ error: 'Login required' }) : next();
  try { req.user = jwt.verify(t, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};
const requireRole = (role) => (req, res, next) =>
  req.user && req.user.role === role ? next() : res.status(403).json({ error: 'Not allowed' });
module.exports = { auth, requireRole };
