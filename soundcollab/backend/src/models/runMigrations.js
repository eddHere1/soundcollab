const fs = require('fs');
const path = require('path');

/**
 * Applies incremental schema extensions after base schema.sql.
 * Each statement is isolated so partial failures on existing DBs are safe.
 */
async function runMigrations(pool) {
  const extPath = path.join(__dirname, 'schema_extensions.sql');
  const sql = fs.readFileSync(extPath, 'utf8');

  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      // Ignore duplicate column/table/constraint on re-run
      if (!['42701', '42P07', '42710'].includes(err.code)) {
        // pg-mem may not support some DDL — log and continue
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Migration skip: ${err.message?.slice(0, 80)}`);
        }
      }
    }
  }

  const relaxStatements = [
    `ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check`,
    `ALTER TABLE posts ALTER COLUMN type TYPE VARCHAR(30)`,
    `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`,
  ];

  for (const statement of relaxStatements) {
    try { await pool.query(statement); } catch { /* ignore */ }
  }

  try {
    await pool.query(`
      ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (
        type IN ('beat', 'song', 'loop', 'hook', 'sample_pack', 'drum_kit', 'service')
      )
    `);
  } catch { /* already exists */ }

  try {
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
        role IN ('artist', 'producer', 'both', 'engineer')
      )
    `);
  } catch { /* already exists */ }
}

module.exports = { runMigrations };
