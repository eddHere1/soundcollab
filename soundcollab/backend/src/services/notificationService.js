const pool = require('../config/db');

async function create({ userId, type, actorId, targetId, targetType, content = '' }) {
  if (userId === actorId) return null;
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, actor_id, target_id, target_type, content)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, type, actorId || null, targetId || null, targetType || null, content]
  );
  return result.rows[0];
}

async function list(userId, limit = 50) {
  const result = await pool.query(
    `SELECT n.*, u.username as actor_username, u.profile_image as actor_image
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function unreadCount(userId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
  return result.rows[0].count;
}

async function markRead(notificationId, userId) {
  const result = await pool.query(
    'UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
    [notificationId, userId]
  );
  return result.rows[0];
}

async function markAllRead(userId) {
  await pool.query(
    'UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
}

module.exports = { create, list, unreadCount, markRead, markAllRead };
