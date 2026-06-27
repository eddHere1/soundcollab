const pool = require('../config/db');

const OPPORTUNITY_TYPES = [
  'need_rapper',
  'need_producer',
  'need_engineer',
  'open_verse',
  'paid_feature',
];

async function list({ type, isPaid, genre, status = 'open', limit = 20, offset = 0 }) {
  const conditions = ['o.status = $1'];
  const params = [status];
  let i = 2;

  if (type) {
    conditions.push(`o.type = $${i++}`);
    params.push(type);
  }
  if (isPaid === 'true') {
    conditions.push('o.is_paid = true');
  } else if (isPaid === 'false') {
    conditions.push('o.is_paid = false');
  }
  if (genre) {
    conditions.push(`$${i++} = ANY(o.genre_tags)`);
    params.push(genre);
  }

  params.push(limit, offset);
  const result = await pool.query(
    `SELECT o.*, u.username, u.profile_image, u.role AS user_role
     FROM opportunities o
     JOIN users u ON u.id = o.user_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return result.rows;
}

async function create(userId, data) {
  const { type, title, description, genre_tags, mood, is_paid, budget, tags, post_id } = data;
  if (!OPPORTUNITY_TYPES.includes(type)) {
    throw { status: 400, message: 'Invalid opportunity type' };
  }
  const result = await pool.query(
    `INSERT INTO opportunities (
      user_id, type, title, description, genre_tags, mood, is_paid, budget, tags, post_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      userId, type, title, description || '', genre_tags || [], mood || null,
      is_paid || false, budget || null, tags || [], post_id || null,
    ]
  );
  return result.rows[0];
}

async function getById(id) {
  const result = await pool.query(
    `SELECT o.*, u.username, u.profile_image, u.role AS user_role
     FROM opportunities o JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function close(id, userId) {
  const result = await pool.query(
    `UPDATE opportunities SET status = 'closed'
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  if (!result.rows.length) throw { status: 404, message: 'Opportunity not found' };
  return result.rows[0];
}

module.exports = { OPPORTUNITY_TYPES, list, create, getById, close };
