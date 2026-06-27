const pool = require('../config/db');

async function follow(followerId, followingId) {
  if (followerId === followingId) {
    throw { status: 400, message: 'Cannot follow yourself' };
  }

  const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [followingId]);
  if (!userCheck.rows.length) throw { status: 404, message: 'User not found' };

  await pool.query(
    'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [followerId, followingId]
  );
  return { following: true };
}

async function unfollow(followerId, followingId) {
  await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  return { following: false };
}

async function isFollowing(followerId, followingId) {
  const result = await pool.query(
    'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  return result.rows.length > 0;
}

async function getFollowers(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.bio
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getFollowing(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.bio
     FROM follows f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getFollowCounts(userId) {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM follows WHERE following_id = $1) as followers_count,
       (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count`,
    [userId]
  );
  return result.rows[0];
}

module.exports = {
  follow,
  unfollow,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowCounts,
};
