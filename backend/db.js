require('pg').types.setTypeParser(1082, (v) => v) // DATE stays 'YYYY-MM-DD', no timezone shift
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const http = (status, message) => Object.assign(new Error(message), { status });
async function tx(fn) {
  const c = await pool.connect();
  try { await c.query('BEGIN'); const r = await fn(c); await c.query('COMMIT'); return r; }
  catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { c.release(); }
}
module.exports = { pool, tx, http };
