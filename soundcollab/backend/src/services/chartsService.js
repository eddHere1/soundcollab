const pool = require('../config/db');

/** Charts and trending aggregates for the platform discovery page */
async function getTrendingArtists(limit = 10) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.genres,
            COUNT(DISTINCT p.id)::int AS track_count,
            COALESCE(SUM(lc.cnt), 0)::int AS total_likes
     FROM users u
     LEFT JOIN posts p ON p.user_id = u.id
     LEFT JOIN (
       SELECT post_id, COUNT(*)::int AS cnt FROM post_likes GROUP BY post_id
     ) lc ON lc.post_id = p.id
     GROUP BY u.id
     ORDER BY total_likes DESC, track_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getTrendingBeats(limit = 10) {
  const result = await pool.query(
    `SELECT p.*, u.username, u.profile_image,
            COALESCE(lc.cnt, 0)::int AS likes_count
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN (
       SELECT post_id, COUNT(*)::int AS cnt FROM post_likes GROUP BY post_id
     ) lc ON lc.post_id = p.id
     WHERE p.type IN ('beat', 'loop', 'hook', 'drum_kit')
     ORDER BY COALESCE(lc.cnt, 0) DESC, p.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getFastestGrowingCreators(limit = 10) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role,
            COUNT(DISTINCT f.id)::int AS new_followers
     FROM users u
     JOIN follows f ON f.following_id = u.id
     WHERE f.created_at > NOW() - INTERVAL '30 days'
     GROUP BY u.id
     ORDER BY new_followers DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getMostActiveCollaborators(limit = 10) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role,
            COUNT(DISTINCT cr.id)::int AS collab_count
     FROM users u
     JOIN collab_requests cr ON cr.requester_id = u.id OR cr.post_id IN (
       SELECT id FROM posts WHERE user_id = u.id
     )
     GROUP BY u.id
     ORDER BY collab_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getNewArtists(limit = 10) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.profile_image, u.role, u.genres, u.created_at,
            COUNT(p.id)::int AS track_count
     FROM users u
     LEFT JOIN posts p ON p.user_id = u.id
     WHERE u.created_at > NOW() - INTERVAL '60 days'
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = {
  getTrendingArtists,
  getTrendingBeats,
  getFastestGrowingCreators,
  getMostActiveCollaborators,
  getNewArtists,
};
