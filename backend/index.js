require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/items'));
app.use('/api', require('./routes/claims'));
app.use('/api', require('./routes/admin'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Serve the built React app in production/single-service deployments.
const distDir = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const MSG = {
  users_email_key: 'Email already registered',
  users_matric_no_key: 'Matric number already registered',
  claims_item_id_claimant_id_key: 'You have already submitted a claim for this item',
  one_pending_claim_per_item: 'Another claim is already pending for this item',
};
app.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(409).json({ error: MSG[err.constraint] || 'Conflict with an existing record' });
  if (err.code === '23503' || err.code === '23514' || err.name === 'MulterError')
    return res.status(400).json({ error: 'Invalid data' });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('API on http://localhost:' + PORT);
});
