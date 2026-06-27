const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const ROLES = ['artist', 'producer', 'both', 'engineer'];

/** Strip password hash and normalize user for API responses */
function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    bio: row.bio || '',
    profile_image: row.profile_image || '',
    role: row.role,
    genres: row.genres || [],
    location: row.location || null,
    plan_tier: row.plan_tier || 'free',
    banner_image: row.banner_image || '',
    badges: row.badges || [],
    created_at: row.created_at,
  };
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findByUsernameOrEmail(username, email) {
  const result = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );
  return result.rows[0] || null;
}

async function create({ username, email, password, role = 'artist', genres = [], location = null }) {
  if (!ROLES.includes(role)) {
    throw { status: 400, message: 'Role must be artist, producer, or both' };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (username, email, password_hash, role, genres, location)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [username, email, passwordHash, role, genres, location]
  );
  return result.rows[0];
}

async function verifyPassword(row, password) {
  return bcrypt.compare(password, row.password_hash);
}

async function update(id, data) {
  const fieldMap = {
    bio: 'bio',
    role: 'role',
    genres: 'genres',
    location: 'location',
    profile_image: 'profile_image',
    banner_image: 'banner_image',
  };

  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      if (key === 'role' && !ROLES.includes(data[key])) {
        throw { status: 400, message: 'Role must be artist, producer, or both' };
      }
      fields.push(`${column} = $${i++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function search(query, limit = 20, role = null) {
  let sql = `SELECT id, username, bio, profile_image, role, genres, location, created_at
     FROM users WHERE (username ILIKE $1 OR bio ILIKE $1)`;
  const params = [`%${query}%`];
  if (role) {
    sql += ` AND role = $${params.length + 1}`;
    params.push(role);
  }
  sql += ` ORDER BY username LIMIT $${params.length + 1}`;
  params.push(limit);
  const result = await pool.query(sql, params);
  return result.rows.map(serialize);
}

module.exports = {
  ROLES,
  serialize,
  findById,
  findByEmail,
  findByUsernameOrEmail,
  create,
  verifyPassword,
  update,
  search,
};
