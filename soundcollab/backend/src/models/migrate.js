const pool = require('../config/db');

async function migrate() {
  try {
    await pool.initDb();
    console.log(`Database ready (${pool.getDbMode()}).`);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
