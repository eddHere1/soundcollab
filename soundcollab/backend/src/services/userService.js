const pool = require('../config/db');
const User = require('../models/User');

async function getUserById(id) {
  const row = await User.findById(id);
  return User.serialize(row);
}

async function updateUser(id, data) {
  const row = await User.update(id, data);
  if (!row) throw { status: 404, message: 'User not found' };
  return User.serialize(row);
}

async function searchUsers(query, { role, limit = 20 } = {}) {
  return User.search(query, limit, role);
}

async function getSuggestedCreators(userId, limit = 8) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.genres,
            COUNT(DISTINCT p.id)::int AS track_count
     FROM users u
     LEFT JOIN posts p ON p.user_id = u.id
     WHERE u.id != $1
       AND u.id NOT IN (SELECT following_id FROM follows WHERE follower_id = $1)
     GROUP BY u.id
     ORDER BY track_count DESC, u.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map(User.serialize);
}

async function getUserStats(userId) {
  const [posts, likes, collabs, sales] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS c FROM posts WHERE user_id = $1', [userId]),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM post_likes pl JOIN posts p ON p.id = pl.post_id WHERE p.user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM collab_requests cr
       JOIN posts p ON p.id = cr.post_id WHERE p.user_id = $1 OR cr.requester_id = $1`,
      [userId]
    ),
    pool.query(
      'SELECT COUNT(*)::int AS c, COALESCE(SUM(price),0)::float AS revenue FROM beat_sales WHERE seller_id = $1',
      [userId]
    ),
  ]);

  const badges = [];
  if (posts.rows[0].c >= 5) badges.push('prolific');
  if (likes.rows[0].c >= 20) badges.push('trending');
  if (sales.rows[0].c >= 1) badges.push('seller');
  if (collabs.rows[0].c >= 3) badges.push('collaborator');

  return {
    uploads: posts.rows[0].c,
    total_likes: likes.rows[0].c,
    collabs: collabs.rows[0].c,
    sales: sales.rows[0].c,
    revenue: sales.rows[0].revenue,
    badges,
  };
}

module.exports = { getUserById, updateUser, searchUsers, getSuggestedCreators, getUserStats };
