const pool = require('../config/db');

/** Premium analytics prep — event tracking for creator dashboard */
async function trackEvent(userId, postId, eventType, metadata = {}) {
  await pool.query(
    `INSERT INTO creator_analytics (user_id, post_id, event_type, metadata)
     VALUES ($1, $2, $3, $4)`,
    [userId, postId || null, eventType, JSON.stringify(metadata)]
  );
}

async function getCreatorDashboard(userId) {
  const user = await pool.query(
    'SELECT plan_tier, username FROM users WHERE id = $1',
    [userId]
  );
  if (!user.rows.length) throw { status: 404, message: 'User not found' };

  const [posts, likes, sales, followers, plays] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS c FROM posts WHERE user_id = $1', [userId]),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM post_likes pl
       JOIN posts p ON p.id = pl.post_id WHERE p.user_id = $1`,
      [userId]
    ),
    pool.query(
      'SELECT COUNT(*)::int AS c, COALESCE(SUM(price), 0)::float AS revenue FROM beat_sales WHERE seller_id = $1',
      [userId]
    ),
    pool.query('SELECT COUNT(*)::int AS c FROM follows WHERE following_id = $1', [userId]),
    pool.query(
      `SELECT COUNT(*)::int AS c FROM creator_analytics
       WHERE user_id = $1 AND event_type = 'play'`,
      [userId]
    ),
  ]);

  const recentEvents = await pool.query(
    `SELECT event_type, metadata, created_at FROM creator_analytics
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
    [userId]
  );

  return {
    plan_tier: user.rows[0].plan_tier || 'free',
    username: user.rows[0].username,
    stats: {
      uploads: posts.rows[0].c,
      total_likes: likes.rows[0].c,
      sales_count: sales.rows[0].c,
      revenue: sales.rows[0].revenue,
      followers: followers.rows[0].c,
      plays: plays.rows[0].c,
    },
    recent_events: recentEvents.rows,
    premium_features: {
      boosted_uploads: user.rows[0].plan_tier !== 'free',
      analytics: user.rows[0].plan_tier !== 'free',
      monetization_dashboard: ['producer', 'label'].includes(user.rows[0].plan_tier),
    },
  };
}

module.exports = { trackEvent, getCreatorDashboard };
