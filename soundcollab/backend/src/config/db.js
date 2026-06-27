require('dotenv').config();
const fs = require('fs');
const path = require('path');

let _pool = null;
let dbMode = 'unknown';


const { runMigrations } = require('../models/runMigrations');

async function applySchema(pool, schema) {
  await pool.query(schema);
  await runMigrations(pool);
}

async function initDb() {
  const schemaPath = path.join(__dirname, '../models/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const useMemory =
    process.env.USE_IN_MEMORY_DB === 'true' ||
    process.env.DATABASE_URL === 'memory';

  if (useMemory) {
    _pool = await createMemoryPool(schema);
    dbMode = 'memory';
    console.log('Using in-memory database (pg-mem)');
    return _pool;
  }

  const { Pool } = require('pg');
  const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pgPool.connect();
    await applySchema(client, schema);
    client.release();
    _pool = pgPool;
    dbMode = 'postgres';
    console.log('Connected to PostgreSQL');
    return _pool;
  } catch (err) {
    await pgPool.end().catch(() => {});
    console.warn(`PostgreSQL unavailable (${err.message}). Using in-memory database.`);
    _pool = await createMemoryPool(schema);
    dbMode = 'memory';
    return _pool;
  }
}

async function createMemoryPool(schema) {
  const { newDb } = require('pg-mem');
  const mem = newDb();
  mem.public.none(schema);
  const { Pool } = mem.adapters.createPg();
  const pool = new Pool();
  await runMigrations(pool);
  return pool;
}

function getPool() {
  if (!_pool) throw new Error('Database not initialized. Call initDb() first.');
  return _pool;
}

module.exports = {
  initDb,
  getDbMode: () => dbMode,
  query: (...args) => getPool().query(...args),
  connect: (...args) => getPool().connect(...args),
  on: (event, handler) => getPool().on(event, handler),
};
